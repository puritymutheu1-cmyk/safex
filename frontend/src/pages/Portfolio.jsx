import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../services/api";

const CRYPTO = ["USDT", "BTC", "ETH", "USDC", "SOL", "BNB", "XRP", "LTC"];
const ALL = ["USDT", "BTC", "ETH", "USDC", "SOL", "BNB", "XRP", "LTC", "KES"];
const TABS = ["Overview", "Transfer", "Convert", "History"];
const fmt = (n, d = 4) => Number(n).toLocaleString(undefined, { maximumFractionDigits: d });
const box = "rounded-2xl border border-border bg-surface p-4";
const field = "w-full rounded-xl border border-border bg-background px-3 py-2";
const btn = "w-full rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-2.5";

export default function Portfolio() {
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState(null);
  const [rates, setRates] = useState(null);
  const [live, setLive] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [tr, setTr] = useState({ asset: "USDT", direction: "to_spot", amount: "" });
  const [cv, setCv] = useState({ from_asset: "USDT", to_asset: "KES", amount: "" });
  const loggedIn = !!localStorage.getItem("token");

  const load = async (f = filter) => {
    try {
      const [a, b, c] = await Promise.all([
        api.get("/portfolio"),
        api.get("/portfolio/rates"),
        api.get("/portfolio/history" + (f ? "?kind=" + f : "")),
      ]);
      setData(a.data);
      setRates(b.data.usd);
      setLive(b.data.live);
      setItems(c.data.items);
    } catch {
      setError("Could not load your portfolio. The server may be waking up, try again in a minute.");
    }
  };

  useEffect(() => {
    if (loggedIn) load();
  }, []);

  const act = async (path, body, reset) => {
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

  const estimate =
    rates && cv.amount > 0
      ? (Number(cv.amount) * rates[cv.from_asset]) / rates[cv.to_asset]
      : 0;

  if (!loggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold">Portfolio</h1>
      <p className="text-text-muted text-sm mb-4">
        Demo balances, no real money. Prices: {live === null ? "loading" : live ? "live market rates" : "estimates"}.{" "}
        <Link to="/wallet" className="text-primary underline">Wallet</Link>
      </p>
      <div className="flex gap-2 overflow-x-auto mb-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setError(""); setMsg(""); }}
            className={"px-4 py-2 rounded-full text-sm whitespace-nowrap border " +
              (tab === t ? "bg-primary text-white border-primary" : "border-border text-text-muted")}>
            {t}
          </button>
        ))}
      </div>
      {error && <p className="text-error mb-3">{error}</p>}
      {msg && <p className="text-success mb-3">{msg}</p>}
      {!data && !error && <p className="text-text-muted">Loading...</p>}

      {data && tab === "Overview" && (
        <div className="space-y-4">
          <div className={box}>
            <p className="text-text-muted text-sm">Total balance</p>
            <p className="text-3xl font-bold">${fmt(data.total_usd, 2)}</p>
            <p className="text-text-muted text-sm">KES {fmt(data.total_kes, 0)}</p>
          </div>
          <div className={box}>
            <h2 className="font-semibold mb-3">Allocation</h2>
            {data.allocation.length === 0 && <p className="text-text-muted text-sm">Nothing yet. Make a deposit in your Wallet.</p>}
            {data.allocation.map((a) => (
              <div key={a.asset} className="mb-2">
                <div className="flex justify-between text-sm"><span>{a.asset}</span><span>{a.pct}%</span></div>
                <div className="h-2 rounded bg-border"><div className="h-2 rounded bg-primary" style={{ width: a.pct + "%" }} /></div>
              </div>
            ))}
          </div>
          <div className={box}>
            <h2 className="font-semibold mb-2">Funding (deposits and P2P)</h2>
            {data.funding.map((r) => (
              <div key={r.asset} className="flex justify-between py-1 text-sm">
                <span>{r.asset}</span>
                <span>{fmt(r.available, 6)} <span className="text-text-muted">(locked {fmt(r.locked, 6)})</span></span>
              </div>
            ))}
          </div>
          <div className={box}>
            <h2 className="font-semibold mb-2">Spot and fiat</h2>
            {data.spot.map((r) => (
              <div key={r.asset} className="flex justify-between py-1 text-sm">
                <span>{r.asset === "KES" ? "KES (fiat)" : r.asset}</span><span>{fmt(r.available, 6)}</span>
              </div>
            ))}
          </div>
          <div className={box + " grid grid-cols-4 text-center text-sm"}>
            <div><p className="font-bold">{data.stats.deposits}</p><p className="text-text-muted">Deposits</p></div>
            <div><p className="font-bold">{data.stats.withdrawals}</p><p className="text-text-muted">Withdrawals</p></div>
            <div><p className="font-bold">{data.stats.transfers}</p><p className="text-text-muted">Transfers</p></div>
            <div><p className="font-bold">{data.stats.conversions}</p><p className="text-text-muted">Converts</p></div>
          </div>
        </div>
      )}

      {data && tab === "Transfer" && (
        <form className={box + " space-y-3"} onSubmit={(e) => { e.preventDefault();
          act("/portfolio/transfer", { ...tr, amount: Number(tr.amount) }, () => setTr({ ...tr, amount: "" })); }}>
          <h2 className="font-semibold">Move between Funding and Spot</h2>
          <select className={field} value={tr.direction} onChange={(e) => setTr({ ...tr, direction: e.target.value })}>
            <option value="to_spot">Funding to Spot</option>
            <option value="to_funding">Spot to Funding</option>
          </select>
          <select className={field} value={tr.asset} onChange={(e) => setTr({ ...tr, asset: e.target.value })}>
            {CRYPTO.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className={field} type="number" step="any" placeholder="Amount" value={tr.amount}
            onChange={(e) => setTr({ ...tr, amount: e.target.value })} />
          <button className={btn}>Move</button>
        </form>
      )}

      {data && tab === "Convert" && (
        <form className={box + " space-y-3"} onSubmit={(e) => { e.preventDefault();
          act("/portfolio/convert", { ...cv, amount: Number(cv.amount) }, () => setCv({ ...cv, amount: "" })); }}>
          <h2 className="font-semibold">Currency converter</h2>
          <p className="text-text-muted text-sm">Uses your Spot balance. Move funds there first in the Transfer tab.</p>
          <select className={field} value={cv.from_asset} onChange={(e) => setCv({ ...cv, from_asset: e.target.value })}>
            {ALL.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={field} value={cv.to_asset} onChange={(e) => setCv({ ...cv, to_asset: e.target.value })}>
            {ALL.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className={field} type="number" step="any" placeholder="Amount" value={cv.amount}
            onChange={(e) => setCv({ ...cv, amount: e.target.value })} />
          {estimate > 0 && <p className="text-sm">You get about <b>{fmt(estimate, 6)} {cv.to_asset}</b> (demo rate)</p>}
          <button className={btn}>Convert</button>
        </form>
      )}

      {data && tab === "History" && (
        <div className={box}>
          <select className={field + " mb-3"} value={filter}
            onChange={(e) => { setFilter(e.target.value); load(e.target.value); }}>
            <option value="">All activity</option>
            <option value="deposit">Deposits</option>
            <option value="withdraw">Withdrawals</option>
            <option value="transfer">Transfers</option>
            <option value="convert">Conversions</option>
          </select>
          {items.length === 0 && <p className="text-text-muted text-sm">No activity yet.</p>}
          {items.map((t) => (
            <div key={t.id} className="border-t border-border py-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold capitalize">{t.kind} {t.asset}</span>
                <span>{fmt(t.amount, 6)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>{t.note}</span>
                <span className={t.status === "completed" ? "text-success" : "text-primary"}>{t.status}</span>
              </div>
              <div className="text-text-muted text-xs">{new Date(t.created_ts * 1000).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
