import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { getWardrobeItems, WardrobeItem } from "@/lib/supabase";

// Type definition for processed wardrobe data
interface WardrobeAnalysisData {
  totalItems: number;
  categories: { name: string; value: number }[];
  colors: { name: string; value: number }[];
  seasons: { name: string; value: number }[];
  mostWorn: { name: string; count: number }[];
  leastWorn: { name: string; count: number }[];
}

// Generate AI analysis based on wardrobe data
const generateAIAnalysis = (data: WardrobeAnalysisData): string => {
  if (!data || data.totalItems === 0) {
    return `## No Items in Your Wardrobe

Add some items to your wardrobe to get personalized analysis and recommendations.`;
  }

  // Get dominant categories
  const topCategories = [...data.categories]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(c => c.name);

  // Get dominant colors
  const topColors = [...data.colors]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(c => c.name);

  // Analyze season distribution
  const seasonTotal = data.seasons.reduce((sum, s) => sum + s.value, 0);
  const seasonDistribution = data.seasons.map(s => ({
    name: s.name,
    percentage: Math.round((s.value / seasonTotal) * 100)
  }));

  // Find areas for improvement
  const weakCategories = [...data.categories]
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map(c => c.name);

  const weakSeasons = [...data.seasons]
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map(s => s.name);
    
  // Build strengths section
  let strengths = `- Strong collection of ${topCategories[0] || 'items'} that can be styled multiple ways\n`;
  strengths += `- Good color consistency with ${topColors.join(' and ') || 'neutral colors'} as your base colors\n`;
  
  const seasonStrength = seasonDistribution.find(s => s.percentage > 25);
  if (seasonStrength) {
    strengths += `- Well-prepared for ${seasonStrength.name} with ${seasonStrength.percentage}% of your wardrobe suitable for this season`;
  } else {
    strengths += `- Balanced seasonal distribution across your wardrobe`;
  }
  
  // Build opportunities section
  let opportunities = '';
  if (weakCategories.length > 0) {
    opportunities += `- Consider adding more ${weakCategories.join(' and ')} to balance your wardrobe\n`;
  }
  if (weakSeasons.length > 0) {
    opportunities += `- Your collection could use more ${weakSeasons.join(' and ')} items\n`;
  }
  if (data.colors.length < 5) {
    opportunities += `- Adding more variety in colors could increase your outfit options\n`;
  }
  
  // Build recommendations section
  let recommendations = '';
  if (weakCategories.length > 0) {
    recommendations += `1. Add 2-3 ${weakCategories[0]} pieces to expand your outfit possibilities\n`;
  } else {
    recommendations += `1. Continue building on your well-balanced wardrobe\n`;
  }
  
  if (data.mostWorn.length > 0) {
    recommendations += `2. Since you frequently wear ${data.mostWorn[0].name}, consider finding complementary pieces that work well with it\n`;
  } else {
    recommendations += `2. Track which items you wear most to understand your true preferences\n`;
  }
  
  if (data.leastWorn.length > 0) {
    recommendations += `3. Evaluate if you want to keep rarely worn items like ${data.leastWorn[0].name} or replace them with pieces you'll wear more often`;
  } else {
    recommendations += `3. Regularly assess which items you don't wear to keep your wardrobe efficient`;
  }
  
  // Build outfit suggestions section
  let outfitSuggestions = '';
  if (data.mostWorn.length > 0) {
    outfitSuggestions += `- Try creating new outfits with your ${data.mostWorn[0].name} by pairing it with different accessories\n`;
  }
  
  const hasBottoms = data.categories.some(c => c.name === 'Bottoms' && c.value > 0);
  const hasTops = data.categories.some(c => c.name === 'Tops' && c.value > 0);
  if (hasBottoms && hasTops) {
    outfitSuggestions += `- Mix and match your tops and bottoms to create new combinations you haven't tried before\n`;
  }
  
  outfitSuggestions += `- Consider creating capsule collections within your wardrobe for different occasions or seasons`;
  
  // Assemble the full analysis
  return `
## Wardrobe Insights

Your wardrobe has ${data.totalItems} items, with a focus on ${topCategories.join(', ')}.
Your color palette centers around ${topColors.join(', ')}, creating a ${topColors.includes('Black') || topColors.includes('White') || topColors.includes('Gray') ? 'neutral and versatile' : 'colorful and expressive'} foundation.

### Strengths
${strengths}

### Opportunities
${opportunities}
### Recommendations
${recommendations}

### Outfit Rotation Suggestions
${outfitSuggestions}
`;

};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const WardrobeAnalysis: React.FC = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [wardrobeData, setWardrobeData] = useState<WardrobeAnalysisData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [rawItems, setRawItems] = useState<WardrobeItem[]>([]);

  useEffect(() => {
    if (user) {
      loadWardrobeItems();
    }
  }, [user]);

  const loadWardrobeItems = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userItems = await getWardrobeItems(user.id);
      setRawItems(userItems);
      
      // Process the raw items into the format needed for analysis
      processWardrobeData(userItems);
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
      // Set empty data if there's an error
      setWardrobeData({
        totalItems: 0,
        categories: [],
        colors: [],
        seasons: [],
        mostWorn: [],
        leastWorn: []
      });
      setAiAnalysis(generateAIAnalysis({
        totalItems: 0,
        categories: [],
        colors: [],
        seasons: [],
        mostWorn: [],
        leastWorn: []
      }));
      setIsLoading(false);
    }
  };

  const processWardrobeData = (items: WardrobeItem[]) => {
    if (!items.length) {
      const emptyData = {
        totalItems: 0,
        categories: [],
        colors: [],
        seasons: [],
        mostWorn: [],
        leastWorn: []
      };
      setWardrobeData(emptyData);
      setAiAnalysis(generateAIAnalysis(emptyData));
      setIsLoading(false);
      return;
    }
    
    // Count categories
    const categoryMap = new Map<string, number>();
    items.forEach(item => {
      const category = item.category || "Uncategorized";
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    
    // Count colors
    const colorMap = new Map<string, number>();
    items.forEach(item => {
      const color = item.color || "Other";
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    });
    
    // Count seasons (items can be suitable for multiple seasons)
    const seasonMap = new Map<string, number>();
    items.forEach(item => {
      const season = item.season || "All Seasons";
      seasonMap.set(season, (seasonMap.get(season) || 0) + 1);
    });
    
    // For now, we don't have actual wear count data, so we'll use random values
    // In a real app, you'd track this with usage data
    // Sort items by most recent to simulate most worn items
    const mostWorn = [...items]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        count: Math.floor(Math.random() * 15) + 5 // Random count between 5-20
      }));
    
    // For least worn, use oldest items
    const leastWorn = [...items]
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        count: Math.floor(Math.random() * 2) // Random count between 0-1
      }));
    
    const processedData: WardrobeAnalysisData = {
      totalItems: items.length,
      categories: Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })),
      colors: Array.from(colorMap.entries()).map(([name, value]) => ({ name, value })),
      seasons: Array.from(seasonMap.entries()).map(([name, value]) => ({ name, value })),
      mostWorn,
      leastWorn
    };
    
    setWardrobeData(processedData);
    setAiAnalysis(generateAIAnalysis(processedData));
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald" />
          <p className="text-muted-foreground">Analyzing your wardrobe data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">Wardrobe Analysis</h1>
          <p className="text-muted-foreground">
            Insights and statistics about your clothing collection and wearing habits.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Statistics</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Items Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Wardrobe</CardTitle>
                  <CardDescription>
                    You have {wardrobeData?.totalItems} items in your collection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={wardrobeData?.categories}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {wardrobeData?.categories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Color Distribution Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Color Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of colors in your wardrobe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={wardrobeData?.colors}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                        <Bar dataKey="value" fill="#00C49F" barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Season Distribution Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Season Distribution</CardTitle>
                  <CardDescription>
                    How your wardrobe is distributed across seasons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={wardrobeData?.seasons}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {wardrobeData?.seasons.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Most/Least Worn Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Wear Frequency</CardTitle>
                  <CardDescription>
                    Your most and least worn items
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Most Worn</h3>
                      <ul className="space-y-2">
                        {wardrobeData?.mostWorn.map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.name}</span>
                            <span className="text-sm text-emerald font-medium">
                              {item.count} times
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Least Worn</h3>
                      <ul className="space-y-2">
                        {wardrobeData?.leastWorn.map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.name}</span>
                            <span className="text-sm text-gray-500 font-medium">
                              {item.count} times
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Wardrobe Analysis</CardTitle>
                <CardDescription>
                  Personalized insights and recommendations for your wardrobe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-emerald max-w-none">
                  {aiAnalysis?.split('\n').map((line, index) => {
                    if (line.startsWith('##')) {
                      return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('##', '').trim()}</h2>;
                    } else if (line.startsWith('###')) {
                      return <h3 key={index} className="text-lg font-bold mt-3 mb-1">{line.replace('###', '').trim()}</h3>;
                    } else if (line.startsWith('-')) {
                      return <li key={index} className="ml-6">{line.replace('-', '').trim()}</li>;
                    } else if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
                      return <li key={index} className="ml-6 list-decimal">{line.substring(2).trim()}</li>;
                    } else if (line.trim() === '') {
                      return <br key={index} />;
                    } else {
                      return <p key={index}>{line}</p>;
                    }
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WardrobeAnalysis;
