import OpenAI from 'openai';
import { WardrobeItem } from './supabase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, API calls should be made from the backend
});

// Type for the inspiration outfit analysis result
export interface OutfitItem {
  type: string;
  description: string;
  color: string;
  material: string;
  matches: {
    id: string;
    name: string;
    imageUrl: string;
    similarity: number;
  }[];
}

export interface OutfitAnalysis {
  outfit: {
    style: string;
    description: string;
    items: OutfitItem[];
  }
}

// Type for the clothing analysis result
export interface ClothingAnalysis {
  name: string;
  category: string;
  color: string;
  season: string;
  occasion: string;
  description: string;
  generatedImageUrl?: string;
  detailedDescription?: string;
}

/**
 * Analyzes a clothing image using OpenAI's GPT-4 Vision model
 * @param imageFile The image file to analyze
 * @returns Clothing analysis with extracted metadata
 */
export async function analyzeClothingImage(imageFile: File): Promise<ClothingAnalysis> {
  try {
    // Convert the file to a base64 data URL
    const base64Image = await fileToBase64(imageFile);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a fashion expert and wardrobe analyst. Analyze the clothing item in the image and extract detailed information about it. Be specific and comprehensive."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this clothing item and provide the following details in JSON format:\n- name: a descriptive name\n- category: one of [top, bottom, dress, outerwear, shoes, accessory]\n- color: main color(s)\n- season: appropriate season(s) [spring, summer, fall, winter, all]\n- occasion: when to wear it [casual, formal, business, athletic, evening, etc.]\n- description: a brief description of the item\n- detailedDescription: a comprehensive 3-4 sentence description including style, material, fit, notable features, and fashion context\n\nReturn ONLY the JSON with no other text." },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const responseText = response.choices[0]?.message?.content || '';
    console.log('OpenAI response:', responseText); // Log the raw response for debugging
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : '{}';
    console.log('Extracted JSON string:', jsonString); // Log the extracted JSON
    
    try {
      // Safely parse the JSON and provide defaults for each field
      let parsedResult: Partial<ClothingAnalysis> = {};
      try {
        parsedResult = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // If JSON parsing fails, we'll use the empty object and default values
      }
      
      const analysis = {
        name: parsedResult.name || 'Unknown Item',
        category: parsedResult.category || '',
        color: parsedResult.color || '',
        season: normalizeSeasonValue(parsedResult.season),
        occasion: parsedResult.occasion || '',
        description: parsedResult.description || '',
        detailedDescription: parsedResult.detailedDescription || ''
      };
      
      // Mockup generation removed to save tokens
      return analysis;
    } catch (parseError) {
      console.error('Error parsing OpenAI response as JSON:', parseError);
      throw new Error('Failed to parse clothing analysis results');
    }
  } catch (error) {
    console.error('Error analyzing clothing image:', error);
    throw error;
  }
}

// Mockup generation function removed to save tokens

/**
 * Generates an outfit based on user's wardrobe and recommends missing items to buy
 * @param prompt The style or occasion prompt
 * @param wardrobeItems User's wardrobe items
 * @param promptType Type of prompt - 'style' or 'occasion'
 * @returns Generated outfit with items from wardrobe and recommended items to buy
 */
export async function generateOutfitFromWardrobe(prompt: string, wardrobeItems: WardrobeItem[], promptType: 'style' | 'occasion' = 'style') {
  try {
    // Prepare wardrobe items data to send to OpenAI
    const wardrobeItemsData = wardrobeItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      season: item.season,
      occasion: item.occasion,
      description: item.description,
      imageUrl: item.imageUrl
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a fashion expert and personal stylist. Your task is to create outfits using the user's existing wardrobe items when possible. If essential items are missing, recommend items to purchase. Respond in JSON format only.`
        },
        {
          role: "user",
          content: `Create an outfit for ${promptType === 'occasion' ? 'a' : 'the'} "${prompt}" ${promptType} using my wardrobe items where possible. Here's my current wardrobe: ${JSON.stringify(wardrobeItemsData)}.

Please provide your response in this exact JSON format:
{
  "outfit": {
    "name": "[Name of the outfit]",
    "description": "[Brief description of the outfit and style]",
    "items": [
      {
        "id": "[Item ID if from wardrobe, null if recommendation]",
        "name": "[Item name]",
        "type": "[top/bottom/outerwear/shoes/accessory]",
        "description": "[Brief description]",
        "fromWardrobe": true/false,
        "imageUrl": "[Image URL if from wardrobe]",
        "recommendationDetails": "[Only if not from wardrobe: specific recommendation details]"
      }
    ],
    "stylingTips": ["[tip 1]", "[tip 2]", "[tip 3]"]
  }
}`
        },
      ],
      max_tokens: 1500,
    });

    const responseText = response.choices[0]?.message?.content || '{}';
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : '{}';
    
    try {
      // Parse the JSON response
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing OpenAI response as JSON:', parseError);
      throw new Error('Failed to parse outfit generation results');
    }
  } catch (error) {
    console.error('Error generating outfit from wardrobe:', error);
    throw error;
  }
}

