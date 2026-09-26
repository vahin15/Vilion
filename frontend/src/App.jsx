import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PostJob from "./pages/PostJob.jsx";
import JobFeed from "./pages/JobFeed.jsx";
import Chat from "./pages/Chat.jsx";
import Profile from "./pages/Profile.jsx";

function Private({ children }) {
  const token = localStorage.getItem("velion_token");
  return token ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Private><Dashboard /></Private>} />
      <Route path="/post-job" element={<Private><PostJob /></Private>} />
      <Route path="/jobs" element={<Private><JobFeed /></Private>} />
      <Route path="/chat/:jobId" element={<Private><Chat /></Private>} />
      <Route path="/profile" element={<Private><Profile /></Private>} />
    </Routes>
  );
}
