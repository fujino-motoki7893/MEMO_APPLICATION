import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
}));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Get all memos
app.get("/api/memos", async (_req, res) => {
  const memos = await prisma.memo.findMany({
    orderBy: { updatedAt: "desc" },
  });
  res.json(memos);
});

// Get a single memo
app.get("/api/memos/:id", async (req, res) => {
  const memo = await prisma.memo.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!memo) {
    res.status(404).json({ error: "Memo not found" });
    return;
  }
  res.json(memo);
});

// Create a memo
app.post("/api/memos", async (req, res) => {
  const { title, content } = req.body;
  if (!title || content === undefined) {
    res.status(400).json({ error: "title and content are required" });
    return;
  }
  const memo = await prisma.memo.create({
    data: { title, content },
  });
  res.status(201).json(memo);
});

// Update a memo
app.put("/api/memos/:id", async (req, res) => {
  const { title, content } = req.body;
  try {
    const memo = await prisma.memo.update({
      where: { id: Number(req.params.id) },
      data: { title, content },
    });
    res.json(memo);
  } catch {
    res.status(404).json({ error: "Memo not found" });
  }
});

// Delete a memo
app.delete("/api/memos/:id", async (req, res) => {
  try {
    await prisma.memo.delete({
      where: { id: Number(req.params.id) },
    });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Memo not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
