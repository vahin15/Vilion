import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Auth() {
  const [mode, setMode] = useState("login"); // login | signup
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "BOTH" });
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      localStorage.setItem("velion_token", data.token);
      localStorage.setItem("velion_user", JSON.stringify(data.user));
      nav("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-velion-dark via-[#151027] to-black px-4">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <motion.h1
          className="text-3xl font-bold bg-gradient-to-r from-velion-primary to-velion-accent bg-clip-text text-transparent mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Velion
        </motion.h1>
        <p className="text-sm text-white/50 mb-6">
          {mode === "login" ? "Welcome back" : "Two sides. One platform."}
        </p>

        {mode === "signup" && (
          <input
            className="w-full mb-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-velion-accent transition"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          className="w-full mb-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-velion-accent transition"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full mb-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-velion-accent transition"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {mode === "signup" && (
          <div className="flex gap-2 mb-4">
            {["CLIENT", "WORKER", "BOTH"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  form.role === r ? "bg-velion-primary text-white" : "bg-white/5 text-white/50"
                }`}
              >
                {r === "BOTH" ? "Both" : r === "CLIENT" ? "I need work done" : "I do work"}
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-velion-primary to-velion-accent font-semibold"
        >
          {mode === "login" ? "Log in" : "Create account"}
        </motion.button>

        <p className="text-center text-sm text-white/40 mt-4">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-velion-accent"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </motion.form>
    </div>
  );
}
