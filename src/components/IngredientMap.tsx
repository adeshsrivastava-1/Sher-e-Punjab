import React, { useState } from 'react';
import { Compass, Sparkles, MapPin, ArrowRightLeft, Leaf } from 'lucide-react';

interface IngredientPair {
  id: string;
  name: string;
  icon: string;
  ecuadorSide: {
    title: string;
    location: string;
    description: string;
  };
  indiaSide: {
    title: string;
    location: string;
    description: string;
  };
  fusionDish: string;
  culinaryNote: string;
}

export const IngredientMap: React.FC = () => {
  const [selectedPairId, setSelectedPairId] = useState<string>('coconut');

  const pairs: IngredientPair[] = [
    {
      id: 'coconut',
      name: 'Coconut & Palms',
      icon: '🥥',
      ecuadorSide: {
        title: 'Esmeraldas Coconut Milk',
        location: 'Coastal Esmeraldas, Ecuador',
        description: 'Freshly extracted raw coconut milk used traditionally in Afro-Ecuadorian Encocado stew.'
      },
      indiaSide: {
        title: 'Malabar Coconut Paste',
        location: 'Kerala, Western Ghats, India',
        description: 'Slow-simmered coconut milk and toasted coconut copra used in Dum biryani and Moilee curries.'
      },
      fusionDish: 'Coast Encocado Biryani',
      culinaryNote: 'Both coastal cultures use natural coconut oils to carry fat-soluble spice aromas at high temperatures.'
    },
    {
      id: 'plantain',
      name: 'Plantains & Tubers',
      icon: '🍌',
      ecuadorSide: {
        title: 'Andean Papa Chola & Plátano',
        location: 'Highland Sierra & Coast',
        description: 'Pan-crisped potato cakes (Llapingachos) and sweet caramelized plátano maduro.'
      },
      indiaSide: {
        title: 'Punjab Aloo & Raw Banana',
        location: 'Indus Valley & South India',
        description: 'Golden spiced potato tikkis tempered with mustard seeds, cumin, and dried mango powder.'
      },
      fusionDish: 'Aloo Tikki Llapingachos',
      culinaryNote: 'High starch density creates an ideal crispy exterior crust while maintaining a creamy center.'
    },
    {
      id: 'chili',
      name: 'Chili & Ají Spicing',
      icon: '🌶️',
      ecuadorSide: {
        title: 'Ají Criollo & Rocoto',
        location: 'Andean Valley, Quito',
        description: 'Fresh citrusy chili pastes blended with tree tomato (tomate de árbol) and green onions.'
      },
      indiaSide: {
        title: 'Kashmiri & Deggi Chili',
        location: 'Kashmir & Guntur, India',
        description: 'Vibrant crimson chili powder delivering deep smoky color and moderate warming heat.'
      },
      fusionDish: 'Seco de Chivo Rogan Josh',
      culinaryNote: 'Kashmiri chili provides intense ruby color without overpowering the tart citrus acidity of Andean Ají.'
    },
    {
      id: 'cacao',
      name: 'Cacao & Cardamom',
      icon: '🍫',
      ecuadorSide: {
        title: 'Cacao Fino de Aroma',
        location: 'Manabí & Vinces, Ecuador',
        description: 'World-famous 72% organic dark chocolate noted for floral, fruity, and nutty notes.'
      },
      indiaSide: {
        title: 'Green Cardamom & Nutmeg',
        location: 'Idukki Cardamom Hills, India',
        description: 'Aromatic green pods dubbed the "Green Gold" of Malabar, carrying sweet eucalyptus scent.'
      },
      fusionDish: 'Cacao Garam Masala Mousse',
      culinaryNote: 'Eugenol in nutmeg and terpene compounds in green cardamom bind harmoniously with cocoa solids.'
    }
  ];

  const activePair = pairs.find(p => p.id === selectedPairId) || pairs[0];

  return (
    <section id="ingredient-map" className="py-24 bg-[#FAF6F0] relative overflow-hidden border-b border-[#E5982A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1C3A27] text-[#E5982A] text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4 text-[#C23B22]" />
            <span>Equatorial Botanical Map</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C3A27] tracking-tight">
            Bridging Quito to Kerala
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6B5E54]">
            Situated on the Equatorial latitude belt, Ecuador and Western India cultivate shared agricultural treasures. Select an ingredient below to explore the botanical bridge.
          </p>
        </div>

        {/* Ingredient Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {pairs.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPairId(p.id)}
              className={`px-5 py-3 rounded-2xl font-serif text-sm font-bold flex items-center gap-2.5 transition-all shadow-sm ${
                selectedPairId === p.id
                  ? 'bg-[#1C3A27] text-white ring-2 ring-[#E5982A] scale-105'
                  : 'bg-[#FFFDF9] text-[#2B231D] hover:bg-[#E5982A]/20 border border-[#E5982A]/30'
              }`}
            >
              <span className="text-xl">{p.icon}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        {/* Infographic Map Card */}
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E5982A]/40 p-6 sm:p-10 shadow-xl max-w-5xl mx-auto relative text-left">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8 border-b border-gray-100 pb-8">
            
            {/* Ecuador Side */}
            <div className="flex-1 w-full bg-[#FAF6F0] p-6 rounded-2xl border border-amber-200/60 relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🇪🇨</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C23B22] block">
                    Andes & Coast Origin
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1C3A27]">
                    {activePair.ecuadorSide.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-[#6B5E54] mb-3">
                <MapPin className="w-3.5 h-3.5 text-[#C23B22]" />
                <span>{activePair.ecuadorSide.location}</span>
              </div>

              <p className="text-xs text-[#2B231D]/80 leading-relaxed font-sans">
                {activePair.ecuadorSide.description}
              </p>
            </div>

            {/* Central Bridge Emblem */}
            <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-[#C23B22] text-white rounded-full shadow-lg border-4 border-[#FAF6F0]">
              <ArrowRightLeft className="w-6 h-6 text-[#E5982A]" />
              <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Fusion</span>
            </div>

            {/* India Side */}
            <div className="flex-1 w-full bg-[#FAF6F0] p-6 rounded-2xl border border-[#1C3A27]/20 relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🇮🇳</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C3A27] block">
                    Western Ghats & Punjab Origin
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1C3A27]">
                    {activePair.indiaSide.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-[#6B5E54] mb-3">
                <MapPin className="w-3.5 h-3.5 text-[#E5982A]" />
                <span>{activePair.indiaSide.location}</span>
              </div>

              <p className="text-xs text-[#2B231D]/80 leading-relaxed font-sans">
                {activePair.indiaSide.description}
              </p>
            </div>

          </div>

          {/* Flavor Science & Featured Dish Footer in Map */}
          <div className="bg-[#1C3A27] text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-[#E5982A] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#C23B22]" />
                <span>Flavor Science & Chemistry</span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl font-light">
                {activePair.culinaryNote}
              </p>
            </div>

            <div className="shrink-0 text-left md:text-right bg-white/10 p-4 rounded-xl border border-white/20">
              <span className="text-[10px] uppercase font-bold text-[#E5982A] block">
                Featured Fusion Dish
              </span>
              <span className="font-serif font-bold text-base text-white">
                {activePair.fusionDish}
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
