import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../services/api";

const TABS = ["Payments", "Profile", "Security"];
const box = "rounded-2xl border border-border bg-surface p-4";
const field = "w-full rounded-xl border border-border bg-background px-3 py-2";
const btn = "w-full rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-2.5";

export default function Settings() {
  const [tab, setTab] = useState("Payments");
  const [methods, setMethods] = useState([]);
  const [options, setOptions] = useState([]);
  const [pm, setPm] = useState({ method: "M-Pesa", details: "" });
  const [prof, setProf] = useState({ name: "", email: "", currency: "USD" });
  const [pw, setPw] = useState({ current_password: "", new_password: "" });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const loggedIn = !!localStorage.getItem("token");

  const load = async () => {
    try {
      const [a, b] = await Promise.all([
        api.get("/account/payment-methods"),
        api.get("/account/settings"),
      ]);
      setMethods(a.data.items);
      setOptions(a.data.methods);
      setProf(b.data);
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

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!loggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-text-muted text-sm mb-4">
        <Link to="/portfolio" className="text-primary underline">Portfolio</Link>
        {" · "}
        <Link to="/wallet" className="text-primary underline">Wallet</Link>
        {" · "}
        <Link to="/support" className="text-primary underline">Get help</Link>
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

      {tab === "Payments" && (
        <div className="space-y-4">
          <form className={box + " space-y-3"} onSubmit={(e) => { e.preventDefault();
            run(() => api.post("/account/payment-methods", pm), () => setPm({ ...pm, details: "" })); }}>
            <h2 className="font-semibold">Add a payment method</h2>
            <select className={field} value={pm.method} onChange={(e) => setPm({ ...pm, method: e.target.value })}>
              {(options.length ? options : ["M-Pesa"]).map((m) => <option key={m}>{m}</option>)}
            </select>
            <input className={field} placeholder="e.g. 0710 000 000 (Your Name)" value={pm.details}
              onChange={(e) => setPm({ ...pm, details: e.target.value })} />
            <button className={btn}>Save</button>
          </form>
          <div className={box}>
            <h2 className="font-semibold mb-2">Your saved methods</h2>
            {methods.length === 0 && <p className="text-text-muted text-sm">None yet.</p>}
            {methods.map((m) => (
              <div key={m.id} className="flex justify-between items-center border-t border-border py-2 text-sm">
                <div><p className="font-semibold">{m.method}</p><p className="text-text-muted">{m.details}</p></div>
                <button className="text-error" onClick={() => run(() => api.delete("/account/payment-methods/" + m.id))}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Profile" && (
        <form className={box + " space-y-3"} onSubmit={(e) => { e.preventDefault();
          run(() => api.put("/account/settings", { name: prof.name, currency: prof.currency })); }}>
          <h2 className="font-semibold">Profile and preferences</h2>
          <label className="text-sm text-text-muted">Email</label>
          <input className={field + " opacity-60"} value={prof.email} disabled />
          <label className="text-sm text-text-muted">Name</label>
          <input className={field} value={prof.name} onChange={(e) => setProf({ ...prof, name: e.target.value })} />
          <label className="text-sm text-text-muted">Preferred currency</label>
          <select className={field} value={prof.currency} onChange={(e) => setProf({ ...prof, currency: e.target.value })}>
            <option value="USD">USD</option>
            <option value="KES">KES</option>
          </select>
          <button className={btn}>Save</button>
        </form>
      )}

      {tab === "Security" && (
        <div className="space-y-4">
          <form className={box + " space-y-3"} onSubmit={(e) => { e.preventDefault();
            run(() => api.post("/account/change-password", pw), () => setPw({ current_password: "", new_password: "" })); }}>
            <h2 className="font-semibold">Change password</h2>
            <input className={field} type="password" placeholder="Current password" value={pw.current_password}
              onChange={(e) => setPw({ ...pw, current_password: e.target.value })} />
            <input className={field} type="password" placeholder="New password (8+ characters)" value={pw.new_password}
              onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
            <button className={btn}>Change password</button>
          </form>
          <div className={box}>
            <h2 className="font-semibold mb-1">Account protection tips</h2>
            <ul className="text-sm text-text-muted list-disc pl-5 space-y-1">
              <li>Use a password you do not use anywhere else.</li>
              <li>Never share your password or login with anyone.</li>
              <li>In a real trade, release crypto only after the money is in your account.</li>
              <li>Log out on shared phones and computers.</li>
            </ul>
          </div>
          <button onClick={logout} className="w-full rounded-xl border border-error text-error font-semibold px-4 py-2.5">Log out</button>
        </div>
      )}
    </div>
  );
}
