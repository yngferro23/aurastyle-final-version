import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, Sparkles, X, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getWardrobeItems } from "@/lib/supabase";
import { generateOutfitFromWardrobe } from "@/lib/openai";

// Mock function to simulate API call to OpenAI
const mockGenerateOutfit = async (prompt: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Mock response for demo purposes
  return {
    outfit: {
      name: "Business Casual Look",
      description: "A polished yet comfortable outfit that works well for office settings with a casual dress code or for client meetings in more relaxed industries.",
      items: [
        {
          name: "White Button-Up Shirt",
          type: "top",
          description: "A crisp white button-up adds a professional touch while remaining versatile.",
          imageUrl: "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
        },
        {
          name: "Blue Jeans",
          type: "bottom",
          description: "Dark wash jeans provide a smart-casual foundation that balances professionalism with comfort.",
          imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
        },
        {
          name: "Black Blazer",
          type: "layer",
          description: "A fitted black blazer elevates the entire look and can be removed if the environment is more casual.",
          imageUrl: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
        },
        {
          name: "White Sneakers",
          type: "shoes",
          description: "Clean white sneakers add a modern touch while maintaining comfort throughout the day.",
          imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
        }
      ],
      stylingTips: [
        "Roll up your shirt sleeves slightly when removing the blazer for a more relaxed look",
        "Consider adding a simple watch as your only accessory to maintain a clean aesthetic",
        "Tuck in your shirt for meetings, and feel free to untuck for more casual settings"
      ]
    }
  };
};

