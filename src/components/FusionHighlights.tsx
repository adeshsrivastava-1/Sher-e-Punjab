import React from 'react';
import { Sparkles, Plus, Minus, Info, ChevronRight, Flame } from 'lucide-react';
import { MenuItem, CartItem, SelectedOptionSelection } from '../types';

interface FusionHighlightsProps {
  items: MenuItem[];
  cartItems?: CartItem[];
  onSelectDish: (dish: MenuItem) => void;
  onAddToCart: (dish: MenuItem, selectedOptions?: SelectedOptionSelection[], customerNote?: string) => void;
  onDecrementDish?: (dishId: string) => void;
}

export const FusionHighlights: React.FC<FusionHighlightsProps> = ({
  items,
  cartItems = [],
  onSelectDish,
  onAddToCart,
  onDecrementDish
}) => {
  const featuredDishes = items.filter(item => item.isFeatured || item.isAvailable).slice(0, 5);

  return (
    <section id="fusion-highlights" className="py-20 bg-[#FAF6F0] relative overflow-hidden border-b border-[#E5982A]/20">
      {/* Subtle Background Accent Lines */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5982A]/15 text-[#C23B22] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#E5982A]" />
              <span>Equatorial Gastronomy</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C3A27] tracking-tight">
              Signature Fusion Highlights
            </h2>
            <p className="mt-3 text-base text-[#6B5E54] max-w-xl">
              Each dish creates a direct flavor bridge between two ancient culinary worlds—matching native Ecuadorian crops with traditional Indian spicing.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex items-center gap-2 text-xs font-semibold text-[#1C3A27] uppercase tracking-wider">
            <span>Scroll to explore</span>
            <ChevronRight className="w-4 h-4 text-[#C23B22]" />
          </div>
        </div>

        {/* Horizontal Scroll Carousel */}
        <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none snap-x snap-mandatory">
          {featuredDishes.map((dish) => {
            const cartQuantity = cartItems
              .filter((item) => item.dish.id === dish.id)
              .reduce((acc, item) => acc + item.quantity, 0);

            return (
              <div
                key={dish.id}
                className="snap-start shrink-0 w-[280px] sm:w-[340px] bg-[#FFFDF9] rounded-2xl border border-[#E5982A]/30 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Image & Origin Badge Container */}
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-4 bg-gray-100">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Origin Badge */}
                    <div className="absolute top-3 left-3 bg-[#1C3A27]/90 text-[#FAF6F0] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/20">
                      {dish.originBadge}
                    </div>
                    {/* Spice Badge */}
                    {dish.spiceLevel > 0 && (
                      <div className="absolute bottom-3 right-3 bg-[#FAF6F0]/90 text-[#C23B22] text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-0.5 border border-[#C23B22]/20">
                        <Flame className="w-3 h-3 text-[#C23B22]" />
                        <span>{'🌶️'.repeat(dish.spiceLevel)}</span>
                      </div>
                    )}
                  </div>

                  {/* Dish Header & Title */}
                  <div className="text-left space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-xl font-bold text-[#2B231D] leading-snug group-hover:text-[#C23B22] transition-colors">
                        {dish.name}
                      </h3>
                      <span className="font-sans font-bold text-lg text-[#C23B22] shrink-0">
                        ${dish.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B5E54] line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>

                    {/* Flavor Bridge Tag */}
                    <div className="pt-2 text-[11px] font-semibold text-[#1C3A27] bg-[#1C3A27]/5 px-2.5 py-1.5 rounded-lg border border-[#1C3A27]/10">
                      <span className="text-[#C23B22]">Bridge: </span>
                      {dish.flavorBridge.ecuadorianComponent.split('&')[0]} × {dish.flavorBridge.indianTechnique.split('&')[0]}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectDish(dish)}
                    className="flex-1 py-2 px-3 rounded-lg border border-[#1C3A27]/30 text-[#1C3A27] hover:bg-[#1C3A27] hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Breakdown</span>
                  </button>

                  {cartQuantity > 0 ? (
                    <div className="flex items-center gap-1 bg-[#1C3A27] text-white p-1 rounded-lg shadow-md border border-[#1C3A27]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDecrementDish) onDecrementDish(dish.id);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer active:scale-90"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDish(dish);
                        }}
                        className="px-1.5 font-bold text-xs text-[#E5982A] min-w-[18px] text-center cursor-pointer hover:underline"
                        title="Added to cart. Click to customize specs."
                      >
                        {cartQuantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDish(dish);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded bg-[#C23B22] hover:bg-[#A52F1A] text-white font-bold transition-colors cursor-pointer active:scale-90"
                        title="Add another with specifications"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDish(dish);
                      }}
                      className="py-2 px-4 rounded-lg bg-[#C23B22] hover:bg-[#A52F1A] text-white transition-colors text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
