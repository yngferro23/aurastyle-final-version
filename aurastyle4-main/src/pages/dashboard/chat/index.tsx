import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Bot, User } from "lucide-react";

// Types for chat messages
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Mock function to simulate OpenAI API call
const mockStylistChat = async (messages: Message[]) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Get the last message content
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
  // Generate different responses based on input
  if (lastMessage.includes("outfit") && lastMessage.includes("work")) {
    return "For a work outfit, I'd recommend pairing your white button-up shirt with the black blazer and blue jeans. Add your white sneakers for a business casual look that's professional but comfortable. If you have a meeting, consider adding a simple accessory like a watch to elevate the outfit.";
  } else if (lastMessage.includes("brunch") || lastMessage.includes("casual")) {
    return "For a casual brunch, try your black leather jacket over a simple white t-shirt, paired with your blue jeans and white sneakers. This creates an effortless cool vibe that's perfect for weekend socializing.";
  } else if (lastMessage.includes("date") || lastMessage.includes("dinner")) {
    return "For a dinner date, consider wearing your red dress with a statement accessory. If it's cooler out, your black leather jacket would add an edgy contrast. Finish with a pair of heels or your white sneakers for a more casual but still polished look.";
  } else if (lastMessage.includes("weather") || lastMessage.includes("rain") || lastMessage.includes("cold")) {
    return "For rainy or cold weather, layering is key. Start with your white button-up, add your black blazer, and top with your leather jacket if it's particularly cold. Pair with your blue jeans and make sure to wear weather-appropriate footwear.";
  } else if (lastMessage.includes("hello") || lastMessage.includes("hi") || lastMessage.includes("hey")) {
    return "Hello! I'm your AI Stylist assistant. I can help you create outfits from your wardrobe, offer style advice, or answer fashion questions. What can I help you with today?";
  } else {
    return "Based on your wardrobe, I'd suggest experimenting with different combinations of your basics. Your white button-up shirt is versatile and can be styled multiple ways. Would you like specific recommendations for a particular occasion or weather condition?";
  }
};

const AIStylistChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Stylist assistant. I can help you create outfits from your wardrobe, offer style advice, or answer fashion questions. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions for quick interaction
  const suggestedQuestions = [
    "What should I wear for a work meeting tomorrow?",
    "Suggest a casual outfit for weekend brunch",
    "Help me style an outfit for a date night",
    "What do I wear in rainy weather?",
    "How can I make my wardrobe more versatile?",
  ];

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // In a real implementation, this would call your backend API
      // which would then call OpenAI's API
      const response = await mockStylistChat([...messages, userMessage]);
      
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        <h1 className="text-3xl font-bold mb-4">AI Stylist Chat</h1>
        <p className="text-muted-foreground mb-6">
          Chat with your personal AI stylist for fashion advice, outfit ideas, and style tips.
        </p>

        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald" />
              Aura Style AI Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className={message.role === "assistant" ? "bg-emerald text-white" : "bg-blue-600 text-white"}>
                      <AvatarFallback>
                        {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "assistant"
                          ? "bg-gray-100"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs ${
                          message.role === "assistant"
                            ? "text-gray-500"
                            : "text-blue-100"
                        } mt-1`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <Avatar className="bg-emerald text-white">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-gray-500">Thinking...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <div className="border-t p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about outfit ideas, style advice, or fashion tips..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="bg-emerald hover:bg-emerald-dark"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIStylistChat;
