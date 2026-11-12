const stats = [
  { label: 'Secure logins', sub: 'Hashed passwords & JWT sessions' },
  { label: 'Peer-to-peer', sub: 'Trade directly with other users' },
  { label: 'Local payments', sub: 'M-Pesa, Airtel Money, bank transfer' },
  { label: 'Built for KES', sub: 'Offers priced in Kenyan shillings' },
]

export default function Stats() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item) => (
          <div key={item.label} className="bg-surface border border-border rounded-xl p-5 text-center">
            <p className="font-semibold text-sm">{item.label}</p>
            <p className="text-xs text-text-muted mt-1">{item.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
