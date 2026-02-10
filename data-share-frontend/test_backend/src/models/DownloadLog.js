import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const DownloadLog = sequelize.define("DownloadLog", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT, allowNull: false },
  datasetId: { type: DataTypes.BIGINT, allowNull: false }
}, {
  tableName: "download_logs"
});
