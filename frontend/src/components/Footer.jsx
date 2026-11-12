export default function Footer() {
  return (
    <footer className="border-t border-border mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center font-bold text-white text-xs">
            S
          </div>
          <span className="font-semibold">Safex</span>
        </div>
        <p className="text-text-muted text-sm">
          © 2026 Safex. Trade crypto securely.
        </p>
      </div>
    </footer>
  )
}
