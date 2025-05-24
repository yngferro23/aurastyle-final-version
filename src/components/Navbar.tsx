import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById("waitlist");
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/90 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between py-4">
        <div className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-dark to-emerald text-transparent bg-clip-text">
            Aura Style AI
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:text-emerald transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-emerald transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-sm font-medium hover:text-emerald transition-colors">
            Pricing
          </a>
        </div>

        <Button 
          onClick={scrollToWaitlist} 
          className="bg-emerald hover:bg-emerald-dark text-white hover-lift"
        >
          Join Waitlist <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </nav>
    </header>
  );
};

export default Navbar;
