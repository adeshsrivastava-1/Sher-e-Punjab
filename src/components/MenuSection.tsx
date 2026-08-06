import React, { useState, useMemo } from 'react';
import { Search, Filter, Info, Plus, Minus, Flame, Sparkles, Check, ChevronDown } from 'lucide-react';
import { MenuItem, CategoryId, CartItem, SelectedOptionSelection } from '../types';

interface MenuSectionProps {
  items: MenuItem[];
  cartItems?: CartItem[];
  onSelectDish: (dish: MenuItem) => void;
  onAddToCart: (dish: MenuItem, selectedOptions?: SelectedOptionSelection[], customerNote?: string) => void;
  onDecrementDish?: (dishId: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  cartItems = [],
  onSelectDish,
  onAddToCart,
  onDecrementDish
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [gfOnly, setGfOnly] = useState(false);
  const [maxSpice, setMaxSpice] = useState<number>(3);

  const categories: { id: CategoryId; label: string; icon: string }[] = [
    { id: 'all', label: 'All Creations', icon: '🍽️' },
    { id: 'small-plates', label: 'Small Plates', icon: '🥟' },
    { id: 'mains', label: 'Mains & Biryanis', icon: '🥘' },
    { id: 'ceviches-chaats', label: 'Ceviches & Chaats', icon: '🦐' },
    { id: 'cocktails-drinks', label: 'Cocktails & Beverages', icon: '🍹' },
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category match
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Search query match
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesOrigin = item.originBadge.toLowerCase().includes(query);
        const matchesIng = item.ecuadorianIngredients.some(i => i.toLowerCase().includes(query)) ||
                           item.indianSpices.some(i => i.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesOrigin && !matchesIng) {
          return false;
        }
      }
      // Veg filter
      if (vegOnly && !item.isVegetarian) {
        return false;
      }
      // Gluten-free filter
      if (gfOnly && !item.isGlutenFree) {
        return false;
      }
      // Spice level filter
      if (item.spiceLevel > maxSpice) {
        return false;
      }

      return true;
    });
  }, [items, activeCategory, searchQuery, vegOnly, gfOnly, maxSpice]);

  // Background color ambient hint based on active category
  const categoryBgTint = {
    'all': 'bg-[#FAF6F0]',
    'small-plates': 'bg-[#FAF6F0]',
    'mains': 'bg-[#FAF4EC]',
    'ceviches-chaats': 'bg-[#FAF6F2]',
    'cocktails-drinks': 'bg-[#FDF6ED]'
  }[activeCategory];

  return (
    <section id="menu-section" className={`py-20 transition-colors duration-500 ${categoryBgTint} border-b border-[#E5982A]/20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1C3A27] text-[#E5982A] text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C23B22]" />
            <span>Interactive Fusion Menu</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C3A27] tracking-tight">
            Crafted for Cumbayá Palates
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6B5E54]">
            Prices listed in USD. Click any dish to view its 2-column Ecuadorian ingredient & Indian spice breakdown.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-4 mb-8 scrollbar-none snap-x">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`snap-start px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activeCategory === cat.id
                  ? 'bg-[#C23B22] text-white shadow-lg scale-105'
                  : 'bg-[#FFFDF9] text-[#2B231D] hover:bg-[#E5982A]/20 border border-[#E5982A]/30'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Dietary Preference Bar */}
        <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E5982A]/30 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E54]" />
            <input
              type="text"
              placeholder="Search dishes, ingredients (e.g., coconut, achiote)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-[#FAF6F0] text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#C23B22]"
            />
          </div>

          {/* Toggle Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end text-xs">
            {/* Vegetarian Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                vegOnly
                  ? 'bg-[#1C3A27] text-white border-[#1C3A27]'
                  : 'bg-white text-[#2B231D] border-gray-200 hover:border-[#1C3A27]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              <span>Vegetarian Only</span>
            </button>

            {/* Gluten Free Toggle */}
            <button
              onClick={() => setGfOnly(!gfOnly)}
              className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                gfOnly
                  ? 'bg-[#E5982A] text-white border-[#E5982A]'
                  : 'bg-white text-[#2B231D] border-gray-200 hover:border-[#E5982A]'
              }`}
            >
              <span>🌾 Gluten-Free</span>
            </button>

            {/* Spice Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              <Flame className="w-3.5 h-3.5 text-[#C23B22]" />
              <span className="text-gray-600">Max Spice:</span>
              <select
                value={maxSpice}
                onChange={(e) => setMaxSpice(Number(e.target.value))}
                className="bg-transparent font-bold text-[#C23B22] focus:outline-none cursor-pointer"
              >
                <option value={3}>All Spices (1-3)</option>
                <option value={2}>Mild-Medium (1-2)</option>
                <option value={1}>Mild Only (1)</option>
                <option value={0}>Non-Spicy (0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dish Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFDF9] rounded-2xl border border-dashed border-gray-300">
            <p className="font-serif text-xl text-[#2B231D]">No dishes match your selected filters.</p>
            <p className="text-xs text-[#6B5E54] mt-2">Try clearing your search term or adjusting dietary preferences.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setVegOnly(false);
                setGfOnly(false);
                setMaxSpice(3);
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-[#C23B22] text-white rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((dish) => {
              const cartQuantity = cartItems
                .filter((item) => item.dish.id === dish.id)
                .reduce((acc, item) => acc + item.quantity, 0);

              return (
                <div
                  key={dish.id}
                  className={`bg-[#FFFDF9] rounded-2xl border border-[#E5982A]/30 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group ${
                    !dish.isAvailable ? 'opacity-60 grayscale-[30%]' : ''
                  }`}
                >
                  <div>
                    {/* Dish Thumbnail */}
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden mb-4 bg-gray-100">
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

                      {/* Stock status overlay if unavailable */}
                      {!dish.isAvailable && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                          <span className="bg-[#C23B22] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Sold Out Today
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dish Info */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-[#2B231D] group-hover:text-[#C23B22] transition-colors leading-snug">
                            {dish.name}
                          </h3>
                          {dish.spanishName && (
                            <span className="text-[11px] text-[#6B5E54] italic block">
                              {dish.spanishName}
                            </span>
                          )}
                        </div>
                        <span className="font-sans font-bold text-lg text-[#C23B22] shrink-0">
                          ${dish.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-[#6B5E54] leading-relaxed line-clamp-3">
                        {dish.description}
                      </p>

                      {/* Dietary & Spice Markers */}
                      <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-medium">
                        {dish.isVegetarian ? (
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                            🟢 Veg
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                            🔴 Non-Veg
                          </span>
                        )}

                        {dish.isGlutenFree && (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            🌾 Gluten-Free
                          </span>
                        )}

                        {dish.spiceLevel > 0 && (
                          <span className="bg-orange-100 text-orange-900 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-[#C23B22]" />
                            <span>Ají Scale {dish.spiceLevel}/3</span>
                          </span>
                        )}
                      </div>

                      {/* Flavor Bridge Tag */}
                      <div className="pt-3">
                        <div
                          onClick={() => onSelectDish(dish)}
                          className="cursor-pointer bg-[#FAF6F0] hover:bg-[#E5982A]/15 border border-[#E5982A]/30 p-2.5 rounded-xl text-left transition-colors"
                        >
                          <span className="text-[10px] uppercase font-bold text-[#C23B22] block tracking-wider">
                            Flavor Bridge Pair:
                          </span>
                          <div className="text-xs font-semibold text-[#1C3A27] mt-0.5 flex items-center justify-between">
                            <span>{dish.flavorBridge.ecuadorianComponent}</span>
                            <span className="text-[#C23B22] mx-1 font-bold">×</span>
                            <span>{dish.flavorBridge.indianTechnique}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => onSelectDish(dish)}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-[#1C3A27]/30 text-[#1C3A27] hover:bg-[#1C3A27] hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Ingredients</span>
                    </button>

                    {cartQuantity > 0 ? (
                      <div className="flex items-center gap-1 bg-[#1C3A27] text-white p-1 rounded-xl shadow-md border border-[#1C3A27]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDecrementDish) onDecrementDish(dish.id);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer active:scale-90"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDish(dish);
                          }}
                          className="px-2 font-bold text-xs text-[#E5982A] min-w-[20px] text-center cursor-pointer hover:underline"
                          title="Added to cart. Click to customize specs."
                        >
                          {cartQuantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDish(dish);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#C23B22] hover:bg-[#A52F1A] text-white font-bold transition-colors cursor-pointer active:scale-90"
                          title="Add another with specifications"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={!dish.isAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDish(dish);
                        }}
                        className={`py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer ${
                          dish.isAvailable
                            ? 'bg-[#C23B22] hover:bg-[#A52F1A]'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{dish.isAvailable ? 'Add' : 'Sold Out'}</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
