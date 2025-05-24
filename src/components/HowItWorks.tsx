
import React, { useEffect, useState, useRef } from "react";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Upload Your Clothes",
    description: "Take photos of your items or import from existing photos. Our AI identifies and categorizes each piece."
  },
  {
    number: "02",
    title: "Build Your Style Profile",
    description: "Tell us your preferences, favorite colors, and style inspirations to personalize your experience."
  },
  {
    number: "03",
    title: "Get AI-Powered Outfit Suggestions",
    description: "Ask for outfit ideas for any occasion, weather, or mood using your actual wardrobe items."
  },
  {
    number: "04",
    title: "Find Inspiration Anywhere",
    description: "Upload Pinterest images or style photos, and we'll match them with items from your closet."
  }
];

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <section id="how-it-works" className="py-20" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your fashion journey in four simple steps
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-muted">
              <div 
                className="absolute top-0 w-full bg-emerald transition-all duration-1000 ease-in-out" 
                style={{ 
                  height: `${((activeStep + 1) / steps.length) * 100}%`,
                }}
              ></div>
            </div>
            
            {/* Steps */}
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`relative pl-32 pb-12 transition-all duration-500 ${
                  index <= activeStep 
                    ? "opacity-100" 
                    : "opacity-30"
                }`}
              >
                <div 
                  className={`absolute left-8 top-0 flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium transition-all duration-500 ${
                    index <= activeStep 
                      ? "bg-emerald" 
                      : "bg-muted"
                  }`}
                >
                  {index <= activeStep ? (
                    <ArrowRight className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground font-medium">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
