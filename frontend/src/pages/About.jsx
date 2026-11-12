import InfoPage from "../components/InfoPage";

export default function About() {
  return (
    <InfoPage
      eyebrow="RESOURCES"
      title="About Safex"
      intro="Safex is a peer-to-peer crypto trading demo built by Purity Mutheu as a full-stack portfolio project."
      sections={[
        { heading: "Why it exists", text: "To practise building a complete web app: accounts, a live marketplace, a trade flow and deployment." },
        { heading: "How it is built", bullets: ["Frontend: React, Vite, React Router, Tailwind CSS (hosted on Netlify)", "Backend: Python and FastAPI (hosted on Render)", "Database: PostgreSQL in production"] },
        { heading: "What comes next", bullets: ["Escrow and payment verification", "A dispute process", "Chat between buyer and seller", "Notifications"] },
      ]}
      cta={{ href: "https://github.com/puritymutheu1-cmyk/safex", label: "View the code on GitHub" }}
    />
  );
}
