import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import api from "../services/api";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (localStorage.getItem("token")) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Cannot reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white text-black shadow-lg rounded-xl p-8 space-y-4">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full border rounded-lg px-4 py-2" />
        <PasswordInput name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white rounded-lg py-2 font-semibold hover:bg-purple-700 disabled:opacity-60">
          {loading ? "Logging in..." : "Log in"}
        </button>
        <p className="text-sm text-center">
          No account? <Link to="/register" className="text-purple-600 underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
