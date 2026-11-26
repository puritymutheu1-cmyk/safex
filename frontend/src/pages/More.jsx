import { Link, Navigate, useNavigate } from "react-router-dom";

const GROUPS = [
  {
    "group": "Trade",
    "items": [
      {
        "to": "/marketplace",
        "label": "Buy crypto",
        "desc": "Browse offers and buy"
      },
      {
        "to": "/create-offer",
        "label": "Sell crypto",
        "desc": "Post an offer"
      },
      {
        "to": "/dashboard",
        "label": "My trades and offers",
        "desc": "Track your trades"
      }
    ]
  },
  {
    "group": "Money",
    "items": [
      {
        "to": "/wallet",
        "label": "Wallet",
        "desc": "Deposit, withdraw and history"
      },
      {
        "to": "/portfolio",
        "label": "Portfolio",
        "desc": "Balances, transfer, convert and history"
      }
    ]
  },
  {
    "group": "Earn",
    "items": [
      {
        "to": "/rewards",
        "label": "Rewards",
        "desc": "Referral code and verification"
      }
    ]
  },
  {
    "group": "Account",
    "items": [
      {
        "to": "/settings",
        "label": "Settings",
        "desc": "Profile, payment methods and security"
      }
    ]
  },
  {
    "group": "Help and info",
    "items": [
      {
        "to": "/support",
        "label": "Support",
        "desc": "Get help"
      },
      {
        "to": "/faq",
        "label": "FAQ",
        "desc": "Common questions"
      },
      {
        "to": "/learn",
        "label": "Learn",
        "desc": "Guides for beginners"
      },
      {
        "to": "/how-it-works",
        "label": "How it works",
        "desc": "Step by step"
      },
      {
        "to": "/security",
        "label": "Security",
        "desc": "How we protect you"
      },
      {
        "to": "/pricing",
        "label": "Pricing",
        "desc": "Fees"
      },
      {
        "to": "/about",
        "label": "About",
        "desc": "About Safex"
      }
    ]
  }
];

export default function More() {
  const navigate = useNavigate();
  if (!localStorage.getItem("token")) return <Navigate to="/login" replace />;
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      {GROUPS.map((g) => (
        <div key={g.group} className="mb-5">
          <h2 className="text-xs uppercase tracking-wider text-text-muted mb-2">{g.group}</h2>
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            {g.items.map((i, idx) => (
              <Link key={i.to} to={i.to}
                className={"flex justify-between items-center px-4 py-3 " + (idx > 0 ? "border-t border-border" : "")}>
                <span>
                  <span className="block font-medium">{i.label}</span>
                  <span className="block text-sm text-text-muted">{i.desc}</span>
                </span>
                <span className="text-text-muted">{">"}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
      <button onClick={logout} className="w-full rounded-xl border border-error text-error font-semibold px-4 py-2.5">Log out</button>
    </div>
  );
}
