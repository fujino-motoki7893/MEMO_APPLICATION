import express from "express";
import cors from "cors";
import prisma from "./prisma";
import authRouter from "./routes/auth";
import { authMiddleware, AuthRequest } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
}));
app.use(express.json());

// Health check (no auth)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth routes (no auth)
app.use("/api/auth", authRouter);

// All memo routes require authentication
app.use("/api/memos", authMiddleware);

// Get all memos (for current user)
app.get("/api/memos", async (req: AuthRequest, res) => {
  try {
    const memos = await prisma.memo.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: "desc" },
    });
    res.json(memos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single memo (owned by current user)
app.get("/api/memos/:id", async (req: AuthRequest, res) => {
  try {
    const memo = await prisma.memo.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!memo) {
      res.status(404).json({ error: "Memo not found" });
      return;
    }
    res.json(memo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a memo
app.post("/api/memos", async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body;
    if (!title || content === undefined) {
      res.status(400).json({ error: "title and content are required" });
      return;
    }
    const memo = await prisma.memo.create({
      data: { title, content, userId: req.userId! },
    });
    res.status(201).json(memo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a memo (owned by current user)
app.put("/api/memos/:id", async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body;
    const existing = await prisma.memo.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) {
      res.status(404).json({ error: "Memo not found" });
      return;
    }
    const memo = await prisma.memo.update({
      where: { id: existing.id },
      data: { title, content },
    });
    res.json(memo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a memo (owned by current user)
app.delete("/api/memos/:id", async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.memo.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) {
      res.status(404).json({ error: "Memo not found" });
      return;
    }
    await prisma.memo.delete({
      where: { id: existing.id },
    });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
