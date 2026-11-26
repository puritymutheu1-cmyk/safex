import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../services/api";

const TABS = ["Referral", "Verification"];
const box = "rounded-2xl border border-border bg-surface p-4";
const field = "w-full rounded-xl border border-border bg-background px-3 py-2";
const btn = "w-full rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-2.5";

export default function Rewards() {
  const [tab, setTab] = useState("Referral");
  const [ref, setRef] = useState(null);
  const [ver, setVer] = useState(null);
  const [code, setCode] = useState("");
  const [form, setForm] = useState({ full_name: "", country: "Kenya", doc_type: "National ID" });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const loggedIn = !!localStorage.getItem("token");

  const load = async () => {
    try {
      const [a, b] = await Promise.all([
        api.get("/growth/referral"),
        api.get("/growth/verification"),
      ]);
      setRef(a.data);
      setVer(b.data);
    } catch {
      setError("Could not load. The server may be waking up, try again in a minute.");
    }
  };

  useEffect(() => {
    if (loggedIn) load();
  }, []);

  const run = async (call, after) => {
    setError("");
    setMsg("");
    try {
      const res = await call();
      setMsg(res.data.message);
      after && after();
      load();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Something went wrong. Try again.");
    }
  };

  const share = async () => {
    const text = "Join me on Safex, a P2P crypto trading demo. Sign up at " + window.location.origin +
      " and enter my referral code " + ref.code + " in Rewards.";
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setMsg("Copied. Paste it in WhatsApp or anywhere.");
      }
    } catch {
      /* cancelled */
    }
  };

  if (!loggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold">Rewards</h1>
      <p className="text-text-muted text-sm mb-4">
        Demo rewards paid in demo USDT. No real money.{" "}
        <Link to="/wallet" className="text-primary underline">Wallet</Link>
      </p>
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setError(""); setMsg(""); }}
            className={"px-4 py-2 rounded-full text-sm border " +
              (tab === t ? "bg-primary text-white border-primary" : "border-border text-text-muted")}>
            {t}
          </button>
        ))}
      </div>
      {error && <p className="text-error mb-3">{error}</p>}
      {msg && <p className="text-success mb-3">{msg}</p>}
      {!ref && !error && <p className="text-text-muted">Loading...</p>}

      {ref && tab === "Referral" && (
        <div className="space-y-4">
          <div className={box + " text-center"}>
            <p className="text-text-muted text-sm">Your referral code</p>
            <p className="text-3xl font-bold tracking-wider my-2">{ref.code}</p>
            <p className="text-sm text-text-muted mb-3">
              Invite a friend. When they enter your code, you get {ref.referrer_bonus} USDT and they get {ref.new_user_bonus} USDT (demo).
            </p>
            <button className={btn} onClick={share}>Share my code</button>
          </div>
          <div className={box + " grid grid-cols-2 text-center"}>
            <div><p className="text-2xl font-bold">{ref.count}/{ref.limit}</p><p className="text-text-muted text-sm">Friends invited</p></div>
            <div><p className="text-2xl font-bold">{ref.earned_usdt}</p><p className="text-text-muted text-sm">USDT earned</p></div>
          </div>
          {!ref.already_used_code && (
            <form className={box + " space-y-3"} onSubmit={(e) => { e.preventDefault();
              run(() => api.post("/growth/referral/apply", { code }), () => setCode("")); }}>
              <h2 className="font-semibold">Got a friend's code?</h2>
              <input className={field} placeholder="e.g. SFX4130" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className={btn}>Apply code</button>
            </form>
          )}
          <div className={box}>
            <h2 className="font-semibold mb-2">Friends who joined</h2>
            {ref.friends.length === 0 && <p className="text-text-muted text-sm">No one yet.</p>}
            {ref.friends.map((f, i) => (
              <div key={i} className="flex justify-between border-t border-border py-2 text-sm">
                <span>{f.name}</span>
                <span className="text-text-muted">{new Date(f.created_ts * 1000).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ver && tab === "Verification" && (
        <div className="space-y-4">
          <div className={box}>
            <p className="text-text-muted text-sm">Status</p>
            <p className={"text-2xl font-bold capitalize " + (ver.status === "verified" ? "text-success" : "")}>{ver.status}</p>
            <p className="text-sm text-text-muted mt-1">
              This is a demo. We do not ask for ID numbers or photos, and nothing is checked by a real person.
            </p>
          </div>
          {ver.status === "unverified" && (
            <form className={box + " space-y-3"} onSubmit={(e) => { e.preventDefault();
              run(() => api.post("/growth/verification", form)); }}>
              <h2 className="font-semibold">Verify your identity (demo)</h2>
              <input className={field} placeholder="Full name" value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <input className={field} placeholder="Country" value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })} />
              <select className={field} value={form.doc_type} onChange={(e) => setForm({ ...form, doc_type: e.target.value })}>
                <option>National ID</option>
                <option>Passport</option>
                <option>Driving licence</option>
              </select>
              <button className={btn}>Submit</button>
            </form>
          )}
          {ver.status !== "unverified" && (
            <div className={box + " text-sm"}>
              <p><span className="text-text-muted">Name:</span> {ver.full_name}</p>
              <p><span className="text-text-muted">Country:</span> {ver.country}</p>
              <p><span className="text-text-muted">Document:</span> {ver.doc_type}</p>
              {ver.status === "pending" && <p className="text-text-muted mt-2">Pending. Refresh in about a minute.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