// Define occasions data structure
const occasions = [
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

// Fashion styles data
const fashionStyles = [
  {
    id: "old-money",
    name: "Old Money",
    description: "Understated luxury with timeless, high-quality basics in neutral tones. Think cashmere sweaters, tailored trousers, and minimal accessories.",
    imageUrl: "/images/styles/oldmoney.jpg"
  },
  {
    id: "streetwear",
    name: "Streetwear",
    description: "Urban casual with oversized silhouettes, graphic tees, hoodies, and sneakers. Influenced by skate, hip-hop, and sports cultures.",
    imageUrl: "/images/styles/streetwear.jpg"
  },
  {
    id: "y2k",
    name: "Y2K",
    description: "2000s revival featuring low-rise jeans, baby tees, butterfly clips, and bold colors. Playful, nostalgic, and often experimental.",
    imageUrl: "/images/styles/y2k.jpg"
  },
  {
    id: "dark-academia",
    name: "Dark Academia",
    description: "Scholarly aesthetic with tweed blazers, Oxford shoes, plaid patterns, and vintage-inspired pieces in dark, earthy tones.",
    imageUrl: "/images/styles/darkacademia.jpg"
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean lines, neutral colors, and simplistic designs focused on quality over quantity. Timeless pieces that work together seamlessly.",
    imageUrl: "/images/styles/minimalist.jpg"
  },
  {
    id: "cottagecore",
    name: "Cottagecore",
    description: "Romanticized rural aesthetics with floral prints, flowing dresses, and natural fabrics. Emphasis on handmade and vintage items.",
    imageUrl: "/images/styles/cottagecore.jpg"
  },
  {
    id: "goth",
    name: "Goth",
    description: "Dark and dramatic with all-black ensembles, leather, lace, and silver hardware. Often features Victorian or punk-inspired elements.",
    imageUrl: "/images/styles/goth.jpg"
  },
  {
    id: "preppy",
    name: "Preppy",
    description: "Clean-cut collegiate style with polo shirts, button-downs, chinos, and loafers. Traditional, polished, and often nautical-inspired.",
    imageUrl: "/images/styles/preppy.jpg"
  },
  {
    id: "egirl",
    name: "E-Girl/E-Boy",
    description: "Internet-influenced aesthetic mixing elements of anime, skate culture, goth, and emo. Characterized by colorful hair, layered clothing, and makeup.",
    imageUrl: "/images/styles/egirl.jpg"
  },
  {
    id: "bohemian",
    name: "Bohemian",
    description: "Free-spirited style with flowing fabrics, ethnic patterns, and artisanal accessories. Layered and eclectic with earthy colors.",
    imageUrl: "/images/styles/bohemian.jpg"
  },
  {
    id: "starboy",
    name: "Starboy",
    description: "Inspired by The Weeknd with sleek urban vibes, leather jackets, all-black ensembles, and futuristic elements combined with vintage items.",
    imageUrl: "https://images.unsplash.com/photo-1536243298747-ea8874136d64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "techwear",
    name: "Techwear",
    description: "Functional urban apparel with weather-resistant fabrics, tactical details, and modular accessories. Futuristic aesthetic in dark colors.",
    imageUrl: "/images/styles/techwear.jpg"
  }
];

// useLocation is already imported at the top

const StyleGenerator: React.FC = () => {
  const location = useLocation();
  const { user } = useUser();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("prompt");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [isLoadingWardrobe, setIsLoadingWardrobe] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  
  // Load wardrobe items when component mounts
  useEffect(() => {
    const loadWardrobeItems = async () => {
      if (user) {
        setIsLoadingWardrobe(true);
        try {
          const items = await getWardrobeItems(user.id);
          setWardrobeItems(items);
        } catch (error) {
          console.error("Error loading wardrobe items:", error);
          setError("Failed to load your wardrobe items. Please try again later.");
        } finally {
          setIsLoadingWardrobe(false);
        }
      }
    };
    
    loadWardrobeItems();
  }, [user]);

  // Check for occasion parameter in URL when component mounts
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const occasionParam = params.get('occasion');
    
    if (occasionParam) {
      setSelectedOccasion(occasionParam);
      if (user && wardrobeItems.length > 0) {
        generateOutfitForOccasion(occasionParam);
      }
    }
  }, [location.search, user, wardrobeItems]);
  
  const generateOutfitForOccasion = async (occasionId: string) => {
    if (!occasionId) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const occasion = occasions.find(o => o.id === occasionId);
      if (!occasion) {
        throw new Error('Invalid occasion selected');
      }
      
      const promptText = `Outfit for ${occasion.name}: ${occasion.description}`;
      
      // Call the OpenAI API to generate outfit using wardrobe items
      const response = await generateOutfitFromWardrobe(promptText, wardrobeItems, 'occasion');
      setGeneratedOutfit(response.outfit);
    } catch (error) {
      console.error("Error generating outfit for occasion:", error);
      setError("Failed to generate outfit for this occasion. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalPrompt = prompt.trim();
    
    // If a style is selected, add it to the prompt
    if (selectedStyle) {
      const style = fashionStyles.find(s => s.id === selectedStyle);
      if (style) {
        finalPrompt = `${finalPrompt} in ${style.name} style. ${style.description}`;
      }
    }
    
    if (!finalPrompt) {
      setError("Please enter a description for the outfit you need or select a style");
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    
    try {
      // Call the OpenAI API with your wardrobe data to generate outfit recommendations
      const response = await generateOutfitFromWardrobe(finalPrompt, wardrobeItems, 'style');
      setGeneratedOutfit(response.outfit);
    } catch (err) {
      setError("Failed to generate outfit. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedOutfit(null);
    setError(null);
    setSelectedStyle(null);
    setSelectedOccasion(null);
    setActiveTab("prompt");
  };
  
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    setActiveTab("prompt"); // Switch back to prompt tab after selecting a style
    
    // Get the style description to use as a starting point for the prompt
    const style = fashionStyles.find(s => s.id === styleId);
    if (style) {
      setPrompt(`Create an outfit in the ${style.name} style`);
    }
  };

  // Example prompts for user inspiration
  const examplePrompts = [
    "Business casual outfit for a client meeting tomorrow",
    "Something comfortable yet stylish for a weekend brunch",
    "Date night outfit that's not too formal but still impressive",
    "Outfit for rainy weather that still looks put together",
    "Casual Friday look for the office"
  ];

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Style Generator</h1>
          <p className="text-muted-foreground mb-6">
            {selectedOccasion 
              ? `Generating outfit suggestions for: ${occasions.find(o => o.id === selectedOccasion)?.name || selectedOccasion}`
              : "Describe what you need an outfit for, or select a famous fashion style to get started."}
          </p>
          {selectedOccasion && (
            <div className="flex items-center mb-4 p-3 bg-blue-100 rounded-md">
              <span className="text-xl mr-2">
                {occasions.find(o => o.id === selectedOccasion)?.icon || "🔍"}
              </span>
              <div className="flex-grow">
                <div className="font-medium">{occasions.find(o => o.id === selectedOccasion)?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {occasions.find(o => o.id === selectedOccasion)?.description}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <span className="text-sm">Change</span>
              </Button>
            </div>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prompt">Custom Prompt</TabsTrigger>
            <TabsTrigger value="styles">Fashion Styles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompt" className="space-y-4 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What kind of outfit do you need? Be specific about the occasion, weather, dress code, etc."
                  className="min-h-[100px]"
                />
                {selectedStyle && (
                  <div className="mt-2 p-2 bg-emerald/10 rounded-md flex items-center justify-between">
                    <span className="text-sm">
                      Using <span className="font-semibold">{fashionStyles.find(s => s.id === selectedStyle)?.name}</span> style
                    </span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedStyle(null)}
                      className="h-auto p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPrompt(example)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={isGenerating || (!prompt && !selectedStyle && !generatedOutfit)}
                >
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  disabled={isGenerating || (!prompt.trim() && !selectedStyle)}
                  className="bg-emerald hover:bg-emerald-dark gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Outfit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="styles" className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fashionStyles.map((style) => (
                <Card 
                  key={style.id} 
                  className={`overflow-hidden cursor-pointer hover:shadow-md transition-all ${selectedStyle === style.id ? 'ring-2 ring-emerald' : ''}`}
                  onClick={() => handleStyleSelect(style.id)}
                >
                  <div className="relative h-40 w-full">
                    <img 
                      src={style.imageUrl} 
                      alt={style.name} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {selectedStyle === style.id && (
                      <div className="absolute top-2 right-2 bg-emerald text-white rounded-full p-1">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">{style.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="line-clamp-2">
                      {style.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {generatedOutfit && (
          <div className="border rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold mb-2">{generatedOutfit.name}</h2>
            <p className="text-muted-foreground mb-6">{generatedOutfit.description}</p>

            <h3 className="text-lg font-semibold mb-4">Your Outfit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {generatedOutfit.items.map((item: any, index: number) => (
                <Card key={index} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-1/3">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="w-2/3 p-4">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.type}</p>
                      <p className="text-sm mt-2">{item.description}</p>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            <h3 className="text-lg font-semibold mb-2">Styling Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {generatedOutfit.stylingTips.map((tip: string, index: number) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleGenerator;
