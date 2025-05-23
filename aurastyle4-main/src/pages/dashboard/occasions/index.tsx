import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Occasion {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const occasions: Occasion[] = [
  {
    id: "job-interview",
    name: "Job Interview",
    description: "Professional attire to make a great first impression",
    icon: "💼"
  },
  {
    id: "first-date",
    name: "First Date",
    description: "Stylish yet comfortable for a memorable evening",
    icon: "💕"
  },
  {
    id: "wedding",
    name: "Wedding",
    description: "Elegant outfits appropriate for the celebration",
    icon: "💍"
  },
  {
    id: "casual-friday",
    name: "Casual Friday",
    description: "Professional but relaxed office attire",
    icon: "👔"
  },
  {
    id: "business-meeting",
    name: "Business Meeting",
    description: "Polished professional looks to command respect",
    icon: "📊"
  },
  {
    id: "weekend-brunch",
    name: "Weekend Brunch",
    description: "Casual yet stylish outfits for social dining",
    icon: "🍳"
  },
  {
    id: "cocktail-party",
    name: "Cocktail Party",
    description: "Semi-formal attire for evening social events",
    icon: "🍸"
  },
  {
    id: "outdoor-activity",
    name: "Outdoor Activity",
    description: "Functional and comfortable for nature adventures",
    icon: "🏞️"
  },
  {
    id: "beach-day",
    name: "Beach Day",
    description: "Cool and comfortable for sun and sand",
    icon: "🏖️"
  },
  {
    id: "formal-gala",
    name: "Formal Gala",
    description: "Elegant evening wear for upscale events",
    icon: "✨"
  },
  {
    id: "graduation",
    name: "Graduation",
    description: "Celebratory outfits for academic achievements",
    icon: "🎓"
  },
  {
    id: "job-fair",
    name: "Job Fair",
    description: "Business casual attire for networking events",
    icon: "🤝"
  }
];

const OccasionPicker: React.FC = () => {
  const navigate = useNavigate();

  const handleOccasionSelect = (occasionId: string) => {
    // In a real application, you would store the selected occasion
    // and redirect to a page showing outfit suggestions
    // For now, we'll just redirect to the style generator with the occasion as a query param
    navigate(`/dashboard/generator?occasion=${occasionId}`);
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">Occasion Picker</h1>
          <p className="text-muted-foreground mb-4">
            Choose an occasion to get outfit recommendations tailored for specific events.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {occasions.map((occasion) => (
            <Card 
              key={occasion.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOccasionSelect(occasion.id)}
            >
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center text-lg">
                  <span className="text-2xl mr-2">{occasion.icon}</span>
                  {occasion.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription>{occasion.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OccasionPicker;
