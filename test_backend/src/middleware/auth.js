import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload; // { id, username }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
