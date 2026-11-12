import InfoPage from "../components/InfoPage";

export default function Pricing() {
  return (
    <InfoPage
      eyebrow="PLATFORM"
      title="Pricing"
      intro="Safex is free to use while it is a demo project. Nothing is charged by the platform today."
      sections={[
        { heading: "What is free", bullets: ["Creating an account", "Posting and closing offers", "Starting and completing trades", "Using the Dashboard"] },
        { heading: "Platform fees", text: "There are none right now. If Safex grows, a small fee on completed trades could be introduced, and it would be shown clearly before you trade." },
        { heading: "Costs outside Safex", text: "Your payment provider, such as M-Pesa, Airtel Money or your bank, may charge its own transaction fees. Those are set by the provider, not by Safex." },
      ]}
      cta={{ to: "/register", label: "Create a free account" }}
    />
  );
}
