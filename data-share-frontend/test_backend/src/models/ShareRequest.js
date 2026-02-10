// models/ShareRequest.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const ShareRequest = sequelize.define(
  "ShareRequest",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    datasetId: { type: DataTypes.INTEGER, allowNull: false },

    requesterId: { type: DataTypes.INTEGER, allowNull: false }, // 用户1
    ownerId: { type: DataTypes.INTEGER, allowNull: false },     // 用户2(数据拥有者)

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },

    message: { type: DataTypes.STRING(500), allowNull: true },

    decidedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "share_requests",
    timestamps: true,
    indexes: [
      // 防止同一个人对同一个数据集重复发请求（允许历史记录的话可以去掉或改复杂）
      { unique: true, fields: ["datasetId", "requesterId"] },
      { fields: ["ownerId", "status"] },
      { fields: ["requesterId", "status"] },
    ],
  }
);
