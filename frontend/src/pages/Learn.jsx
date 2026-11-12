import InfoPage from "../components/InfoPage";

export default function Learn() {
  return (
    <InfoPage
      eyebrow="RESOURCES"
      title="Learn"
      intro="A few basics to help you understand what you are looking at on Safex."
      sections={[
        { heading: "What is peer-to-peer trading?", text: "Instead of buying from an exchange, you trade directly with another person. The seller sets the price and limits, and you agree on how to pay." },
        { heading: "BTC, ETH and USDT", text: "Bitcoin (BTC) and Ethereum (ETH) are cryptocurrencies whose prices move a lot. USDT (Tether) is a stablecoin designed to track the US dollar, so its price stays close to one dollar." },
        { heading: "Reading an offer", text: "Each offer shows the price per coin in Kenyan shillings, the minimum and maximum you can trade, and how the seller wants to be paid." },
        { heading: "Trading safely", bullets: ["Check the price against another source before you trade", "Pay only through the method shown on the offer", "Never release crypto before the money has arrived", "If something feels wrong, cancel the trade while it is still pending"] },
      ]}
      cta={{ to: "/faq", label: "See common questions" }}
    />
  );
}
