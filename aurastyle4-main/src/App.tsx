import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, RedirectToSignIn } from "@clerk/clerk-react";

// Landing page
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Dashboard
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/dashboard";
import WardrobePage from "./pages/dashboard/wardrobe";
import StyleGenerator from "./pages/dashboard/generator";
import OccasionPicker from "./pages/dashboard/occasions";
import InspirationScanner from "./pages/dashboard/scanner";
import OutfitPlanner from "./pages/dashboard/planner";
import WardrobeAnalysis from "./pages/dashboard/analysis";
import AIStylistChat from "./pages/dashboard/chat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen">
          {/* Header only shown on landing page, not in dashboard */}
          <Routes>
            <Route path="/" element={
              <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
                <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-dark to-emerald text-transparent bg-clip-text">
                      Aura Style AI
                    </span>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-8 mr-8">
                    <a href="#features" className="text-sm font-medium hover:text-emerald transition-colors">
                      Features
                    </a>
                    <a href="#how-it-works" className="text-sm font-medium hover:text-emerald transition-colors">
                      How It Works
                    </a>
                    <a href="#pricing" className="text-sm font-medium hover:text-emerald transition-colors">
                      Pricing
                    </a>
                  </div>

                  <div className="flex items-center gap-4">
                    <SignedOut>
                      <div className="flex gap-4">
                        <SignInButton mode="modal">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                            Sign Up
                          </button>
                        </SignUpButton>
                      </div>
                    </SignedOut>
                    <SignedIn>
                      <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                  </div>
                </nav>
              </header>
            } />
          </Routes>
          <main className={window.location.pathname !== "/" ? "" : "pt-16"}>
        <Routes>
          {/* Public Routes with redirect for signed in users */}
          <Route path="/" element={
            <>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
              <SignedOut>
                <Index />
              </SignedOut>
            </>
          } />
          
          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <DashboardLayout />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="wardrobe" element={<WardrobePage />} />
            <Route path="generator" element={<StyleGenerator />} />
            <Route path="occasions" element={<OccasionPicker />} />
            <Route path="scanner" element={<InspirationScanner />} />
            <Route path="planner" element={<OutfitPlanner />} />
            <Route path="analysis" element={<WardrobeAnalysis />} />
            <Route path="chat" element={<AIStylistChat />} />
          </Route>

          {/* Sign In/Out Routes */}
          <Route
            path="/sign-in/*"
            element={<RedirectToSignIn />}
          />
          
          {/* Redirect from sign-in success to dashboard */}
          <Route
            path="/sign-in-callback"
            element={<Navigate to="/dashboard" replace />}
          />
          
          {/* Redirect from sign-up success to dashboard */}
          <Route
            path="/sign-up-callback"
            element={<Navigate to="/dashboard" replace />}
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
