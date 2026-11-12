import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../services/api";

export default function CreateOffer() {
  const [form, setForm] = useState({
    coin: "USDT", price: "", min_kes: "", max_kes: "", method: "M-Pesa",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!localStorage.getItem("token")) return <Navigate to="/login" replace />;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/offers", {
        coin: form.coin,
        price: Number(form.price),
        min_kes: Number(form.min_kes),
        max_kes: Number(form.max_kes),
        method: form.method,
      });
      navigate("/marketplace");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Could not create offer.");
    } finally {
      setLoading(false);
    }
  };

  const box = "w-full border rounded-lg px-4 py-2";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white text-black shadow-lg rounded-xl p-8 space-y-4">
        <h1 className="text-2xl font-bold">Create an offer</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <select name="coin" value={form.coin} onChange={handleChange} className={box}>
          <option>USDT</option>
          <option>BTC</option>
          <option>ETH</option>
        </select>
        <input type="number" name="price" placeholder="Price per coin (KES)" value={form.price} onChange={handleChange} required className={box} />
        <input type="number" name="min_kes" placeholder="Minimum (KES)" value={form.min_kes} onChange={handleChange} required className={box} />
        <input type="number" name="max_kes" placeholder="Maximum (KES)" value={form.max_kes} onChange={handleChange} required className={box} />
        <select name="method" value={form.method} onChange={handleChange} className={box}>
          <option>M-Pesa</option>
          <option>Airtel Money</option>
          <option>Bank transfer</option>
        </select>
        <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white rounded-lg py-2 font-semibold disabled:opacity-60">
          {loading ? "Posting..." : "Post offer"}
        </button>
      </form>
    </div>
  );
}
