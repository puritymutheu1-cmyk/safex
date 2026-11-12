import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const platform = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/security', label: 'Security' },
]
const resources = [
  { to: '/learn', label: 'Learn' },
  { to: '/support', label: 'Support' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
]

function Dropdown({ label, items, openKey, setOpenKey, pathname }) {
  const open = openKey === label
  const active = items.some((i) => i.to === pathname)
  return (
    <div className="relative">
      <button
        onClick={() => setOpenKey(open ? '' : label)}
        className={`transition ${active || open ? 'text-text' : 'text-text-muted hover:text-text'}`}
      >
        {label} ▾
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-3 w-44 bg-surface border border-border rounded-xl py-2 shadow-lg">
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              onClick={() => setOpenKey('')}
              className="block px-4 py-2 text-sm text-text-muted hover:text-text"
            >
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openKey, setOpenKey] = useState('')
  const loggedIn = !!localStorage.getItem('token')
  const path = location.pathname

  useEffect(() => {
    setMobileOpen(false)
    setOpenKey('')
  }, [path])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const linkClass = (to) =>
    `transition ${path === to ? 'text-text' : 'text-text-muted hover:text-text'}`

  return (
    <nav className="w-full border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-sm">
            S
          </div>
          <span className="text-xl font-semibold tracking-tight">Safex</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/marketplace" className={linkClass('/marketplace')}>Marketplace</Link>
          <Dropdown label="Platform" items={platform} openKey={openKey} setOpenKey={setOpenKey} pathname={path} />
          <Dropdown label="Resources" items={resources} openKey={openKey} setOpenKey={setOpenKey} pathname={path} />
          {loggedIn && <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>}
          {loggedIn && <Link to="/create-offer" className={linkClass('/create-offer')}>Sell</Link>}
        </div>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <button onClick={logout} className="hidden md:block bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm text-text-muted hover:text-text transition hidden sm:block">Sign In</Link>
              <Link to="/register" className="hidden md:block bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">
                Get Started
              </Link>
            </>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" className="md:hidden text-2xl px-2">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border px-6 py-4 flex flex-col gap-3 text-sm max-h-[80vh] overflow-y-auto">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/marketplace" className={linkClass('/marketplace')}>Marketplace</Link>

          <p className="text-xs text-text-muted uppercase tracking-wide mt-2">Platform</p>
          {platform.map((i) => (
            <Link key={i.to} to={i.to} className={linkClass(i.to)}>{i.label}</Link>
          ))}

          <p className="text-xs text-text-muted uppercase tracking-wide mt-2">Resources</p>
          {resources.map((i) => (
            <Link key={i.to} to={i.to} className={linkClass(i.to)}>{i.label}</Link>
          ))}

          {loggedIn ? (
            <>
              <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
              <Link to="/create-offer" className={linkClass('/create-offer')}>Sell</Link>
              <button onClick={logout} className="text-left text-text-muted hover:text-text">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-text-muted hover:text-text">Sign In</Link>
              <Link to="/register" className="bg-primary text-white font-medium px-5 py-2.5 rounded-lg text-center">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
