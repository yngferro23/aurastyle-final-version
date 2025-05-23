import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-dark to-emerald text-transparent bg-clip-text">
              Aura Style AI
            </div>
            <p className="text-muted-foreground max-w-xs">
              Your AI stylist that helps you make the most of your existing wardrobe.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-emerald transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-muted-foreground hover:text-emerald transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-muted-foreground hover:text-emerald transition-colors">
                  Pricing
                </a>
              </li>

            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-emerald transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aura Style AI. All rights reserved.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-emerald transition-colors">
              Twitter
            </a>
            <a href="#" className="text-muted-foreground hover:text-emerald transition-colors">
              Instagram
            </a>
            <a href="#" className="text-muted-foreground hover:text-emerald transition-colors">
              TikTok
            </a>
            <a href="#" className="text-muted-foreground hover:text-emerald transition-colors">
              Pinterest
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
