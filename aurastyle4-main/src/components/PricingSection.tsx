import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

const pricingPlans = [
  {
    name: "Starter",
    price: "$5.99",
    description: "For everyday users who want smart outfit suggestions",
    features: [
      "Upload upto 100 clothing items",
      "Get upto 30 AI outfit suggestions/month",
      "Scan 15 Pinterest images/month",
      "Unlimited style types (casual, date, streetwear, etc.)",
      "Digital wardrobe organizer",
      "Save favorite outfits",
      "Email support",
    ],
    popular: false,
    color: "bg-beige hover:bg-beige-dark",
    iconColor: "text-emerald"
  },
  {
    name: "Pro",
    price: "$11.99",
    description: "For power users who want daily fashion inspiration",
    features: [
      "Upload up to 300 clothing items",
      "Get upto 100 outfit suggestions/month",
      "Unlimited Pinterest/Instagram scans",
      "Unlimited outfit styles & occasion matching",
      "Plan outfits by calendar",
      "AI fashion assistant (text-based)",
      "Early feature access",
      "Priority support",
    ],
    popular: true,
    color: "bg-emerald hover:bg-emerald-dark",
    iconColor: "text-white"
  },
  {
    name: "Lifetime Pro",
    price: "$89.99",
    period: "one-time",
    description: "Lifetime access to Pro features",
    features: [
      "Perfect for early adopters & creators",
      "All Pro features included",
      "Bonus: exclusive seasonal style templates",
      "Never pay monthly again",
      "Future feature updates included",
    ],
    popular: false,
    color: "bg-gold hover:bg-gold-dark",
    iconColor: "text-white",
    specialBadge: "Best Value"
  }
];

const PricingSection: React.FC = () => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById("waitlist");
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white to-beige-light/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your style needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden transition-all duration-500 ${
                hoveredPlan === index || (plan.popular && hoveredPlan === null)
                  ? "scale-105 shadow-lg border-emerald"
                  : "scale-100 shadow-md"
              }`}
              onMouseEnter={() => setHoveredPlan(index)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {plan.popular && (
                <div className="absolute top-5 right-5">
                  <span className="inline-block bg-emerald text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}
              {plan.specialBadge && (
                <div className="absolute top-5 right-5">
                  <Badge className="bg-gold text-white">
                    {plan.specialBadge}
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period || "month"}</span>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className={`h-5 w-5 ${plan.iconColor} mr-2 shrink-0`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.profit && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="text-sm text-muted-foreground cursor-help flex items-center">
                          <span className="mr-1">💡</span> Est. API cost: {plan.apiCost} → <strong className="text-emerald ml-1">{plan.profit}</strong>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Pricing Transparency</h4>
                          <p className="text-sm">
                            We're transparent about our costs. This shows our estimated API costs for an average user of this plan and what makes our service sustainable.
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={scrollToWaitlist}
                  className={`w-full ${plan.color} text-white hover-lift`}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
