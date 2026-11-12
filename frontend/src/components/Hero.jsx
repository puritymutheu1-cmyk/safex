const prices = [
  { symbol: 'BTC', name: 'Bitcoin', price: '$67,842.15', change: '+1.32%', up: true },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,512.47', change: '+2.08%', up: true },
  { symbol: 'USDT', name: 'Tether', price: '$1.00', change: '-0.01%', up: false },
  { symbol: 'SOL', name: 'Solana', price: '$164.38', change: '+3.45%', up: true },
]

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-primary text-sm font-medium tracking-wide mb-3">
          PEER-TO-PEER CRYPTO TRADING
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
          Trade Crypto
          <span className="text-primary"> Securely</span>
        </h1>
        <p className="text-text-muted text-lg mb-8 max-w-md leading-relaxed">
          Safex is a trusted peer-to-peer platform to buy and sell crypto directly with other users.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-lg transition">
            Create Account
          </button>
          <button className="border border-border hover:border-primary/50 text-text font-medium px-6 py-3 rounded-lg transition">
            Explore Markets
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">Live Prices</h3>
          <span className="text-xs text-text-muted">Updated just now</span>
        </div>
        <div className="space-y-4">
          {prices.map((coin) => (
            <div key={coin.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center text-xs font-bold">
                  {coin.symbol[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{coin.symbol}</p>
                  <p className="text-xs text-text-muted">{coin.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{coin.price}</p>
                <p className={coin.up ? 'text-xs text-success' : 'text-xs text-error'}>
                  {coin.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
