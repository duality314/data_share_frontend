import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    name: process.env.DB_NAME || "data_share_demo",
    user: process.env.DB_USER || "root",
    pass: process.env.DB_PASS || ""
  },
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173"
};
