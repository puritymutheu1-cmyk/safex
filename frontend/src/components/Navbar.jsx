import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const loggedIn = !!localStorage.getItem('token')

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path
  const linkClass = (path) =>
    `transition ${isActive(path) ? 'text-text' : 'text-text-muted hover:text-text'}`

  const links = [
    { to: '/', label: 'Home' },
    { to: '/marketplace', label: 'Marketplace' },
    ...(loggedIn ? [{ to: '/dashboard', label: 'Dashboard' }, { to: '/create-offer', label: 'Sell' }] : []),
  ]

  const logout = () => {
    localStorage.removeItem('token')
    setOpen(false)
    navigate('/login')
  }

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
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <button
              onClick={logout}
              className="hidden md:block bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
            >
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm text-text-muted hover:text-text transition hidden sm:block">
                Sign In
              </Link>
              <Link to="/register" className="hidden md:block bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">
                Get Started
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="md:hidden text-2xl px-2"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-6 py-4 flex flex-col gap-4 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)}>
              {l.label}
            </Link>
          ))}
          {loggedIn ? (
            <button onClick={logout} className="text-left text-text-muted hover:text-text">
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="text-text-muted hover:text-text">Sign In</Link>
              <Link to="/register" className="bg-primary text-white font-medium px-5 py-2.5 rounded-lg text-center">
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
