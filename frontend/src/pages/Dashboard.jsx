import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [trades, setTrades] = useState([]);
  const [offers, setOffers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [error, setError] = useState("");
  const loggedIn = !!localStorage.getItem("token");

  const load = async () => {
    try {
      const [u, t, o, w] = await Promise.all([
        api.get("/auth/me"),
        api.get("/trades/mine"),
        api.get("/offers/mine"),
        api.get("/wallet"),
      ]);
      setMe(u.data);
      setTrades(t.data);
      setOffers(o.data);
      setBalances(w.data.balances);
    } catch {
      setError("Could not load your data.");
    }
  };

  useEffect(() => {
    if (loggedIn) load();
  }, []);

  const call = async (method, url) => {
    setError("");
    try {
      await api[method](url);
      load();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Action failed.");
    }
  };

  if (!loggedIn) return <Navigate to="/login" replace />;

  const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 8 });
  const card = "bg-surface border border-border rounded-xl p-5";
  const action = "text-center bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg py-3";
  const small = "px-3 py-1 rounded-lg text-white text-sm ";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{me ? "Hi, " + me.name : "Dashboard"}</h1>
      {error && <p className="text-error mb-4">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
        <Link to="/marketplace" className={action}>Buy</Link>
        <Link to="/create-offer" className={action}>Sell</Link>
        <Link to="/wallet" className={action}>Deposit</Link>
        <Link to="/wallet" className={action}>Withdraw</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {balances.map((b) => (
          <div key={b.asset} className={card}>
            <p className="text-text-muted text-sm">{b.asset} balance</p>
            <p className="text-2xl font-bold">{fmt(b.available)}</p>
            <p className="text-xs text-text-muted">In escrow: {fmt(b.locked)}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-3">My offers</h2>
      {offers.length === 0 && <p className="text-text-muted mb-8">You have no open offers.</p>}
      <div className="space-y-3 mb-10">
        {offers.map((o) => (
          <div key={o.id} className={card}>
            <div className="flex justify-between items-center">
              <p className="font-semibold">Selling {o.coin} at KES {fmt(o.price)}</p>
              <button onClick={() => call("delete", "/offers/" + o.id)} className={small + "bg-red-600"}>Close</button>
            </div>
            <p className="text-sm text-text-muted">
              {fmt(o.remaining)} of {fmt(o.amount)} {o.coin} left. Limit KES {fmt(o.min_kes)} to {fmt(o.max_kes)}. {o.method}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-3">My trades</h2>
      {trades.length === 0 && <p className="text-text-muted">No trades yet. Tap Buy to start one.</p>}
      <div className="space-y-3">
        {trades.map((t) => {
          const isBuyer = me && t.buyer_id === me.id;
          const open = t.status === "pending" || t.status === "paid";
          return (
            <div key={t.id} className={card}>
              <div className="flex justify-between">
                <p className="font-semibold">{isBuyer ? "Buying from " + t.seller : "Selling to " + t.buyer}</p>
                <span className="text-sm bg-background border border-border px-2 rounded">{t.status}</span>
              </div>
              <p className="text-sm text-text-muted">
                {fmt(t.amount_coin)} {t.coin} for KES {fmt(t.amount_kes)}
              </p>
              {isBuyer && open && (
                <p className="text-sm mt-2">
                  Pay KES {fmt(t.amount_kes)} via {t.method}: <b>{t.payment_details}</b>
                </p>
              )}
              {!isBuyer && t.status === "pending" && (
                <p className="text-sm text-text-muted mt-2">Waiting for the buyer to pay.</p>
              )}
              <div className="flex gap-2 mt-3">
                {t.status === "pending" && isBuyer && (
                  <button onClick={() => call("post", "/trades/" + t.id + "/paid")} className={small + "bg-primary"}>I have paid</button>
                )}
                {t.status === "paid" && !isBuyer && (
                  <button onClick={() => call("post", "/trades/" + t.id + "/release")} className={small + "bg-green-600"}>Release crypto</button>
                )}
                {t.status === "pending" && (
                  <button onClick={() => call("post", "/trades/" + t.id + "/cancel")} className={small + "bg-red-600"}>Cancel</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
