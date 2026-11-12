import InfoPage from "../components/InfoPage";

export default function HowItWorks() {
  return (
    <InfoPage
      eyebrow="PLATFORM"
      title="How Safex works"
      intro="Safex connects people who want to sell crypto with people who want to buy it. You trade directly with each other, and every trade follows the same simple steps."
      sections={[
        { heading: "1. Create an account", text: "Sign up with your name, email and a password. It takes under a minute and costs nothing." },
        { heading: "2. Find or post an offer", text: "Browse the Marketplace and filter by BTC, ETH or USDT, or tap Sell to post your own offer with a price, limits and payment method." },
        { heading: "3. Start a trade", text: "Pick an offer, enter an amount within the seller's limits, and see how much crypto you will receive before you confirm." },
        { heading: "4. Pay the seller", text: "Send the money using the seller's payment method, such as M-Pesa, Airtel Money or bank transfer, then press I have paid on your Dashboard." },
        { heading: "5. Seller releases the crypto", text: "Once the seller sees the payment, they press Release crypto and the trade is completed. A trade can be cancelled by either side while it is still pending." },
      ]}
      cta={{ to: "/marketplace", label: "Browse offers" }}
    />
  );
}
