import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";

export default function Profile() {
  const stored = JSON.parse(localStorage.getItem("velion_user") || "{}");
  const [form, setForm] = useState({
    name: stored.name || "",
    description: stored.description || "",
    hourlyOrJobRate: stored.hourlyOrJobRate || "",
    dpUrl: stored.dpUrl || ""
  });
  const nav = useNavigate();

  const save = async () => {
    const { data } = await api.put("/users/me", form);
    localStorage.setItem("velion_user", JSON.stringify({ ...stored, ...data.user }));
    nav("/");
  };

  const logout = () => {
    localStorage.clear();
    nav("/auth");
  };

  return (
    <div className="min-h-screen bg-velion-dark text-white px-5 pt-8 pb-10">
      <button onClick={() => nav(-1)} className="text-white/40 mb-4">← Back</button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-4">
          <img src={form.dpUrl || "https://api.dicebear.com/7.x/thumbs/svg?seed=" + form.name} className="w-16 h-16 rounded-full border border-white/10" />
          <input
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none"
            placeholder="Image URL for your DP"
            value={form.dpUrl}
            onChange={(e) => setForm({ ...form, dpUrl: e.target.value })}
          />
        </div>
        <input
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none h-28"
          placeholder="Describe your skills / what you offer"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none"
          placeholder="Rate (e.g. ₹500/job or ₹200/hr)"
          value={form.hourlyOrJobRate}
          onChange={(e) => setForm({ ...form, hourlyOrJobRate: e.target.value })}
        />

        <motion.button whileTap={{ scale: 0.97 }} onClick={save} className="w-full py-3 rounded-xl bg-gradient-to-r from-velion-primary to-velion-accent font-semibold">
          Save profile
        </motion.button>
        <button onClick={logout} className="w-full py-2 text-red-400 text-sm">Log out</button>
      </motion.div>
    </div>
  );
}
