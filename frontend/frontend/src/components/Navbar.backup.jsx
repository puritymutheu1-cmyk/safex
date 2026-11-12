import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

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
          <Link to="/" className={`transition ${isActive('/') ? 'text-text' : 'text-text-muted hover:text-text'}`}>
            Home
          </Link>
          <Link to="/markets" className={`transition ${isActive('/markets') ? 'text-text' : 'text-text-muted hover:text-text'}`}>
            Markets
          </Link>
          <Link to="/dashboard" className={`transition ${isActive('/dashboard') ? 'text-text' : 'text-text-muted hover:text-text'}`}>
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-text-muted hover:text-text transition hidden sm:block">
            Sign In
          </Link>
          <Link to="/login" className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
