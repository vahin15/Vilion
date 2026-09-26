import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = Router();

// Update profile: description (bio), dpUrl, rate. DP upload itself should go through
// a storage bucket (S3 / Cloudinary) on the frontend first — this just saves the resulting URL.
router.put("/me", requireAuth, async (req, res) => {
  const { description, dpUrl, hourlyOrJobRate, name } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { description, dpUrl, hourlyOrJobRate, name }
  });
  res.json({ user });
});

router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, dpUrl: true, description: true, hourlyOrJobRate: true, role: true }
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ user });
});

export default router;
