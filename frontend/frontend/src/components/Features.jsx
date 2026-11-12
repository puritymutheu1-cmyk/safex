const features = [
  { title: 'Escrow Protection', description: 'Your funds are safe with our multi-signature escrow system.' },
  { title: 'Dispute Resolution', description: '24/7 support and fair dispute resolution for every trade.' },
  { title: 'Low Fees', description: 'Competitive rates that maximize your trading power.' },
  { title: 'Privacy First', description: 'Trade privately with no KYC for basic access.' },
]

export default function Features() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-primary text-sm font-medium mb-2">FEATURES</p>
        <h2 className="text-3xl font-bold">Built for Trust and Performance.</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feature) => (
          <div key={feature.title} className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-text-muted text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
