import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Marketplace() {
  const [coin, setCoin] = useState("ALL");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get("/offers", { params: { coin } })
      .then((res) => setOffers(res.data))
      .catch(() => setError("Could not load offers."))
      .finally(() => setLoading(false));
  }, [coin]);

  const openBuy = (offer) => {
    if (!localStorage.getItem("token")) return navigate("/login");
    setSelected(offer);
    setAmount("");
    setMsg("");
  };

  const confirmBuy = async () => {
    setMsg("");
    try {
      await api.post("/trades", {
        offer_id: selected.id,
        amount_kes: Number(amount),
      });
      navigate("/dashboard");
    } catch (err) {
      const d = err.response?.data?.detail;
      setMsg(typeof d === "string" ? d : "Could not start trade.");
    }
  };

  const estimate = selected && amount ? (Number(amount) / selected.price).toFixed(6) : "0";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

      <div className="flex gap-2 mb-6">
        {["ALL", "BTC", "ETH", "USDT"].map((c) => (
          <button
            key={c}
            onClick={() => setCoin(c)}
            className={"px-4 py-1 rounded-full border " + (coin === c ? "bg-blue-600 text-white" : "bg-white text-black")}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <p>Loading offers...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && offers.length === 0 && (
        <p>No offers yet. Be the first to sell!</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {offers.map((o) => (
          <div key={o.id} className="bg-white text-black shadow rounded-xl p-5">
            <div className="flex justify-between">
              <h2 className="font-semibold">{o.seller}</h2>
              <span className="text-sm bg-gray-100 px-2 rounded">{o.coin}</span>
            </div>
            <p className="mt-2 text-lg font-bold">KES {o.price.toLocaleString()}</p>
            <p className="text-sm text-gray-600">
              Limit: {o.min_kes.toLocaleString()} - {o.max_kes.toLocaleString()} KES
            </p>
            <p className="text-sm text-gray-600">Pay with: {o.method}</p>
            <button
              onClick={() => openBuy(o)}
              className="mt-4 w-full bg-green-600 text-white rounded-lg py-2"
            >
              Buy {o.coin}
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
          <div className="bg-white text-black rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="text-xl font-bold">Buy {selected.coin} from {selected.seller}</h2>
            <p className="text-sm text-gray-600">
              Limit: {selected.min_kes.toLocaleString()} - {selected.max_kes.toLocaleString()} KES
            </p>
            {msg && <p className="text-red-600 text-sm">{msg}</p>}
            <input
              type="number"
              placeholder="Amount in KES"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />
            <p className="text-sm">You will receive about {estimate} {selected.coin}</p>
            <div className="flex gap-2">
              <button onClick={() => setSelected(null)} className="flex-1 border rounded-lg py-2">
                Cancel
              </button>
              <button onClick={confirmBuy} className="flex-1 bg-green-600 text-white rounded-lg py-2">
                Start trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
