import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [side, setSide] = useState("client"); // client | worker
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("velion_user") || "{}");

  return (
    <div className="min-h-screen bg-velion-dark text-white px-5 pt-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-white/40 text-sm">Welcome back</p>
          <h1 className="text-2xl font-bold">{user.name || "there"}</h1>
        </div>
        <motion.img
          whileTap={{ scale: 0.9 }}
          onClick={() => nav("/profile")}
          src={user.dpUrl || "https://api.dicebear.com/7.x/thumbs/svg?seed=" + user.name}
          className="w-11 h-11 rounded-full border border-white/10 cursor-pointer"
        />
      </div>

      {/* Sliding two-side toggle */}
      <div className="relative flex bg-white/5 rounded-full p-1 mb-8 border border-white/10">
        <motion.div
          className="absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r from-velion-primary to-velion-accent"
          animate={{ x: side === "client" ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        />
        <button
          onClick={() => setSide("client")}
          className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-full transition ${
            side === "client" ? "text-white" : "text-white/50"
          }`}
        >
          Client side
        </button>
        <button
          onClick={() => setSide("worker")}
          className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-full transition ${
            side === "worker" ? "text-white" : "text-white/50"
          }`}
        >
          Worker side
        </button>
      </div>

      <AnimatePresence mode="wait">
        {side === "client" ? (
          <motion.div
            key="client"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <Card
              title="Post a job"
              desc="Describe the work, set a price, get workers applying."
              onClick={() => nav("/post-job")}
            />
            <Card
              title="My jobs"
              desc="Track work you've hired out — chat, pay, review."
              onClick={() => nav("/jobs?mine=1")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="worker"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <Card
              title="Find work"
              desc="Browse open jobs, apply, get hired."
              onClick={() => nav("/jobs")}
            />
            <Card
              title="Active gigs"
              desc="Chat with clients and deliver work."
              onClick={() => nav("/jobs?mine=1")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Card({ title, desc, onClick }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:border-velion-accent/50 transition"
    >
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-white/50 text-sm">{desc}</p>
    </motion.div>
  );
}
