import { Link, useLocation } from "react-router-dom";

const tabs = [
  { to: "/marketplace", label: "Buy", also: [] },
  { to: "/create-offer", label: "Sell", also: [] },
  { to: "/wallet", label: "Wallet", also: [] },
  { to: "/dashboard", label: "Trades", also: [] },
  { to: "/more", label: "More", also: ["/portfolio", "/settings", "/rewards"] },
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
            (pathname === t.to || t.also.includes(pathname) ? "text-primary" : "text-text-muted")
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
