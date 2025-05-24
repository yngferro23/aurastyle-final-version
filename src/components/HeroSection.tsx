import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Maya",
    label: "Fashion Enthusiast, Early Access User",
    text: "I've been testing Aura Style AI for the past 2 weeks, and it's honestly addictive. It styles my real clothes better than I ever could. I used to rely on Pinterest — now I just scan my closet!",
    rating: 5,
  },
  {
    name: "David",
    label: "Startup Founder, Beta Tester",
    text: "After 2 weeks of trying it out, I'm seriously impressed. As someone who doesn't think much about fashion, this AI made me look like I know what I'm doing — without lifting a finger.",
    rating: 5,
  },
  {
    name: "Aisha",
    label: "College Student, Early Access User",
    text: "I joined as an early tester and I'm hooked. Aura Style AI made outfits from pieces I forgot I even had. It's like discovering a new wardrobe without spending a cent!",
    rating: 5,
  },
  {
    name: "Lucas",
    label: "Photographer & Creator, Beta Tester",
    text: "Two weeks in, and I've planned entire shoots using only what I already own. Aura Style AI doesn't just give outfits, it understands aesthetic. Game-changer.",
    rating: 5,
  },
  {
    name: "Sofia",
    label: "Busy Mom, Early Access User",
    text: "I've been using it daily since joining the early test group. It saves me so much time every morning and still makes me feel stylish and confident.",
    rating: 5,
  },
  {
    name: "Kenji",
    label: "Fashion Newbie, Beta Tester",
    text: "As a tester for the last two weeks, I've genuinely leveled up my style. I get compliments now — that never used to happen. The AI even teaches you why things work.",
    rating: 5,
  },
  {
    name: "Zara",
    label: "Style Coach & Influencer, Early Access User",
    text: "I joined the test group just to try it out, and I've ended up using it almost every day. It's scary good. I'm even using it to plan outfits for my clients!",
    rating: 5,
  },
  {
    name: "Amir",
    label: "Corporate Professional, Beta Tester",
    text: "I've been testing for 2 weeks and this app has become part of my morning routine. I used to dread putting together outfits — now it's easy, smart, and spot-on.",
    rating: 5,
  },
];

const HeroSection: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
    const timeout = setTimeout(() => setFade(false), 4200);
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setTestimonialIndex((prev) => (prev + 2) % testimonials.length);
        setFade(false);
      }, 400);
    }, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const visible = [
    testimonials[testimonialIndex],
    testimonials[(testimonialIndex + 1) % testimonials.length],
  ];



  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-32 relative overflow-hidden">
      <div 
        className={`container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
            Your AI Stylist.{" "}
            <span className="bg-gradient-to-r from-emerald to-emerald-dark text-transparent bg-clip-text">
              Powered by Your Closet.
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Upload your real clothes. Get outfits for any vibe. Scan Pinterest. Dress smarter with AI.
          </p>
          

        </div>

        {/* Right side: Testimonials carousel */}
        <div className="relative h-[500px] flex items-center justify-center">
          <div className={`w-full h-full max-w-xl flex flex-col justify-center items-center bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-500 ${fade ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
            style={{ maxHeight: 480 }}>
            <h2 className="text-2xl font-bold text-center mb-6 text-emerald">🌟 Testimonials from Our Early Users</h2>
            <div className="flex flex-row gap-6 w-full">
              {visible.map((t, i) => (
                <div
                  key={t.name}
                  className="flex-1 flex flex-col justify-between bg-white rounded-xl shadow p-6 border border-gray-100 min-w-0 animate-fade-in"
                >
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <div className="text-base text-gray-700 mb-4">“{t.text}”</div>
                  <div className="mt-auto">
                    <div className="font-semibold text-emerald text-base">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t.label}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: testimonials.length / 2 }).map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === Math.floor(testimonialIndex / 2) ? 'bg-emerald' : 'bg-gray-300'}`}
                  onClick={() => { setTestimonialIndex(idx * 2); setFade(false); }}
                  aria-label={`Go to testimonials ${idx * 2 + 1} and ${idx * 2 + 2}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
