import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import api from "../services/api";
import PasswordInput from "../components/PasswordInput";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (localStorage.getItem("token")) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate("/login");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Cannot reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const box = "w-full border rounded-lg px-4 py-2";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-4">
        <h1 className="text-2xl font-bold">Create your account</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required className={box} />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className={box} />
        <PasswordInput name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <PasswordInput name="confirm" placeholder="Confirm password" value={form.confirm} onChange={handleChange} required />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Creating account..." : "Sign up"}
        </button>
        <p className="text-sm text-center">
          Already have an account? <Link to="/login" className="text-blue-600 underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
