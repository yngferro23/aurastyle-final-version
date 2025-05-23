import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";

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

const TestimonialsSection: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 2) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const visible = [
    testimonials[index],
    testimonials[(index + 1) % testimonials.length],
  ];

  return (
    <section className="py-20 bg-white/80 flex flex-col items-center justify-center">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
          🌟 Testimonials from Our Early Users
        </h2>
      </div>
      <div className="w-full max-w-4xl mx-auto flex flex-row gap-8 justify-center items-stretch transition-all duration-700">
        {visible.map((t, i) => (
          <div
            key={t.name}
            className="flex-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-between animate-fade-in"
            style={{ minWidth: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <div className="text-lg text-gray-700 mb-4">"{t.text}"</div>
            <div className="mt-auto">
              <div className="font-semibold text-emerald text-base">{t.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection; 