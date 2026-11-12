import { Link } from "react-router-dom";

export default function InfoPage({ eyebrow, title, intro, sections = [], cta }) {
  const btn = "inline-block mt-8 bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-lg transition";
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {eyebrow && <p className="text-primary text-sm font-medium mb-2">{eyebrow}</p>}
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
      <p className="text-text-muted text-lg mb-10 leading-relaxed">{intro}</p>
      <div className="space-y-5">
        {sections.map((s) => (
          <div key={s.heading} className="bg-surface border border-border rounded-xl p-5">
            <h2 className="font-semibold mb-2">{s.heading}</h2>
            {s.text && <p className="text-text-muted leading-relaxed">{s.text}</p>}
            {s.bullets && (
              <ul className="list-disc pl-5 space-y-1 text-text-muted">
                {s.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
      {cta && cta.href && (
        <a href={cta.href} target="_blank" rel="noreferrer" className={btn}>{cta.label}</a>
      )}
      {cta && cta.to && <Link to={cta.to} className={btn}>{cta.label}</Link>}
    </div>
  );
}
