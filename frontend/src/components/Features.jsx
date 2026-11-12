import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Simple Trade Flow',
    description: 'Every trade moves through clear steps: pending, paid, then completed.',
    to: '/faq',
  },
  {
    title: 'Local Payments',
    description: 'Sellers accept M-Pesa, Airtel Money or bank transfer, priced in KES.',
    to: '/marketplace',
  },
  {
    title: 'Free to Use',
    description: 'Create an account, post offers and start trades at no cost.',
    to: '/register',
  },
  {
    title: 'Escrow & Disputes',
    description: 'Planned next: held funds and a dispute process for each trade.',
    to: '/faq',
    badge: 'Planned',
  },
]

export default function Features() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-primary text-sm font-medium mb-2">FEATURES</p>
        <h2 className="text-3xl font-bold">Built for Clear, Simple Trading.</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feature) => (
          <Link
            key={feature.title}
            to={feature.to}
            className="block bg-surface border border-border rounded-xl p-5 transition hover:border-primary"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{feature.title}</h3>
              {feature.badge && (
                <span className="text-xs text-primary border border-primary rounded-full px-2 py-0.5">
                  {feature.badge}
                </span>
              )}
            </div>
            <p className="text-text-muted text-sm leading-relaxed">{feature.description}</p>
            <span className="inline-block mt-3 text-primary text-sm">Learn more →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
