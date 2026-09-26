import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";

export default function JobFeed() {
  const [jobs, setJobs] = useState([]);
  const [params] = useSearchParams();
  const mine = params.get("mine");
  const nav = useNavigate();

  useEffect(() => {
    const url = mine ? "/jobs/mine" : "/jobs/open";
    api.get(url).then((r) => setJobs(r.data.jobs));
  }, [mine]);

  const assign = async (jobId) => {
    await api.post(`/jobs/${jobId}/assign`);
    nav(`/chat/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-velion-dark text-white px-5 pt-8 pb-10">
      <button onClick={() => nav(-1)} className="text-white/40 mb-4">← Back</button>
      <h1 className="text-2xl font-bold mb-5">{mine ? "My jobs" : "Open jobs"}</h1>

      <div className="space-y-3">
        {jobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold">{job.title}</h3>
              <span className="text-velion-accent font-bold">₹{job.price}</span>
            </div>
            <p className="text-white/50 text-sm mb-3">{job.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs px-2 py-1 rounded-full bg-white/10">{job.status}</span>
              {!mine && (
                <button
                  onClick={() => assign(job.id)}
                  className="px-4 py-1.5 rounded-lg bg-velion-primary text-sm font-medium"
                >
                  Apply
                </button>
              )}
              {mine && (
                <button
                  onClick={() => nav(`/chat/${job.id}`)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 text-sm font-medium"
                >
                  Open chat
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {jobs.length === 0 && <p className="text-white/30 text-sm text-center mt-10">Nothing here yet.</p>}
      </div>
    </div>
  );
}
