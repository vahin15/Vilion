import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = Router();

// Client posts a job
router.post("/", requireAuth, async (req, res) => {
  const { title, description, price } = req.body;
  if (!title || !price) return res.status(400).json({ error: "title and price required" });
  const job = await prisma.job.create({
    data: { title, description, price: Number(price), clientId: req.user.id }
  });
  res.json({ job });
});

// Browse open jobs (worker side)
router.get("/open", async (_req, res) => {
  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    include: { client: { select: { name: true, dpUrl: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json({ jobs });
});

// Worker applies / gets assigned to a job (kept simple: direct assign, no bidding thread yet)
router.post("/:id/assign", requireAuth, async (req, res) => {
  const job = await prisma.job.update({
    where: { id: req.params.id },
    data: { workerId: req.user.id, status: "ASSIGNED" }
  });
  res.json({ job });
});

// Jobs for logged-in user (as client or worker)
router.get("/mine", requireAuth, async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { OR: [{ clientId: req.user.id }, { workerId: req.user.id }] },
    orderBy: { createdAt: "desc" }
  });
  res.json({ jobs });
});

// Worker marks work as delivered -> triggers final payment request to client
router.post("/:id/deliver", requireAuth, async (req, res) => {
  const job = await prisma.job.update({
    where: { id: req.params.id },
    data: { status: "DELIVERED" }
  });
  res.json({ job });
});

export default router;
