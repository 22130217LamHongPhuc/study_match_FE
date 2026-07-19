import React from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import NLUSection from "./components/NLUSection";
import HowItWorksSection from "./components/HowItWorksSection";
import FeatureDetailsSection from "./components/FeatureDetailsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-inter antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <NLUSection />
        <HowItWorksSection />
        <FeatureDetailsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
