import React from 'react';
import { Compass, Flame, Shield, Heart } from 'lucide-react';

export const OurStory: React.FC = () => {
  return (
    <section id="our-story" className="py-24 bg-[#1C3A27] text-white relative overflow-hidden">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C23B22]/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E5982A]/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Story Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5982A]/20 border border-[#E5982A]/30 text-[#E5982A] text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-4 h-4 text-[#C23B22]" />
              <span>Culinary Philosophy</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF6F0] leading-tight">
              Where Equatorial Soil Meets <span className="text-[#E5982A] italic">Punjabi Heritage</span>
            </h2>

            <p className="text-base sm:text-lg text-[#FAF6F0]/85 leading-relaxed font-sans font-light">
              Founded in Cumbayá—Quito’s sun-drenched valley—<strong>Sher E Punjab</strong> began as an authentic sanctuary for Northern Indian clay-pot cooking. Today, we pioneer an exciting expansion: an <em>Indio-Ecuatoriano</em> fusion celebrating shared equatorial bounty.
            </p>

            <p className="text-base text-[#FAF6F0]/75 leading-relaxed font-sans font-light">
              Lying directly on the Equator line, Ecuador and Southern/Western India share mirroring microclimates. The lush coconut groves of Esmeraldas echo the coastal palms of Kerala; the volcanic tubers of the Andean Sierra parallel the heritage potato crops of the Indus Valley.
            </p>

            {/* Core Pillars */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/10">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#C23B22]/20 border border-[#C23B22]/40 text-[#C23B22] shrink-0">
                  <Flame className="w-5 h-5 text-[#E5982A]" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-white">Clay Tandoor Sear</h4>
                  <p className="text-xs text-white/70 leading-relaxed mt-1">
                    Authentic 800°F charcoal clay tandoors charring Amazonian Paiche fish, spiced paneer, and artisanal naan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#E5982A]/20 border border-[#E5982A]/40 text-[#E5982A] shrink-0">
                  <Heart className="w-5 h-5 text-[#E5982A]" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-white">Direct Flavor Bridge</h4>
                  <p className="text-xs text-white/70 leading-relaxed mt-1">
                    Achiote oil blended with mustard seeds, chicha de jora slow-braising Kashmiri lamb, and organic Manabí cacao mousse.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Right Column */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="aspect-4/5 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#E5982A]/30 relative">
                <img
                  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=75"
                  alt="Authentic Indian Spices in Clay Bowl"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C3A27] via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#FAF6F0]/95 text-[#2B231D] backdrop-blur-md shadow-xl border border-[#E5982A]/40 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C23B22] block">
                    Location & Ambience
                  </span>
                  <h4 className="font-serif font-bold text-base text-[#1C3A27]">
                    Cumbayá Garden Patio & Lounge
                  </h4>
                  <p className="text-xs text-[#6B5E54] mt-1">
                    Enjoy open-air dining under tropical Cumbayá palms with spiced craft drinks & live tandoor scents.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
