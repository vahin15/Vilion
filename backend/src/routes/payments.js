import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const TOKEN_AMOUNT = 50;   // fixed token/booking amount in INR
const PLATFORM_FEE = 30;   // your flat margin per order, charged once on the FINAL payment

// STEP 1 — client pays the ₹50 token to lock the worker in
router.post("/:jobId/token", requireAuth, async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
  if (!job) return res.status(404).json({ error: "Job not found" });

  const order = await razorpay.orders.create({
    amount: TOKEN_AMOUNT * 100, // paise
    currency: "INR",
    receipt: `token_${job.id}`
  });

  await prisma.payment.create({
    data: {
      jobId: job.id,
      stage: "TOKEN",
      amount: TOKEN_AMOUNT,
      platformFee: 0,
      razorpayOrderId: order.id
    }
  });

  res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
});

// STEP 2 — after delivery, client pays the remaining amount.
// This is where the ₹30 margin gets split off to YOUR linked account via Razorpay Route.
// Requires: worker has a linked_account_id on Razorpay (set up once via Route onboarding).
router.post("/:jobId/final", requireAuth, async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.status !== "DELIVERED") {
    return res.status(400).json({ error: "Work must be marked delivered first" });
  }

  const remaining = job.price - TOKEN_AMOUNT;
  if (remaining <= PLATFORM_FEE) {
    return res.status(400).json({ error: "Job price too low to cover platform fee" });
  }

  // transfers[] tells Razorpay Route to send (remaining - 30) to the worker's linked
  // account automatically at settlement; the ₹30 stays in your primary account.
  const order = await razorpay.orders.create({
    amount: remaining * 100,
    currency: "INR",
    receipt: `final_${job.id}`,
    transfers: [
      {
        account: job.workerRazorpayAccountId, // set this on the worker's profile during onboarding
        amount: (remaining - PLATFORM_FEE) * 100,
        currency: "INR",
        on_hold: false
      }
    ]
  });

  await prisma.payment.create({
    data: {
      jobId: job.id,
      stage: "FINAL",
      amount: remaining,
      platformFee: PLATFORM_FEE,
      razorpayOrderId: order.id
    }
  });

  res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
});

// Razorpay webhook — confirms payment, flips job status, marks payment PAID.
// Point this URL at Razorpay Dashboard > Webhooks, and verify the signature.
router.post("/webhook", express_raw_body, async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest("hex");

  if (signature !== expected) return res.status(400).send("Invalid signature");

  const event = JSON.parse(req.body);
  const orderId = event.payload?.payment?.entity?.order_id;
  const paymentId = event.payload?.payment?.entity?.id;

  if (event.event === "payment.captured" && orderId) {
    const payment = await prisma.payment.findFirst({ where: { razorpayOrderId: orderId } });
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", razorpayPaymentId: paymentId }
      });
      await prisma.job.update({
        where: { id: payment.jobId },
        data: { status: payment.stage === "TOKEN" ? "TOKEN_PAID" : "COMPLETED" }
      });
    }
  }

  res.json({ received: true });
});

// helper: webhook needs the raw body for signature verification, not parsed JSON
function express_raw_body(req, res, next) {
  let data = "";
  req.on("data", (chunk) => (data += chunk));
  req.on("end", () => {
    req.body = data;
    next();
  });
}

export default router;
