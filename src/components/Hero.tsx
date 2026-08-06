import React from 'react';
import { ArrowRight, Sparkles, MapPin, Compass } from 'lucide-react';

interface HeroProps {
  onExploreMenu: () => void;
  onOpenReservation: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu, onOpenReservation }) => {
  return (
    <section id="hero" className="relative min-h-[90vh] lg:min-h-screen bg-[#2B231D] text-white flex items-center overflow-hidden pt-20">
      {/* Background Split Screen Graphic & Visual Layers */}
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 opacity-40 lg:opacity-50 pointer-events-none">
        {/* Left Side: Andean Heritage Visual */}
        <div className="relative h-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=75"
            alt="Andean Fresh Organic Harvest"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2B231D]/90 via-[#2B231D]/40 to-transparent" />
        </div>

        {/* Right Side: Indian Clay Pot & Whole Spices Visual */}
        <div className="relative h-full overflow-hidden hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=75"
            alt="Indian Clay Pot Cooking and Aromatic Spices"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#2B231D]/90 via-[#2B231D]/40 to-transparent" />
        </div>
      </div>

      {/* Decorative Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2B231D] via-transparent to-[#2B231D]/80" />

      {/* Floating Animated Spice & Ingredient Accents */}
      <div className="absolute top-1/4 left-8 text-3xl opacity-20 animate-float-spice pointer-events-none hidden md:block">
        🌿
      </div>
      <div className="absolute bottom-1/3 right-12 text-3xl opacity-20 animate-float-slow pointer-events-none hidden md:block">
        ⭐
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Content */}
          <div className="lg:col-span-8 space-y-6 text-left">
            {/* Origin Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5982A]/20 border border-[#E5982A]/40 text-[#E5982A] text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Compass className="w-4 h-4 text-[#C23B22]" />
              <span>Cumbayá, Quito • Equatorial Culinary Fusion</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF6F0] leading-[1.1]">
              Where the <span className="text-[#E5982A] italic">Andes</span> Meet the{' '}
              <span className="text-[#C23B22] italic">Western Ghats</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-[#FAF6F0]/80 max-w-2xl font-sans font-normal leading-relaxed">
              Authentic Indian Heritage meets Vibrant Ecuadorian Flavor in Cumbayá. Experience
              tandoor-fired Amazonian fish, coastal coconut biryanis, and spiced Andean potato cakes.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreMenu}
                className="px-8 py-4 rounded-xl bg-[#C23B22] hover:bg-[#A52F1A] text-white font-semibold text-base shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center gap-3 group"
              >
                <span>Explore Fusion Menu</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#E5982A]" />
              </button>

              <button
                onClick={onOpenReservation}
                className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF6F0] font-medium text-base backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#E5982A]" />
                <span>Reserve Table</span>
              </button>
            </div>

            {/* Trust Markers */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 text-left">
              <div>
                <span className="block font-serif text-2xl font-bold text-[#E5982A]">100%</span>
                <span className="text-xs text-white/70">Authentic Tandoor & Whole Spices</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-[#C23B22]">Local</span>
                <span className="text-xs text-white/70">Andean Roots & Esmeraldas Coconut</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block font-serif text-2xl font-bold text-white flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#C23B22]" /> Quito
                </span>
                <span className="text-xs text-white/70">La Mariscal, Juan León Mera</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="bg-[#1C3A27]/90 p-6 rounded-2xl border border-[#E5982A]/30 backdrop-blur-md shadow-2xl relative">
              <div className="absolute -top-3 -right-3 bg-[#C23B22] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Chef Signature
              </div>
              
              <div className="aspect-4/3 rounded-xl overflow-hidden mb-4 border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80"
                  alt="Coast Encocado Biryani"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-white">Coast Encocado Biryani</h3>
                  <span className="font-bold text-[#E5982A] text-lg">$32.00</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Esmeraldas coastal prawns & tuna baked in achiote coconut cream with Malabar basmati.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-[#E5982A]">
                  <span>🌾 Gluten-Free Option</span>
                  <span>🌶️🌶️ Medium Spice</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
