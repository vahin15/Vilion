import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function registerChatSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // client joins the chat room for a specific job
    socket.on("join_job", (jobId) => {
      socket.join(`job:${jobId}`);
    });

    socket.on("send_message", async ({ jobId, receiverId, text }) => {
      if (!text?.trim()) return;

      const message = await prisma.message.create({
        data: { jobId, senderId: socket.user.id, receiverId, text: text.trim() }
      });

      io.to(`job:${jobId}`).emit("new_message", message);
    });

    socket.on("typing", ({ jobId }) => {
      socket.to(`job:${jobId}`).emit("peer_typing");
    });
  });
}
