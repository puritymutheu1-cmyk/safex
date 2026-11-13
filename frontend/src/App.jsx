import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import InstallPrompt from "./components/InstallPrompt";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import CreateOffer from "./pages/CreateOffer";
import Dashboard from "./pages/Dashboard";
import FAQ from "./pages/FAQ";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Security from "./pages/Security";
import Learn from "./pages/Learn";
import Support from "./pages/Support";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <InstallPrompt />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/create-offer" element={<CreateOffer />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/security" element={<Security />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/support" element={<Support />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
