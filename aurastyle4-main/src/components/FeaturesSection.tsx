
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Digital Wardrobe",
    description: "Easily upload and organize your real clothes in a beautiful digital closet.",
    icon: "📸"
  },
  {
    title: "AI Style Assistant",
    description: "Get personalized outfit recommendations based on your actual wardrobe items.",
    icon: "✨"
  },
  {
    title: "Mood & Occasion",
    description: "Tell us where you're going or how you want to feel, and we'll suggest the perfect look.",
    icon: "🗓️"
  },
  {
    title: "Pinterest Integration",
    description: "Upload inspiration from Pinterest and we'll create similar looks with your clothes.",
    icon: "📌"
  },
  {
    title: "Style Analysis",
    description: "Get insights about your style preferences and wardrobe gaps.",
    icon: "📊"
  },
  {
    title: "Packing Lists",
    description: "Create travel packing lists with outfit combinations for any trip.",
    icon: "✈️"
  }
];

const FeaturesSection: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const index = parseInt(entry.target.getAttribute("data-index") || "0");
          
          if (entry.isIntersecting) {
            setVisibleItems(prev => 
              prev.includes(index) ? prev : [...prev, index]
            );
          }
        });
      },
      { threshold: 0.3 }
    );
    
    const featureElements = document.querySelectorAll(".feature-card");
    featureElements.forEach(el => observer.observe(el));
    
    return () => {
      featureElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="features" className="py-20 bg-beige-light/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Reimagine Your Wardrobe
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered styling assistant helps you make the most of the clothes you already own
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              data-index={index}
              className={`feature-card card-hover border-none shadow-md transition-all duration-700 ${
                visibleItems.includes(index) 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-12"
              }`}
            >
              <CardHeader>
                <div className="text-4xl mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
