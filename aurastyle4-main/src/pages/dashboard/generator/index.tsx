import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, Sparkles, X } from "lucide-react";

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

// Fashion styles data
const fashionStyles = [
  {
    id: "old-money",
    name: "Old Money",
    description: "Understated luxury with timeless, high-quality basics in neutral tones. Think cashmere sweaters, tailored trousers, and minimal accessories.",
    imageUrl: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "streetwear",
    name: "Streetwear",
    description: "Urban casual with oversized silhouettes, graphic tees, hoodies, and sneakers. Influenced by skate, hip-hop, and sports cultures.",
    imageUrl: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "y2k",
    name: "Y2K",
    description: "2000s revival featuring low-rise jeans, baby tees, butterfly clips, and bold colors. Playful, nostalgic, and often experimental.",
    imageUrl: "https://images.unsplash.com/photo-1618875172060-c439788e7b24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "dark-academia",
    name: "Dark Academia",
    description: "Scholarly aesthetic with tweed blazers, Oxford shoes, plaid patterns, and vintage-inspired pieces in dark, earthy tones.",
    imageUrl: "https://images.unsplash.com/photo-1612387605330-74e5a4ab2a0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean lines, neutral colors, and simplistic designs focused on quality over quantity. Timeless pieces that work together seamlessly.",
    imageUrl: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cottagecore",
    name: "Cottagecore",
    description: "Romanticized rural aesthetics with floral prints, flowing dresses, and natural fabrics. Emphasis on handmade and vintage items.",
    imageUrl: "https://images.unsplash.com/photo-1594467810785-95fe698b6b38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "goth",
    name: "Goth",
    description: "Dark and dramatic with all-black ensembles, leather, lace, and silver hardware. Often features Victorian or punk-inspired elements.",
    imageUrl: "https://images.unsplash.com/photo-1461938337379-4b537cd2db74?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "preppy",
    name: "Preppy",
    description: "Clean-cut collegiate style with polo shirts, button-downs, chinos, and loafers. Traditional, polished, and often nautical-inspired.",
    imageUrl: "https://images.unsplash.com/photo-1602810320073-1230c46d89d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "e-girl",
    name: "E-Girl/E-Boy",
    description: "Internet subculture aesthetic mixing elements of goth, anime, and skater styles with colorful hair, chains, and layered clothing.",
    imageUrl: "https://images.unsplash.com/photo-1622211827147-a9d2137590c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "bohemian",
    name: "Bohemian",
    description: "Free-spirited style with flowing fabrics, ethnic patterns, and artisanal accessories. Layered and eclectic with earthy colors.",
    imageUrl: "https://images.unsplash.com/photo-1518893063132-36e46dbe2428?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
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
    imageUrl: "https://images.unsplash.com/photo-1558223708-7bea309e40e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
];

const StyleGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("prompt");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

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
      // In a real implementation, this would call your backend API
      // which would then call OpenAI's API with your user's wardrobe data
      const result = await mockGenerateOutfit(finalPrompt);
      setGeneratedOutfit(result.outfit);
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
            Describe what you need an outfit for, or select a famous fashion style to get started.
          </p>
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
