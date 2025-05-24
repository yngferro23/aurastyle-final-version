import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X, Plus, Upload, Pencil, Trash2, Sparkles, Loader2, Shirt } from "lucide-react";
import { analyzeClothingImage, ClothingAnalysis } from "@/lib/openai";
import { supabase, uploadImage, addWardrobeItem, getWardrobeItems, deleteWardrobeItem, WardrobeItem } from "@/lib/supabase";

const WardrobePage: React.FC = () => {
  const { user } = useUser();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<WardrobeItem, "id" | "imageUrl">>({
    name: "",
    category: "",
    color: "",
    season: "",
    occasion: "",
    description: "",
    detailedDescription: "",
  });
  const { toast } = useToast();

  // Load wardrobe items when component mounts
  useEffect(() => {
    if (user) {
      loadWardrobeItems();
    }
  }, [user]);

  const loadWardrobeItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userItems = await getWardrobeItems(user.id);
      setItems(userItems);
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your wardrobe items.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      // Auto-analyze the image with GPT-4 Vision
      analyzeImage(file);
    }
  };
  
  const analyzeImage = async (file: File) => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    try {
      // Send image to OpenAI for analysis
      const analysis = await analyzeClothingImage(file);
      
      // Update form with analysis results (mockup generation removed to save tokens)
      setNewItem({
        name: analysis.name,
        category: analysis.category,
        color: analysis.color,
        season: analysis.season,
        occasion: analysis.occasion,
        description: analysis.description,
        detailedDescription: analysis.detailedDescription,
      });
      
      toast({
        title: "Image Analyzed",
        description: "Your clothing image has been analyzed successfully!",
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Failed to analyze your clothing image. Please try again or fill in the details manually.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // handleSelectChange is defined later in the file

  const resetForm = () => {
    setNewItem({
      name: "",
      category: "",
      color: "",
      season: "",
      occasion: "",
      description: "",
      detailedDescription: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsAddModalOpen(false);
    setIsReviewModalOpen(false);
    setEditingItem(null);
  };

  const openReviewModal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedFile && !editingItem) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an image for your wardrobe item.",
      });
      return;
    }
    
    setIsReviewModalOpen(true);
    setIsAddModalOpen(false);
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please make sure you're logged in.",
      });
      return;
    }
    
    try {
      let imageUrl = '';
      
      // If this is a new item with a selected file
      if (selectedFile && !editingItem) {
        // Upload image to Supabase Storage
        imageUrl = await uploadImage(selectedFile, user.id);
        
        // Add new item to Supabase database
        const savedItem = await addWardrobeItem({
          ...newItem,
          imageUrl,
          userId: user.id,
        });
        
        // Update local state
        setItems((prev) => [savedItem, ...prev]);
        
        toast({
          title: "Item Added",
          description: `${newItem.name} has been added to your wardrobe.`,
        });
      } 
      // If this is editing an existing item
      else if (editingItem) {
        // If there's a new file, upload it
        if (selectedFile) {
          imageUrl = await uploadImage(selectedFile, user.id);
        }
        
        // Update the item in the database
        const updatedItem = {
          ...editingItem,
          ...newItem,
          imageUrl: imageUrl || editingItem.imageUrl,
          last_updated: new Date().toISOString(),
        };
        
        // Use Supabase to update the item
        const { data, error } = await supabase
          .from('wardrobe')
          .update(updatedItem)
          .eq('id', editingItem.id)
          .select();
          
        if (error) throw error;
        
        // Update local state
        setItems((prev) => prev.map(item => 
          item.id === editingItem.id ? updatedItem : item
        ));
        
        toast({
          title: "Item Updated",
          description: `${updatedItem.name} has been updated in your wardrobe.`,
        });
      }
      
      resetForm();
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error('Error saving wardrobe item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your wardrobe item. Please try again.",
      });
    }
  };
  
  const handleEdit = (item: WardrobeItem) => {
    // Set the editing item
    setEditingItem(item);
    
    // Fill the form with the item's data
    setNewItem({
      name: item.name,
      category: item.category,
      color: item.color,
      season: item.season,
      occasion: item.occasion,
      description: item.description || "",
      detailedDescription: item.detailedDescription || "",
      generatedImageUrl: item.generatedImageUrl,
    });
    
    // Open the edit modal
    setIsEditModalOpen(true);
  };

  // Handle input change for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select change for dropdown fields
  const handleSelectChange = (field: string, value: string) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteItem = async (id: string, imageUrl?: string) => {
    try {
      await deleteWardrobeItem(id, imageUrl);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Item Deleted",
        description: "The item has been removed from your wardrobe.",
      });
    } catch (error) {
      console.error('Error deleting wardrobe item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the item. Please try again.",
      });
    }
  };

  const filteredItems = activeFilter === "all" 
    ? items 
    : items.filter((item) => item.category === activeFilter);

  const categories = [
    { value: "all", label: "All Items" },
    { value: "top", label: "Tops" },
    { value: "bottom", label: "Bottoms" },
    { value: "dress", label: "Dresses" },
    { value: "outerwear", label: "Outerwear" },
    { value: "shoes", label: "Shoes" },
    { value: "accessory", label: "Accessories" },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Wardrobe</h1>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald hover:bg-emerald-dark flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={activeFilter === category.value ? "default" : "outline"}
            onClick={() => setActiveFilter(category.value)}
            className={activeFilter === category.value ? "bg-emerald hover:bg-emerald-dark" : ""}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald" />
          <span className="ml-2 text-lg">Loading your wardrobe...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <div className="mb-4">
            <Shirt className="h-12 w-12 mx-auto text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Your wardrobe is empty</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding some clothing items to your wardrobe.
          </p>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald hover:bg-emerald-dark"
          >
            <Plus className="h-4 w-4 mr-2" /> Add First Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative pt-[100%]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription>
                  {item.color} • {item.occasion} • {item.season}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between p-4 pt-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteItem(item.id || '', item.imageUrl)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="min-h-screen py-6 flex flex-col justify-center">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add New Item</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetForm}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Add a new item to your wardrobe</CardDescription>
              </CardHeader>
            <form onSubmit={openReviewModal}>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                      {selectedFile ? (
                        <div className="space-y-2">
                          <div className="relative w-32 h-32 mx-auto">
                            <img
                              src={previewUrl || ''}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-md"
                            />
                            {isAnalyzing ? (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
                                <div className="text-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-white mx-auto" />
                                  <span className="text-xs text-white mt-1 block">Analyzing...</span>
                                </div>
                              </div>
                            ) : (
                              <div className="absolute -top-2 -right-2 flex space-x-1">
                                {newItem.name && (
                                  <div className="bg-emerald rounded-full p-1 text-white" title="AI analysis applied">
                                    <Sparkles className="h-3 w-3" />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                  }}
                                  className="bg-red-500 rounded-full p-1 text-white"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{selectedFile.name}</p>
                        </div>
                      ) : (
                        <label htmlFor="file-upload" className="cursor-pointer space-y-2 flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm font-medium">Click to upload</span>
                          <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileSelect}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newItem.name}
                      onChange={handleInputChange}
                      placeholder="E.g., Blue Denim Jacket"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("category", value)}
                      value={newItem.category}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Tops</SelectItem>
                        <SelectItem value="bottom">Bottoms</SelectItem>
                        <SelectItem value="dress">Dresses</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessory">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={newItem.color}
                      onChange={handleInputChange}
                      placeholder="E.g., Blue, Black, Red"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">Season</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("season", value)}
                      value={newItem.season}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Seasons</SelectItem>
                        <SelectItem value="spring">Spring</SelectItem>
                        <SelectItem value="summer">Summer</SelectItem>
                        <SelectItem value="fall">Fall</SelectItem>
                        <SelectItem value="winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occasion">Occasion</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("occasion", value)}
                      value={newItem.occasion}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="athletic">Athletic</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald hover:bg-emerald-dark">
                  Review Item
                </Button>
              </CardFooter>
            </form>
          </Card>
          </div>
        </div>
      )}
      
      {/* Edit Item Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Edit Wardrobe Item</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                  resetForm();
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Update the details of your item</CardDescription>
            </CardHeader>
            <form onSubmit={openReviewModal}>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Image */}
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    <div className="relative w-40 h-40 mx-auto border rounded-md">
                      <img
                        src={editingItem?.imageUrl || ''}
                        alt={editingItem?.name || 'Item'}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Replace Image (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Replace Image (Optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                      {selectedFile ? (
                        <div className="space-y-2">
                          <div className="relative w-32 h-32 mx-auto">
                            <img
                              src={previewUrl || ''}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-md"
                            />
                            {isAnalyzing ? (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
                                <div className="text-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-white mx-auto" />
                                  <span className="text-xs text-white mt-1 block">Analyzing...</span>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setPreviewUrl(null);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{selectedFile.name}</p>
                        </div>
                      ) : (
                        <label htmlFor="edit-file-upload" className="cursor-pointer space-y-2 flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm font-medium">Click to upload new image</span>
                          <input
                            id="edit-file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileSelect}
                          />
                        </label>
                      )}
                    </div>
                  </div>
  
                  {/* Edit form fields - Same structure as Add Item form */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newItem.name}
                      onChange={handleInputChange}
                      placeholder="E.g., Blue Denim Jacket"
                      required
                    />
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("category", value)}
                      value={newItem.category}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Tops</SelectItem>
                        <SelectItem value="bottom">Bottoms</SelectItem>
                        <SelectItem value="dress">Dresses</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessory">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={newItem.color}
                      onChange={handleInputChange}
                      placeholder="E.g., Blue, Black, Red"
                      required
                    />
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="season">Season</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("season", value)}
                      value={newItem.season}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Seasons</SelectItem>
                        <SelectItem value="spring">Spring</SelectItem>
                        <SelectItem value="summer">Summer</SelectItem>
                        <SelectItem value="fall">Fall</SelectItem>
                        <SelectItem value="winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="occasion">Occasion</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("occasion", value)}
                      value={newItem.occasion}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="athletic">Athletic</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="w-full border rounded-md p-2"
                      value={newItem.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald hover:bg-emerald-dark">
                  Review Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Review Modal - Shows original and generated images side by side before saving */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingItem ? 'Review Changes' : 'Review Item Details'}</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsReviewModalOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column - Images */}
                <div className="space-y-6">
                  {/* Original Image */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">{selectedFile ? 'Your Image' : 'Current Image'}</h3>
                    <div className="border rounded-md overflow-hidden aspect-square">
                      <img
                        src={selectedFile ? previewUrl : editingItem?.imageUrl}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Generated Image */}
                  {newItem.generatedImageUrl && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">AI Generated Mockup</h3>
                      <div className="border rounded-md overflow-hidden aspect-square relative">
                        {isGeneratingImage ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald" />
                              <p className="mt-2">Generating studio mockup...</p>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={newItem.generatedImageUrl}
                            alt="AI Generated"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        This AI-generated mockup shows a clean studio representation of your item.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Right column - Item details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Item Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Name</p>
                      <p>{newItem.name}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Category</p>
                      <p className="capitalize">{newItem.category}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Color</p>
                      <p>{newItem.color}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Season</p>
                      <p className="capitalize">{newItem.season}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Occasion</p>
                      <p className="capitalize">{newItem.occasion}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Description</p>
                      <p>{newItem.description}</p>
                    </div>
                    
                    {newItem.detailedDescription && (
                      <div>
                        <p className="font-medium">Detailed Description</p>
                        <p>{newItem.detailedDescription}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t flex flex-col gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsReviewModalOpen(false);
                        setIsAddModalOpen(!editingItem);
                        setIsEditModalOpen(!!editingItem);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Edit Details
                    </Button>
                    
                    <Button 
                      type="button" 
                      className="bg-emerald hover:bg-emerald-dark"
                      onClick={handleSubmit}
                    >
                      {editingItem ? 'Save Changes' : 'Add to Wardrobe'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardrobePage;
