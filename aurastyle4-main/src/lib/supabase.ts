import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WardrobeItem {
  id?: string;
  name: string;
  category: string;
  color: string;
  season: string;
  occasion: string;
  description?: string;
  detailedDescription?: string;
  imageUrl?: string;
  generatedImageUrl?: string;
  userId?: string;
  created_at?: string;
  last_updated?: string;
}

/**
 * Uploads an image to Supabase Storage
 * @param file File to upload
 * @param userId User ID for path organization
 * @returns URL of the uploaded file
 */
export async function uploadImage(file: File, userId: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('wardrobe')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('wardrobe')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Adds a wardrobe item to the database
 * @param item Wardrobe item to add
 * @returns Added item with ID
 */
export async function addWardrobeItem(item: WardrobeItem): Promise<WardrobeItem> {
  try {
    const { data, error } = await supabase
      .from('wardrobe')
      .insert([{
        ...item,
        created_at: new Date().toISOString(),
      }])
      .select();
    
    if (error) throw error;
    
    return data?.[0] as WardrobeItem;
  } catch (error) {
    console.error('Error adding wardrobe item:', error);
    throw error;
  }
}

/**
 * Gets all wardrobe items for a user
 * @param userId User ID to get items for
 * @returns Array of wardrobe items
 */
export async function getWardrobeItems(userId: string): Promise<WardrobeItem[]> {
  try {
    const { data, error } = await supabase
      .from('wardrobe')
      .select('*')
      .eq('userId', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as WardrobeItem[];
  } catch (error) {
    console.error('Error getting wardrobe items:', error);
    throw error;
  }
}

/**
 * Deletes a wardrobe item
 * @param itemId ID of the item to delete
 * @param imageUrl URL of the image to delete from storage
 */
export async function deleteWardrobeItem(itemId: string, imageUrl?: string): Promise<void> {
  try {
    // Delete the database entry
    const { error } = await supabase
      .from('wardrobe')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
    
    // If there's an image URL, extract the path and delete from storage
    if (imageUrl) {
      const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/wardrobe\/(.+)/);
      if (pathMatch && pathMatch[1]) {
        const filePath = decodeURIComponent(pathMatch[1]);
        await supabase.storage.from('wardrobe').remove([filePath]);
      }
    }
  } catch (error) {
    console.error('Error deleting wardrobe item:', error);
    throw error;
  }
}
