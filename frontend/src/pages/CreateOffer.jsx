import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import api from "../services/api";

export default function CreateOffer() {
  const [form, setForm] = useState({
    coin: "USDT", amount: "", price: "", min_kes: "", max_kes: "",
    method: "M-Pesa", payment_details: "",
  });
  const [balances, setBalances] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!loggedIn) return;
    api.get("/wallet").then((res) => {
      const map = {};
      res.data.balances.forEach((b) => { map[b.asset] = b.available; });
      setBalances(map);
    }).catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/offers", {
        coin: form.coin,
        amount: Number(form.amount),
        price: Number(form.price),
        min_kes: Number(form.min_kes),
        max_kes: Number(form.max_kes),
        method: form.method,
        payment_details: form.payment_details,
      });
      navigate("/dashboard");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Could not create offer.");
    } finally {
      setLoading(false);
    }
  };

  if (!loggedIn) return <Navigate to="/login" replace />;

  const box = "w-full bg-background border border-border rounded-lg px-4 py-2";
  const have = Number(balances[form.coin] || 0);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface border border-border rounded-xl p-8 space-y-4">
        <h1 className="text-2xl font-bold">Sell crypto</h1>
        <p className="text-sm text-text-muted">The crypto you offer is held in escrow until the offer is closed or sold.</p>
        {error && <p className="text-error text-sm">{error}</p>}

        <select name="coin" value={form.coin} onChange={handleChange} className={box}>
          <option>USDT</option>
          <option>BTC</option>
          <option>ETH</option>
        </select>
        <p className="text-xs text-text-muted -mt-2">
          Available: {have.toLocaleString(undefined, { maximumFractionDigits: 8 })} {form.coin}{" "}
          {have <= 0 && <Link to="/wallet" className="text-primary underline">Deposit first</Link>}
        </p>

        <input type="number" step="any" name="amount" placeholder={"Amount to sell (" + form.coin + ")"} value={form.amount} onChange={handleChange} required className={box} />
        <input type="number" step="any" name="price" placeholder="Price per coin (KES)" value={form.price} onChange={handleChange} required className={box} />
        <input type="number" name="min_kes" placeholder="Minimum per trade (KES)" value={form.min_kes} onChange={handleChange} required className={box} />
        <input type="number" name="max_kes" placeholder="Maximum per trade (KES)" value={form.max_kes} onChange={handleChange} required className={box} />
        <select name="method" value={form.method} onChange={handleChange} className={box}>
          <option>M-Pesa</option>
          <option>Airtel Money</option>
          <option>Bank transfer</option>
        </select>
        <input name="payment_details" placeholder="Where buyers pay you, e.g. M-Pesa 07XX XXX XXX, Jane W." value={form.payment_details} onChange={handleChange} required className={box} />
        <p className="text-xs text-text-muted -mt-2">Buyers see these details once they start a trade. For this demo, use test details.</p>

        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-2 font-semibold disabled:opacity-60">
          {loading ? "Posting..." : "Post offer"}
        </button>
      </form>
    </div>
  );
}
