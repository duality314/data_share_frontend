import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { Dataset } from "../models/dataset.js";
import { DownloadLog } from "../models/DownloadLog.js";
import { authRequired } from "../middleware/auth.js";
import { config } from "../config.js";
import { readFirstLines } from "../utils/preview.js";

export const datasetsRouter = express.Router();

function ensureUploadDir() {
  if (!fs.existsSync(config.uploadDir)) fs.mkdirSync(config.uploadDir, { recursive: true });
}
ensureUploadDir();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadDir);
  },
  filename: function (req, file, cb) {
    const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } }); // 200MB demo上限

// 上传登记（数据登记页）
datasetsRouter.post("/", authRequired, upload.single("file"), async (req, res) => {
  const { name, description, domain, dataType } = req.body || {};
  if (!req.file) return res.status(400).json({ message: "file required" });
  if (!name) return res.status(400).json({ message: "name required" });

  const dataset = await Dataset.create({
    name,
    description: description || "",
    domain: domain || "general",
    dataType: dataType || "file",
    filePath: req.file.path,
    fileSize: req.file.size,
    isListed: false,
    downloads: 0,
    ownerId: req.user.id
  });

  return res.json({ dataset });
});

// 我的数据：我上传的
datasetsRouter.get("/mine", authRequired, async (req, res) => {
  const owned = await Dataset.findAll({
    where: { ownerId: req.user.id },
    order: [["createdAt", "DESC"]]
  });
  return res.json({ owned });
});

// 数据市场：列出所有上架
datasetsRouter.get("/market", async (req, res) => {
  const { domain, sort } = req.query || {};
  const where = { isListed: true };
  if (domain) where.domain = domain;

  const order =
    sort === "downloads" ? [["downloads", "DESC"]] :
    sort === "size" ? [["fileSize", "DESC"]] :
    [["createdAt", "DESC"]];

  const list = await Dataset.findAll({ where, order, limit: 200 });
  return res.json({ list });
});

// 数据详情 + 前10行预览
datasetsRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  const ds = await Dataset.findByPk(id);
  if (!ds) return res.status(404).json({ message: "not found" });

  // 仅上架可看；如果你想允许“owner下架也能看”，可以加token校验，这里先简单：
  if (!ds.isListed) return res.status(403).json({ message: "not listed" });

  const previewLines = await readFirstLines(ds.filePath, 10);
  return res.json({
    dataset: {
      id: ds.id,
      name: ds.name,
      description: ds.description,
      domain: ds.domain,
      dataType: ds.dataType,
      fileSize: ds.fileSize,
      downloads: ds.downloads,
      isListed: ds.isListed,
      createdAt: ds.createdAt
    },
    previewLines
  });
});

// 上架/下架（我的数据页面开关）
datasetsRouter.patch("/:id/listing", authRequired, async (req, res) => {
  const id = req.params.id;
  const { isListed } = req.body || {};
  const ds = await Dataset.findByPk(id);
  if (!ds) return res.status(404).json({ message: "not found" });
  if (ds.ownerId !== req.user.id) return res.status(403).json({ message: "not owner" });

  ds.isListed = !!isListed;
  await ds.save();
  return res.json({ dataset: ds });
});

// 下载（暂不做交易，只记录日志）
datasetsRouter.get("/:id/download", authRequired, async (req, res) => {
  const id = req.params.id;
  const ds = await Dataset.findByPk(id);
  if (!ds) return res.status(404).json({ message: "not found" });
  if (!ds.isListed && ds.ownerId !== req.user.id) return res.status(403).json({ message: "not allowed" });

  await DownloadLog.create({ userId: req.user.id, datasetId: ds.id });
  ds.downloads += 1;
  await ds.save();

  const filename = path.basename(ds.filePath);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.sendFile(path.resolve(ds.filePath));
});
