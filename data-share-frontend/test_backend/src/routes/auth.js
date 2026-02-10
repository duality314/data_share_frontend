import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { config } from "../config.js";

export const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: "username/password required" });

  const exists = await User.findOne({ where: { username } });
  if (exists) return res.status(409).json({ message: "username already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash });

  return res.json({ id: user.id, username: user.username });
});

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: "username/password required" });

  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ message: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, config.jwtSecret, { expiresIn: "7d" });
  return res.json({ token, user: { id: user.id, username: user.username } });
});
