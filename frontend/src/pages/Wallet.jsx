import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

const COINS = ["USDT", "BTC", "ETH"];

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [dep, setDep] = useState({ asset: "USDT", amount: "" });
  const [wd, setWd] = useState({ asset: "USDT", amount: "", address: "" });
  const loggedIn = !!localStorage.getItem("token");

  const load = async () => {
    try {
      const res = await api.get("/wallet");
      setWallet(res.data);
    } catch {
      setError("Could not load your wallet.");
    }
  };

  useEffect(() => {
    if (loggedIn) load();
  }, []);

  const send = async (path, body, reset) => {
    setError("");
    setMsg("");
    try {
      const res = await api.post(path, body);
      setMsg(res.data.message);
      reset();
      load();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Something went wrong. Try again.");
    }
  };

  const doDeposit = (e) => {
    e.preventDefault();
    send("/wallet/deposit", { asset: dep.asset, amount: Number(dep.amount) },
      () => setDep({ ...dep, amount: "" }));
  };

  const doWithdraw = (e) => {
    e.preventDefault();
    send("/wallet/withdraw",
      { asset: wd.asset, amount: Number(wd.amount), address: wd.address },
      () => setWd({ ...wd, amount: "", address: "" }));
  };

  if (!loggedIn) return <Navigate to="/login" replace />;

  const input = "w-full bg-background border border-border rounded-lg px-4 py-2";
  const btn = "w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg py-2";
  const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 8 });
  const when = (ts) => new Date(ts * 1000).toLocaleString();
  const balances = wallet ? wallet.balances : [];
  const history = wallet ? wallet.transactions : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Wallet</h1>
      <p className="text-text-muted text-sm mb-6">
        Demo wallet: balances are simulated, and nothing real is deposited or sent.
      </p>

      {error && <p className="text-error mb-4">{error}</p>}
      {msg && <p className="text-success mb-4">{msg}</p>}

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {balances.map((b) => (
          <div key={b.asset} className="bg-surface border border-border rounded-xl p-5">
            <p className="text-text-muted text-sm">{b.asset}</p>
            <p className="text-2xl font-bold">{fmt(b.available)}</p>
            <p className="text-xs text-text-muted">In escrow: {fmt(b.locked)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <form onSubmit={doDeposit} className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Deposit (demo)</h2>
          <select value={dep.asset} onChange={(e) => setDep({ ...dep, asset: e.target.value })} className={input}>
            {COINS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="number" step="any" placeholder="Amount" value={dep.amount}
            onChange={(e) => setDep({ ...dep, amount: e.target.value })} required className={input} />
          <p className="text-xs text-text-muted">Limits per deposit: 1000 USDT, 1 ETH, 0.05 BTC.</p>
          <button type="submit" className={btn}>Deposit</button>
        </form>

        <form onSubmit={doWithdraw} className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Withdraw (demo)</h2>
          <select value={wd.asset} onChange={(e) => setWd({ ...wd, asset: e.target.value })} className={input}>
            {COINS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="number" step="any" placeholder="Amount" value={wd.amount}
            onChange={(e) => setWd({ ...wd, amount: e.target.value })} required className={input} />
          <input placeholder="Wallet address" value={wd.address}
            onChange={(e) => setWd({ ...wd, address: e.target.value })} required className={input} />
          <p className="text-xs text-text-muted">Only your available balance can be withdrawn, not crypto in escrow.</p>
          <button type="submit" className={btn}>Withdraw</button>
        </form>
      </div>

      <h2 className="text-xl font-semibold mb-3">History</h2>
      {wallet && history.length === 0 && <p className="text-text-muted">No activity yet.</p>}
      <div className="space-y-2">
        {history.map((t, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg px-4 py-3 flex justify-between gap-3 text-sm">
            <div>
              <p className="font-medium capitalize">{t.kind} {t.asset}</p>
              <p className="text-xs text-text-muted">{t.note} {"\u00b7"} {when(t.created_ts)}</p>
            </div>
            <p className="font-semibold">{fmt(t.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
