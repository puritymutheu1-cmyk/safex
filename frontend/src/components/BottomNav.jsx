import { Link, useLocation } from "react-router-dom";

const tabs = [
  { to: "/marketplace", label: "Buy" },
  { to: "/create-offer", label: "Sell" },
  { to: "/wallet", label: "Wallet" },
  { to: "/dashboard", label: "Trades" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  if (!localStorage.getItem("token")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border flex">
      {tabs.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          className={
            "flex-1 text-center py-3 text-sm font-medium " +
            (pathname === t.to ? "text-primary" : "text-text-muted")
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
