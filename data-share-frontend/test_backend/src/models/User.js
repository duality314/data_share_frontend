import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const User = sequelize.define("User", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false }
}, {
  tableName: "users"
});
