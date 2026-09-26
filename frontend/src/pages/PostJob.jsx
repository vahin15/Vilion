import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function PostJob() {
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/jobs", form);
    nav("/jobs?mine=1");
  };

  return (
    <div className="min-h-screen bg-velion-dark text-white px-5 pt-8">
      <button onClick={() => nav(-1)} className="text-white/40 mb-4">← Back</button>
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-2xl font-bold mb-2">Post a job</h1>
        <input
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-velion-accent"
          placeholder="Job title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-velion-accent h-32"
          placeholder="Describe exactly what you need done"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-velion-accent"
          placeholder="Total price (₹)"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <p className="text-xs text-white/40">
          ₹50 token is paid upfront by you to lock the worker in. The remaining ₹{form.price ? form.price - 50 : "—"} is
          paid after delivery — ₹30 of that goes to Velion, the rest to the worker.
        </p>
        <motion.button whileTap={{ scale: 0.97 }} className="w-full py-3 rounded-xl bg-gradient-to-r from-velion-primary to-velion-accent font-semibold">
          Post job
        </motion.button>
      </motion.form>
    </div>
  );
}
