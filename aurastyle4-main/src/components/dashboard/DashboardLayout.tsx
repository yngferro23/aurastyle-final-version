import React from "react";
import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { 
  Shirt, 
  PaintBucket, 
  Image, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Menu,
  X,
  User,
  Tag
} from "lucide-react";

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Navigation items
  const navItems = [
    {
      icon: <Shirt className="h-5 w-5" />,
      label: "My Wardrobe",
      path: "/dashboard/wardrobe",
    },
    {
      icon: <PaintBucket className="h-5 w-5" />,
      label: "Style Generator",
      path: "/dashboard/generator",
    },
    {
      icon: <Tag className="h-5 w-5" />,
      label: "Occasion Picker",
      path: "/dashboard/occasions",
    },
    {
      icon: <Image className="h-5 w-5" />,
      label: "Inspiration Scanner",
      path: "/dashboard/scanner",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Outfit Planner",
      path: "/dashboard/planner",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Wardrobe Analysis",
      path: "/dashboard/analysis",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "AI Stylist Chat",
      path: "/dashboard/chat",
    },
    {
      icon: <User className="h-5 w-5" />,
      label: "My Profile",
      path: "#", // This would link to a profile page in a full implementation
      isProfile: true
    },
  ];

  // If user accesses /dashboard, redirect to /dashboard/wardrobe
  if (location.pathname === "/dashboard") {
    return <Navigate to="/dashboard/wardrobe" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-full bg-emerald text-white shadow-md"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          w-full md:w-64 bg-white shadow-md min-h-screen overflow-y-auto
          fixed md:sticky top-0 left-0 z-40 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-dark to-emerald text-transparent bg-clip-text">
            Aura Style AI
          </h1>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path || item.label}>
                {item.isProfile ? (
                  <div className="relative cursor-pointer">
                    {/* Hidden button to be triggered when clicking anywhere in the row */}
                    <div className="absolute inset-0 z-10" onClick={() => {
                      // Find the clerk-user-button element and simulate a click
                      const userButton = document.querySelector('.cl-userButtonTrigger') as HTMLElement;
                      if (userButton) userButton.click();
                    }}></div>
                    
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100">
                      {item.icon}
                      <span>{item.label}</span>
                      <div className="ml-auto">
                        <UserButton afterSignOutUrl="/" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        location.pathname === item.path
                          ? "bg-emerald/10 text-emerald"
                          : "hover:bg-gray-100"
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 max-w-full p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
