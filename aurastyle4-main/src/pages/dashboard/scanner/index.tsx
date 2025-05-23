import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Image as ImageIcon, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeInspirationImage, OutfitAnalysis } from "@/lib/openai";
import { getWardrobeItems, WardrobeItem } from "@/lib/supabase";

// A type guard function to check if we have a valid analysis result
const isValidAnalysis = (result: any): result is OutfitAnalysis => {
  return result && 
         result.outfit && 
         result.outfit.style && 
         result.outfit.description && 
         Array.isArray(result.outfit.items) && 
         result.outfit.items.length > 0;
};

const InspirationScanner: React.FC = () => {
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingWardrobe, setIsLoadingWardrobe] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [analysisResult, setAnalysisResult] = useState<OutfitAnalysis | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const { toast } = useToast();
  
  // Load wardrobe items when component mounts
  useEffect(() => {
    if (user) {
      loadWardrobeItems();
    }
  }, [user]);
  
  // Function to load wardrobe items from Supabase
  const loadWardrobeItems = async () => {
    if (!user) return;
    
    try {
      setIsLoadingWardrobe(true);
      const items = await getWardrobeItems(user.id);
      setWardrobeItems(items);
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your wardrobe items.",
      });
    } finally {
      setIsLoadingWardrobe(false);
    }
  };
  
  // Function to calculate similarity between analyzed item and wardrobe item
  const calculateSimilarity = (analyzedItem: any, wardrobeItem: WardrobeItem): number => {
    let score = 0;
    
    // Compare colors (weighted heavily)
    if (wardrobeItem.color.toLowerCase().includes(analyzedItem.color.toLowerCase()) ||
        analyzedItem.color.toLowerCase().includes(wardrobeItem.color.toLowerCase())) {
      score += 0.5;
    }
    
    // Compare category/type
    const itemType = analyzedItem.type.toLowerCase();
    const category = wardrobeItem.category.toLowerCase();
    
    // Map the category to type for comparison
    const matchingCategories: Record<string, string[]> = {
      'top': ['top', 'shirt', 'blouse', 'sweater', 't-shirt'],
      'bottom': ['bottom', 'pants', 'jeans', 'skirt', 'shorts'],
      'dress': ['dress'],
      'outerwear': ['outerwear', 'jacket', 'coat'],
      'shoes': ['footwear', 'shoes', 'sneakers', 'boots'],
      'accessory': ['accessory', 'accessories', 'hat', 'cap', 'necklace']
    };
    
    // Check if the analyzed item type matches the wardrobe item category
    const categoryMatches = Object.entries(matchingCategories).some(([key, values]) => {
      return category.includes(key) && values.some(v => itemType.includes(v));
    });
    
    if (categoryMatches) {
      score += 0.4;
    }
    
    // Add a small random factor to create variety in results with similar scores
    score += Math.random() * 0.05;
    
    // Cap at 0.95 max similarity
    return Math.min(score, 0.95);
  };
  
  // Function to find matching items in wardrobe
  const findMatchingItems = (analyzedItem: any): any[] => {
    if (!wardrobeItems.length) return [];
    
    // Calculate similarity scores for all wardrobe items
    const itemsWithScores = wardrobeItems.map(item => ({
      ...item,
      similarity: calculateSimilarity(analyzedItem, item)
    }));
    
    // Sort by similarity score descending and take top 3
    return itemsWithScores
      .sort((a, b) => b.similarity - a.similarity)
      .filter(item => item.similarity > 0.4) // Only include reasonable matches
      .slice(0, 3) // Limit to 3 matches per item
      .map(item => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        similarity: item.similarity
      }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an image to analyze",
      });
      return;
    }
    
    if (wardrobeItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Wardrobe",
        description: "You need to add items to your wardrobe first before analyzing outfits.",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Call the OpenAI Vision API to analyze the image
      const result = await analyzeInspirationImage(selectedFile);
      
      if (!isValidAnalysis(result)) {
        throw new Error('Invalid analysis result structure');
      }
      
      // Add real wardrobe matches to each outfit item
      const analysisWithMatches = {
        ...result,
        outfit: {
          ...result.outfit,
          items: result.outfit.items.map(item => ({
            ...item,
            matches: findMatchingItems(item)
          }))
        }
      };
      
      setAnalysisResult(analysisWithMatches);
      
      // Switch to results tab
      setActiveTab("results");
      
      toast({
        title: "Analysis Complete",
        description: "Your inspiration image has been analyzed and matched with your wardrobe items.",
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error analyzing your image. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setActiveTab("upload");
  };

  const handleSaveOutfit = () => {
    // In a real app, this would save the outfit to the user's collection
    toast({
      title: "Outfit Saved",
      description: "This outfit has been added to your saved outfits.",
    });
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">Inspiration Scanner</h1>
          <p className="text-muted-foreground">
            Upload an outfit image from social media or magazines, and I'll find similar items in your wardrobe.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResult}>Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="pt-4">
            <Card>
              <form onSubmit={handleUploadSubmit}>
                <CardHeader>
                  <CardTitle>Upload Inspiration Image</CardTitle>
                  <CardDescription>
                    Choose a fashion image you'd like to recreate with your own wardrobe
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    {previewUrl ? (
                      <div className="relative w-full max-w-md">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-auto rounded-lg shadow-md" 
                        />
                        <Button 
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors w-full max-w-md"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <div className="flex flex-col items-center space-y-4">
                          <div className="rounded-full bg-emerald/10 p-3">
                            <ImageIcon className="h-8 w-8 text-emerald" />
                          </div>
                          <div>
                            <p className="font-medium">Click to upload an image</p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG or WEBP (max. 10MB)
                            </p>
                          </div>
                        </div>
                        <input 
                          id="file-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={!selectedFile}
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-emerald hover:bg-emerald-dark gap-2"
                    disabled={isAnalyzing || !selectedFile}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="pt-4">
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>{analysisResult.outfit.style}</CardTitle>
                  <CardDescription>
                    {analysisResult.outfit.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                      {analysisResult.outfit.items.map((item: any, i: number) => (
                        <div key={i} className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium">{item.type}</h3>
                            <p className="text-sm text-gray-500">
                              {item.description}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {item.color}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {item.material}
                              </span>
                            </div>
                          </div>
                          
                          {item.matches.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-emerald mb-2">
                                Matches in Your Wardrobe
                              </h4>
                              <div className="space-y-3">
                                {item.matches.map((match: any) => (
                                  <div key={match.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                    <img 
                                      src={match.imageUrl} 
                                      alt={match.name} 
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{match.name}</div>
                                      <div className="text-xs text-gray-500">
                                        {Math.round(match.similarity * 100)}% match
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleReset}>
                    Scan Another
                  </Button>
                  <Button 
                    onClick={handleSaveOutfit}
                    className="bg-emerald hover:bg-emerald-dark gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Save This Outfit
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InspirationScanner;
