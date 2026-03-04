import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { JWT_SECRET } from "../middleware/auth";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "メールアドレスとパスワードは必須です" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "パスワードは6文字以上で入力してください" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      res.status(409).json({ error: "このメールアドレスは既に登録されています" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, password: hashed },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "メールアドレスとパスワードは必須です" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      res.status(401).json({ error: "メールアドレスまたはパスワードが正しくありません" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "メールアドレスまたはパスワードが正しくありません" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
});

export default router;
