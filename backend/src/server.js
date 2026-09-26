import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import jobRoutes from "./routes/jobs.js";
import paymentRoutes from "./routes/payments.js";
import userRoutes from "./routes/users.js";
import { registerChatSocket } from "./sockets/chat.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

registerChatSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Velion backend running on :${PORT}`));
