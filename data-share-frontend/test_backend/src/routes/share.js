import express from "express";
import fs from "fs";
import path from "path";
import { ShareRequest } from "../models/ShareRequest.js";
import { Dataset } from "../models/dataset.js";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js"; // 你需要有这个

export const shareRouter = express.Router();

/**
 * 用户1：请求共享
 * POST /api/shares/requests
 * body: { datasetId, message? }
 */
shareRouter.post("/requests", authRequired, async (req, res) => {
  const requesterId = req.user.id;
  const { datasetId, message } = req.body;

  if (!datasetId) return res.status(400).json({ message: "缺少 datasetId" });

  const ds = await Dataset.findByPk(datasetId);
  if (!ds) return res.status(404).json({ message: "数据集不存在" });

  // 不允许向自己申请
  if (ds.ownerId === requesterId) {
    return res.status(400).json({ message: "不能向自己请求共享" });
  }

  // 如果已有 pending/approved 请求，阻止重复（即使你移除了 unique，也建议保留）
  const existed = await ShareRequest.findOne({
    where: { datasetId, requesterId, ownerId: ds.ownerId, status: ["pending", "approved"] },
  });
  if (existed) {
    return res.status(400).json({ message: "已提交请求或已获批准" });
  }

  // create
  try {
    const sr = await ShareRequest.create({
      datasetId,
      requesterId,
      ownerId: ds.ownerId,
      message: message || null,
    });
    return res.json({ request: sr });
  } catch (e) {
    // 如果你保留 unique index，重复提交会走这里
    return res.status(400).json({ message: "请求已存在或创建失败" });
  }
});

/**
 * 用户2：查看收到的请求（默认 pending）
 * GET /api/shares/incoming?status=pending
 */
shareRouter.get("/incoming", authRequired, async (req, res) => {
  const ownerId = req.user.id;
  const status = req.query.status || "pending";

  const rows = await ShareRequest.findAll({
    where: { ownerId, status },
    order: [["createdAt", "DESC"]],
    include: [
      { model: Dataset, as: "dataset" },
      { model: User, as: "requester", attributes: ["id", "username"] },
    ],
  });

  res.json({ incoming: rows });
});

/**
 * 用户2：批准/拒绝
 * PATCH /api/shares/requests/:id
 * body: { status: "approved"|"rejected" }
 */
shareRouter.patch("/requests/:id", authRequired, async (req, res) => {
  const ownerId = req.user.id;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "status 必须是 approved 或 rejected" });
  }

  const sr = await ShareRequest.findByPk(req.params.id);
  if (!sr) return res.status(404).json({ message: "请求不存在" });
  if (sr.ownerId !== ownerId) return res.status(403).json({ message: "无权限操作该请求" });
  if (sr.status !== "pending") return res.status(400).json({ message: "请求已处理" });

  sr.status = status;
  sr.decidedAt = new Date();
  await sr.save();

  res.json({ request: sr });
});

/**
 * 用户1：查看共享给我的（approved）
 * GET /api/shares/shared-with-me
 */
shareRouter.get("/shared-with-me", authRequired, async (req, res) => {
  const requesterId = req.user.id;

  const rows = await ShareRequest.findAll({
    where: { requesterId, status: "approved" },
    order: [["updatedAt", "DESC"]],
    include: [
      { model: Dataset, as: "dataset", include: [{ model: User, as: "owner", attributes: ["id", "username"] }] },
    ],
  });

  res.json({ sharedWithMe: rows });
});

/**
 * 下载：owner 或 approved 的 requester 才能下载
 * GET /api/shares/download/:datasetId
 */
shareRouter.get("/download/:datasetId", authRequired, async (req, res) => {
  const userId = req.user.id;
  const datasetId = Number(req.params.datasetId);

  const ds = await Dataset.findByPk(datasetId, { include: [{ model: User, as: "owner" }] });
  if (!ds) return res.status(404).json({ message: "数据集不存在" });

  const isOwner = ds.ownerId === userId;

  const approved = await ShareRequest.findOne({
    where: { datasetId, requesterId: userId, ownerId: ds.ownerId, status: "approved" },
  });

  if (!isOwner && !approved) {
    return res.status(403).json({ message: "无下载权限" });
  }

  // ⚠️ 这里的 filePath 字段名要与你 Dataset 模型一致！
  // 你上传时保存到哪个字段，就用哪个字段。
  const filePath = ds.filePath || ds.path || ds.url; // 你需要改成真实字段
  if (!filePath) return res.status(404).json({ message: "数据集未记录文件路径" });
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: "文件不存在" });

  res.download(filePath, path.basename(filePath));
});
