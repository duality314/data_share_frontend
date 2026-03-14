import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Dataset = sequelize.define("Dataset", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  domain: { type: DataTypes.STRING(80), allowNull: false, defaultValue: "general" }, // 专业领域
  dataType: { type: DataTypes.STRING(40), allowNull: false, defaultValue: "file" }, // csv/sql/json/...
  filePath: { type: DataTypes.STRING(255), allowNull: false },
  fileSize: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  isListed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  downloads: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  ownerId: { type: DataTypes.BIGINT, allowNull: false }
}, {
  tableName: "datasets"
});
