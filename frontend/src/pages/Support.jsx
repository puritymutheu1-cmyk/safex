import InfoPage from "../components/InfoPage";

export default function Support() {
  return (
    <InfoPage
      eyebrow="RESOURCES"
      title="Support"
      intro="Stuck, or found something that does not work? Here is where to get help."
      sections={[
        { heading: "Check the FAQ first", text: "The FAQ answers the most common questions about trading, statuses and security." },
        { heading: "Report a problem", text: "Safex is an open project. Describe what happened, what you expected, and which page you were on by opening an issue on GitHub." },
        { heading: "If the site is slow", text: "The demo runs on free hosting, and the server sleeps when nobody is using it. The first request can take about a minute. Wait and try again." },
      ]}
      cta={{ href: "https://github.com/puritymutheu1-cmyk/safex/issues", label: "Open an issue on GitHub" }}
    />
  );
}
