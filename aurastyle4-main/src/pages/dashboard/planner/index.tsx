import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for saved outfits
const MOCK_SAVED_OUTFITS = [
  {
    id: "outfit-1",
    name: "Business Casual",
    items: [
      {
        id: "1",
        name: "White Button-Up Shirt",
        category: "top",
        imageUrl: "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      },
      {
        id: "2",
        name: "Blue Jeans",
        category: "bottom",
        imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      },
      {
        id: "3",
        name: "Black Leather Jacket",
        category: "outerwear",
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      },
      {
        id: "5",
        name: "White Sneakers",
        category: "shoes",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
  {
    id: "outfit-2",
    name: "Evening Out",
    items: [
      {
        id: "4",
        name: "Red Dress",
        category: "dress",
        imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      },
      {
        id: "5",
        name: "White Sneakers",
        category: "shoes",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
];

// Mock data for planned outfits by date
const MOCK_PLANNED_OUTFITS: Record<string, {
  outfitId: string;
  eventName: string;
}> = {
  "2025-05-22": { outfitId: "outfit-1", eventName: "Work Meeting" },
  "2025-05-25": { outfitId: "outfit-2", eventName: "Dinner with Friends" },
};

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasPlannedOutfit: boolean;
}

const OutfitPlanner: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // For demo purposes, using state instead of a database
  const [savedOutfits] = useState(MOCK_SAVED_OUTFITS);
  const [plannedOutfits, setPlannedOutfits] = useState<typeof MOCK_PLANNED_OUTFITS>(MOCK_PLANNED_OUTFITS);
  
  const { toast } = useToast();

  // Helper function to format date as YYYY-MM-DD
  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Generate calendar days for the current month view
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Create a date for the first day of the month
    const firstDay = new Date(year, month, 1);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const lastDate = lastDay.getDate();
    
    // Add days from previous month to fill in the first week
    const prevMonth = new Date(year, month, 0);
    const prevMonthLastDate = prevMonth.getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDate - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        hasPlannedOutfit: !!plannedOutfits[formatDateKey(date)],
      });
    }
    
    // Add days of the current month
    const today = new Date();
    for (let i = 1; i <= lastDate; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        hasPlannedOutfit: !!plannedOutfits[formatDateKey(date)],
      });
    }
    
    // Add days from next month to complete the calendar
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        hasPlannedOutfit: !!plannedOutfits[formatDateKey(date)],
      });
    }
    
    return days;
  };

  // Helper to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Handle day click in calendar
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    
    const dateKey = formatDateKey(day.date);
    const plannedOutfit = plannedOutfits[dateKey];
    
    if (plannedOutfit) {
      setSelectedOutfitId(plannedOutfit.outfitId);
      setEventName(plannedOutfit.eventName);
    } else {
      setSelectedOutfitId("");
      setEventName("");
    }
    
    setIsEditModalOpen(true);
  };

  // Save outfit to calendar
  const handleSaveOutfit = () => {
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    
    if (selectedOutfitId) {
      // Add or update outfit for the selected date
      setPlannedOutfits(prev => ({
        ...prev,
        [dateKey]: {
          outfitId: selectedOutfitId,
          eventName: eventName,
        },
      }));
      
      toast({
        title: "Outfit Planned",
        description: `Outfit planned for ${selectedDate.toLocaleDateString()}`,
      });
    } else {
      // If no outfit is selected, remove any existing outfit for this date
      const newPlannedOutfits = { ...plannedOutfits };
      delete newPlannedOutfits[dateKey];
      setPlannedOutfits(newPlannedOutfits);
      
      toast({
        title: "Outfit Removed",
        description: `Outfit removed from ${selectedDate.toLocaleDateString()}`,
      });
    }
    
    setIsEditModalOpen(false);
  };

  // Get outfit details by its ID
  const getOutfitById = (outfitId: string) => {
    return savedOutfits.find(outfit => outfit.id === outfitId);
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Outfit Planner</h1>
          <p className="text-muted-foreground">
            Plan your outfits for upcoming events and never worry about what to wear again.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">{currentMonthName}</h2>
            <Button variant="ghost" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Calendar Weekdays */}
          <div className="grid grid-cols-7 border-b">
            {weekdays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`
                  h-24 p-1 border border-gray-100 overflow-hidden transition-colors
                  ${!day.isCurrentMonth ? "bg-gray-50 text-gray-400" : ""}
                  ${day.isToday ? "bg-blue-50" : ""}
                  hover:bg-gray-100 cursor-pointer
                `}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between">
                  <span className={`
                    text-sm p-1 h-7 w-7 flex items-center justify-center rounded-full
                    ${day.isToday ? "bg-blue-600 text-white" : ""}
                  `}>
                    {day.date.getDate()}
                  </span>
                  {day.hasPlannedOutfit && (
                    <div className="h-2 w-2 rounded-full bg-emerald mt-1 mr-1"></div>
                  )}
                </div>
                
                {/* Event name if there's a planned outfit */}
                {day.hasPlannedOutfit && (
                  <div className="mt-1">
                    <div className="text-xs px-1 py-0.5 bg-emerald/10 text-emerald rounded truncate">
                      {plannedOutfits[formatDateKey(day.date)].eventName}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Outfit Edit Modal */}
        {isEditModalOpen && selectedDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  Plan Outfit for {selectedDate.toLocaleDateString()}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input
                    id="event-name"
                    placeholder="e.g., Work Meeting, Dinner Date"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="outfit-select">Select Outfit</Label>
                  <Select value={selectedOutfitId} onValueChange={setSelectedOutfitId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an outfit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No outfit</SelectItem>
                      {savedOutfits.map((outfit) => (
                        <SelectItem key={outfit.id} value={outfit.id}>
                          {outfit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Preview selected outfit */}
                {selectedOutfitId && (
                  <div className="border rounded-lg p-3 mt-4">
                    <h3 className="font-semibold">
                      {getOutfitById(selectedOutfitId)?.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getOutfitById(selectedOutfitId)?.items.map((item) => (
                        <div key={item.id} className="relative w-14 h-14">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md"
                            title={item.name}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-2">
                  {plannedOutfits[formatDateKey(selectedDate)] && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedOutfitId("");
                        handleSaveOutfit();
                      }}
                      className="gap-1 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                  <Button 
                    onClick={handleSaveOutfit}
                    className="bg-emerald hover:bg-emerald-dark gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitPlanner;
