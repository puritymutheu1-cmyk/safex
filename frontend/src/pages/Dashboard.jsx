import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [trades, setTrades] = useState([]);
  const [error, setError] = useState("");
  const loggedIn = !!localStorage.getItem("token");

  const load = async () => {
    try {
      const [u, t] = await Promise.all([
        api.get("/auth/me"),
        api.get("/trades/mine"),
      ]);
      setMe(u.data);
      setTrades(t.data);
    } catch (err) {
      setError("Could not load your data.");
    }
  };

  useEffect(() => {
    if (loggedIn) load();
  }, []);

  const act = async (id, action) => {
    setError("");
    try {
      await api.post("/trades/" + id + "/" + action);
      load();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Action failed.");
    }
  };

  if (!loggedIn) return <Navigate to="/login" replace />;

  const active = trades.filter((t) => t.status === "pending" || t.status === "paid").length;
  const done = trades.filter((t) => t.status === "completed").length;

  const btn = "px-3 py-1 rounded-lg text-white text-sm ";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">
        {me ? "Hi, " + me.name : "Dashboard"}
      </h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="bg-white text-black shadow rounded-xl p-5">
          <p className="text-gray-500 text-sm">Active trades</p>
          <p className="text-2xl font-bold">{active}</p>
        </div>
        <div className="bg-white text-black shadow rounded-xl p-5">
          <p className="text-gray-500 text-sm">Completed trades</p>
          <p className="text-2xl font-bold">{done}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">My trades</h2>
      {trades.length === 0 && <p>No trades yet. Visit the Marketplace to start one.</p>}

      <div className="space-y-3">
        {trades.map((t) => {
          const isBuyer = me && t.buyer_id === me.id;
          return (
            <div key={t.id} className="bg-white text-black shadow rounded-xl p-4">
              <div className="flex justify-between">
                <p className="font-semibold">
                  {isBuyer ? "Buying from " + t.seller : "Selling to " + t.buyer}
                </p>
                <span className="text-sm bg-gray-100 px-2 rounded">{t.status}</span>
              </div>
              <p className="text-sm text-gray-600">
                {t.amount_coin} {t.coin} for KES {t.amount_kes.toLocaleString()}
              </p>
              <div className="flex gap-2 mt-3">
                {t.status === "pending" && isBuyer && (
                  <button onClick={() => act(t.id, "paid")} className={btn + "bg-purple-600"}>
                    I have paid
                  </button>
                )}
                {t.status === "paid" && !isBuyer && (
                  <button onClick={() => act(t.id, "release")} className={btn + "bg-green-600"}>
                    Release crypto
                  </button>
                )}
                {t.status === "pending" && (
                  <button onClick={() => act(t.id, "cancel")} className={btn + "bg-red-600"}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
