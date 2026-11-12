import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "What is Safex?",
    a: "Safex is a peer-to-peer platform where people trade crypto directly with each other. Sellers post offers with their own price and limits, and buyers pick the offer that suits them.",
  },
  {
    q: "Is Safex free to use?",
    a: "Yes. Creating an account, posting offers and starting trades cost nothing on this demo.",
  },
  {
    q: "How do I buy crypto?",
    a: "Open the Marketplace, choose an offer, tap Buy and enter an amount within the seller's limits. Then pay the seller using their payment method and press I have paid on your Dashboard.",
  },
  {
    q: "How do I sell crypto?",
    a: "Log in, tap Sell, and post an offer with your coin, price, limits and payment method. When a buyer starts a trade and tells you they have paid, confirm the money arrived and press Release crypto.",
  },
  {
    q: "What do the trade statuses mean?",
    a: "Pending means the trade has started and the buyer has not paid yet. Paid means the buyer says they have paid. Completed means the seller confirmed and released the crypto. Cancelled means the trade was stopped before payment.",
  },
];

faqs.push(
  {
    q: "Can I cancel a trade?",
    a: "Yes, either the buyer or the seller can cancel while the trade is still pending. Once it is marked as paid it can no longer be cancelled.",
  },
  {
    q: "Which payment methods are supported?",
    a: "Sellers choose between M-Pesa, Airtel Money and bank transfer when they post an offer.",
  },
  {
    q: "Does Safex hold my crypto or money?",
    a: "No. Safex is a portfolio demo that tracks trades between users. It does not hold funds, verify payments or provide escrow, so please do not use it to trade real money.",
  },
  {
    q: "Is my password safe?",
    a: "Passwords are hashed before they are stored, and logins use signed tokens that expire after 12 hours. As this is a demo, avoid reusing a password from another account.",
  },
  {
    q: "Why was the first load slow?",
    a: "The demo runs on free hosting, and the server goes to sleep when nobody uses it. The first request can take up to a minute to wake it up. After that it is fast.",
  }
);

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Frequently asked questions</h1>
      <p className="text-text-muted mb-8">Quick answers about trading on Safex.</p>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={f.q} className="bg-surface border border-border rounded-xl">
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
              className="w-full flex justify-between items-center text-left px-5 py-4 font-medium"
            >
              <span>{f.q}</span>
              <span className="text-primary text-xl ml-4">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <p className="px-5 pb-4 text-text-muted leading-relaxed">{f.a}</p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-text-muted">
        Ready to try it?{" "}
        <Link to="/marketplace" className="text-primary underline">
          Visit the Marketplace
        </Link>
      </p>
    </div>
  );
}