/**
 * Analyzes an inspiration outfit image using OpenAI's Vision model
 * @param imageFile The image file to analyze
 * @returns Outfit analysis with style information and component items
 */
export async function analyzeInspirationImage(imageFile: File): Promise<OutfitAnalysis> {
  try {
    // Convert the file to a base64 data URL
    const base64Image = await fileToBase64(imageFile);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a fashion expert and style analyst. Analyze the outfit in the image and extract detailed information about the style and individual items."
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Please analyze this outfit and provide the following details in JSON format:\n\n" +
                    "{\n" +
                    "  \"outfit\": {\n" +
                    "    \"style\": \"[overall style name]\",\n" +
                    "    \"description\": \"[brief description of the overall outfit style]\",\n" +
                    "    \"items\": [\n" +
                    "      {\n" +
                    "        \"type\": \"[Top/Bottom/Outerwear/Footwear/Accessory]\",\n" +
                    "        \"description\": \"[detailed description of the item]\",\n" +
                    "        \"color\": \"[main color]\",\n" +
                    "        \"material\": \"[material if identifiable]\"\n" +
                    "      }\n" +
                    "    ]\n" +
                    "  }\n" +
                    "}\n\n" +
                    "Identify 3-5 distinct items in the outfit. Return ONLY the JSON with no other text." 
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const responseText = response.choices[0]?.message?.content || '';
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : '{}';
    
    try {
      // Parse the JSON response
      const analysis = JSON.parse(jsonString) as OutfitAnalysis;
      
      // Return the raw analysis without placeholder matches
      // Matches will be added in the InspirationScanner component using real wardrobe items
      return analysis;
    } catch (parseError) {
      console.error('Error parsing OpenAI response as JSON:', parseError);
      throw new Error('Failed to parse outfit analysis results');
    }
  } catch (error) {
    console.error('Error analyzing inspiration image:', error);
    throw error;
  }
}

/**
 * Normalizes season values from the API to match the dropdown options
 * @param seasonValue The season value from the API
 * @returns Normalized season value that matches dropdown options
 */
function normalizeSeasonValue(seasonValue: any): string {
  // Check if seasonValue is a valid string
  if (typeof seasonValue !== 'string' || !seasonValue) {
    return 'all'; // Default to 'all' if not a valid string
  }
  
  // Convert to lowercase for case-insensitive matching
  const value = seasonValue.toLowerCase();
  
  // Check for specific values
  if (value === 'all' || value === 'all seasons' || value.includes('all')) {
    return 'all';
  }
  
  // Check if it's just a single season
  if (value === 'spring') return 'spring';
  if (value === 'summer') return 'summer';
  if (value === 'fall' || value === 'autumn') return 'fall';
  if (value === 'winter') return 'winter';
  
  // Check for multiple seasons
  const seasons = ['spring', 'summer', 'fall', 'winter'];
  let matchCount = 0;
  let lastMatch = '';
  
  for (const season of seasons) {
    if (value.includes(season)) {
      matchCount++;
      lastMatch = season;
    }
  }
  
  // If it matches more than one season but not all four, return the first match
  if (matchCount > 0 && matchCount < 4) {
    return lastMatch;
  }
  
  // If it matches all seasons or doesn't match any specific pattern, default to 'all'
  return 'all';
}

/**
 * Converts a File object to a base64 data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
