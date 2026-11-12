import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Features from "../components/Features";
import ShareQR from "../components/ShareQR";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Open Safex on your phone</h2>
        <ShareQR />
      </section>
    </>
  );
}
