import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";
import { getSocket } from "../lib/socket.js";

export default function Chat() {
  const { jobId } = useParams();
  const nav = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [job, setJob] = useState(null);
  const bottomRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("velion_user") || "{}");

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join_job", jobId);
    socket.on("new_message", (msg) => setMessages((m) => [...m, msg]));

    api.get("/jobs/mine").then((r) => {
      const j = r.data.jobs.find((x) => x.id === jobId);
      setJob(j);
    });

    return () => socket.off("new_message");
  }, [jobId]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const send = () => {
    if (!text.trim() || !job) return;
    const receiverId = job.clientId === user.id ? job.workerId : job.clientId;
    getSocket().emit("send_message", { jobId, receiverId, text });
    setText("");
  };

  const payToken = async () => {
    const { data } = await api.post(`/payments/${jobId}/token`);
    // In production: open Razorpay Checkout here with data.order + data.keyId.
    alert(`Razorpay checkout would open now for ₹50 (order ${data.order.id})`);
  };

  const payFinal = async () => {
    const { data } = await api.post(`/payments/${jobId}/final`);
    alert(`Razorpay checkout would open now for the remaining amount (order ${data.order.id})`);
  };

  const markDelivered = async () => {
    await api.post(`/jobs/${jobId}/deliver`);
    setJob({ ...job, status: "DELIVERED" });
  };

  const isClient = job && user.id === job.clientId;

  return (
    <div className="min-h-screen bg-velion-dark text-white flex flex-col">
      <div className="px-5 pt-6 pb-3 border-b border-white/10 flex items-center justify-between">
        <button onClick={() => nav(-1)} className="text-white/40">← Back</button>
        {job && <span className="text-xs px-2 py-1 rounded-full bg-white/10">{job.status}</span>}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
              m.senderId === user.id ? "ml-auto bg-velion-primary" : "bg-white/10"
            }`}
          >
            {m.text}
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Payment action bar */}
      {job && isClient && job.status === "ASSIGNED" && (
        <div className="px-5 pb-3">
          <button onClick={payToken} className="w-full py-2.5 rounded-xl bg-velion-accent text-velion-dark font-semibold text-sm">
            Pay ₹50 token to lock this worker in
          </button>
        </div>
      )}
      {job && !isClient && job.status === "TOKEN_PAID" && (
        <div className="px-5 pb-3">
          <button onClick={markDelivered} className="w-full py-2.5 rounded-xl bg-white/10 font-semibold text-sm">
            Mark work as delivered
          </button>
        </div>
      )}
      {job && isClient && job.status === "DELIVERED" && (
        <div className="px-5 pb-3">
          <button onClick={payFinal} className="w-full py-2.5 rounded-xl bg-velion-accent text-velion-dark font-semibold text-sm">
            Pay remaining ₹{job.price - 50} and release
          </button>
        </div>
      )}

      <div className="px-5 py-3 border-t border-white/10 flex gap-2">
        <input
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none"
          placeholder="Message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send} className="px-4 rounded-xl bg-velion-primary font-medium">Send</button>
      </div>
    </div>
  );
}
