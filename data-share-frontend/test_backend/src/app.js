import express from "express";
import cors from "cors";
import { sequelize } from "./db.js";
import { config } from "./config.js";
import { User } from "./models/User.js";
import { Dataset } from "./models/dataset.js";
import { ShareRequest } from "./models/ShareRequest.js";
import { DownloadLog } from "./models/DownloadLog.js";
import { authRouter } from "./routes/auth.js";
import { datasetsRouter } from "./routes/datasets.js";
// import {shareRouter} from "./routes/share.js";


const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/datasets", datasetsRouter);
// app.use("/api/shares", shareRouter);


// 关联（可选）
User.hasMany(Dataset, { foreignKey: "ownerId" });
Dataset.belongsTo(User, { foreignKey: "ownerId" });
// ShareRequest 关联
User.hasMany(ShareRequest, { foreignKey: "requesterId", as: "sentShareRequests" });
User.hasMany(ShareRequest, { foreignKey: "ownerId", as: "incomingShareRequests" });

ShareRequest.belongsTo(User, { foreignKey: "requesterId", as: "requester" });
ShareRequest.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

Dataset.hasMany(ShareRequest, { foreignKey: "datasetId", as: "shareRequests" });
ShareRequest.belongsTo(Dataset, { foreignKey: "datasetId", as: "dataset" });

async function main() {
  await sequelize.authenticate();
  await sequelize.sync(); // demo用自动建表
  app.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
