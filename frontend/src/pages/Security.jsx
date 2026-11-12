import InfoPage from "../components/InfoPage";

export default function Security() {
  return (
    <InfoPage
      eyebrow="PLATFORM"
      title="Security"
      intro="Here is what Safex does to protect your account, and what it does not do yet."
      sections={[
        { heading: "What is in place", bullets: ["Passwords are salted and hashed, never stored as plain text", "Logins use signed tokens that expire after 12 hours", "The site and the server are served over HTTPS", "The server checks who you are on every action, so only the buyer can mark a trade paid and only the seller can release it"] },
        { heading: "What is not in place yet", bullets: ["No escrow: Safex does not hold crypto or money", "No automatic payment verification", "No two-factor authentication", "No dispute process"] },
        { heading: "Staying safe", bullets: ["Do not reuse a password from another account", "Only release crypto after you see the money in your own account", "Treat Safex as a demo and do not trade real money on it"] },
      ]}
      cta={{ to: "/faq", label: "Read the FAQ" }}
    />
  );
}
