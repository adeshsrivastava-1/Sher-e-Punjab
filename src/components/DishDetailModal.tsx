import React, { useState, useEffect } from 'react';
import { X, Flame, Plus, Sparkles, Check, Edit3, Settings2 } from 'lucide-react';
import { MenuItem, SelectedOptionSelection } from '../types';

interface DishDetailModalProps {
  dish: MenuItem | null;
  onClose: () => void;
  onAddToCart: (dish: MenuItem, selectedOptions?: SelectedOptionSelection[], customerNote?: string) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  onClose,
  onAddToCart
}) => {
  if (!dish) return null;

  // Selected options map: groupId -> string[] of selected choice IDs
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string[]>>({});
  const [customerNote, setCustomerNote] = useState('');

  // Initialize default single selections when dish changes
  useEffect(() => {
    if (!dish || !dish.customOptions) {
      setSelectedChoices({});
      setCustomerNote('');
      return;
    }

    const initialMap: Record<string, string[]> = {};
    dish.customOptions.forEach((grp) => {
      if (grp.type === 'single' && grp.choices && grp.choices.length > 0) {
        // default to first choice if required or available
        initialMap[grp.id] = [grp.choices[0].id];
      } else {
        initialMap[grp.id] = [];
      }
    });
    setSelectedChoices(initialMap);
    setCustomerNote('');
  }, [dish]);

  // Handle choice toggling
  const handleToggleChoice = (groupId: string, type: 'single' | 'multiple', choiceId: string) => {
    setSelectedChoices((prev) => {
      const current = prev[groupId] || [];
      if (type === 'single') {
        return { ...prev, [groupId]: [choiceId] };
      } else {
        if (current.includes(choiceId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== choiceId) };
        } else {
          return { ...prev, [groupId]: [...current, choiceId] };
        }
      }
    });
  };

  // Build array of SelectedOptionSelection objects
  const getSelectedOptionsList = (): SelectedOptionSelection[] => {
    if (!dish.customOptions) return [];
    const result: SelectedOptionSelection[] = [];

    dish.customOptions.forEach((grp) => {
      const selectedIds = selectedChoices[grp.id] || [];
      grp.choices.forEach((choice) => {
        if (selectedIds.includes(choice.id)) {
          result.push({
            groupId: grp.id,
            groupTitle: grp.title,
            choiceId: choice.id,
            choiceName: choice.name,
            priceExtra: choice.priceExtra || 0,
          });
        }
      });
    });

    return result;
  };

  const selectedOptionsList = getSelectedOptionsList();
  const optionsTotalPriceExtra = selectedOptionsList.reduce((sum, opt) => sum + opt.priceExtra, 0);
  const finalUnitPrice = dish.price + optionsTotalPriceExtra;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-[#FAF6F0] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E5982A]/40 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image Header */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-t-2xl">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6F0] via-transparent to-black/30" />
          
          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-block bg-[#1C3A27] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md mb-2 shadow-sm">
              {dish.originBadge}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C3A27] leading-tight">
              {dish.name}
            </h2>
            {dish.spanishName && (
              <p className="text-xs text-[#6B5E54] italic">{dish.spanishName}</p>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Price & Badges Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5982A]/20 pb-4">
            <div>
              <span className="font-sans text-2xl font-bold text-[#C23B22]">
                ${finalUnitPrice.toFixed(2)} USD
              </span>
              {optionsTotalPriceExtra !== 0 && (
                <span className="text-xs text-gray-500 block">
                  Base: ${dish.price.toFixed(2)} + Extras: ${optionsTotalPriceExtra.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-medium">
              {dish.isVegetarian ? (
                <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-md">
                  🟢 Vegetarian
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-md">
                  🔴 Non-Vegetarian
                </span>
              )}

              {dish.isGlutenFree && (
                <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md">
                  🌾 Gluten-Free
                </span>
              )}

              {dish.spiceLevel > 0 && (
                <span className="bg-orange-100 text-orange-900 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#C23B22]" />
                  <span>Ají Scale {dish.spiceLevel}/3</span>
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-serif font-bold text-[#1C3A27] text-base mb-1">
              Culinary Story & Prep
            </h4>
            <p className="text-sm text-[#2B231D]/80 leading-relaxed font-sans">
              {dish.description}
            </p>
          </div>

          {/* CUSTOM SPECIFICATIONS / OPTIONS GROUPS */}
          {dish.customOptions && dish.customOptions.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-[#E5982A]/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C3A27]">
                <Settings2 className="w-4 h-4 text-[#E5982A]" />
                <span>Customize Dish Specifications</span>
              </div>

              {dish.customOptions.map((group) => {
                const groupSelected = selectedChoices[group.id] || [];

                return (
                  <div key={group.id} className="bg-white p-4 rounded-xl border border-[#E5982A]/30 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-[#1C3A27]">
                        {group.title}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">
                        {group.type === 'single' ? 'Select 1' : 'Optional Add-ons'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.choices.map((choice) => {
                        const isChecked = groupSelected.includes(choice.id);

                        return (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => handleToggleChoice(group.id, group.type, choice.id)}
                            className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                              isChecked
                                ? 'bg-[#1C3A27] text-white border-[#1C3A27] font-semibold'
                                : 'bg-[#FAF6F0] text-[#2B231D] border-gray-200 hover:border-[#E5982A]'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                isChecked ? 'border-white bg-[#E5982A]' : 'border-gray-400'
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                              </span>
                              <span>{choice.name}</span>
                            </span>

                            {choice.priceExtra !== 0 && (
                              <span className={`font-bold ml-2 ${isChecked ? 'text-[#E5982A]' : 'text-[#C23B22]'}`}>
                                {choice.priceExtra > 0 ? `+$${choice.priceExtra.toFixed(2)}` : `-$${Math.abs(choice.priceExtra).toFixed(2)}`}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CUSTOM FOOD SPECIFICATION REQUEST BY CUSTOMER */}
          <div className="bg-[#FFFDF9] rounded-xl border border-[#E5982A]/30 p-4 space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#1C3A27]">
              <Edit3 className="w-3.5 h-3.5 text-[#C23B22]" />
              <span>Specific Food Preparation Notes / Custom Suggestions</span>
            </label>
            <p className="text-[11px] text-gray-500">
              e.g., "No cilantro", "Sauce on the side", "Allergy: shellfish", "Make rice extra toasted"
            </p>
            <textarea
              rows={2}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Type your exact preparation instructions here..."
              className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] text-xs text-[#2B231D] border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#C23B22]"
            />
          </div>

          {/* TWO-COLUMN INGREDIENT & FLAVOR BRIDGE BREAKDOWN */}
          <div className="bg-[#FFFDF9] rounded-xl border border-[#E5982A]/30 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C23B22] border-b border-gray-100 pb-2">
              <Sparkles className="w-4 h-4 text-[#E5982A]" />
              <span>2-Column Flavor Bridge Breakdown</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              
              {/* Left Column: Ecuadorian Component */}
              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-amber-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🇪🇨</span>
                  <h5 className="font-serif font-bold text-sm text-[#1C3A27]">
                    Ecuadorian Component
                  </h5>
                </div>
                <p className="text-xs font-semibold text-[#C23B22] mb-3">
                  {dish.flavorBridge.ecuadorianComponent}
                </p>
                
                <span className="text-[10px] uppercase font-bold text-[#6B5E54] block mb-1">
                  Native Ingredients Used:
                </span>
                <ul className="space-y-1 text-xs text-[#2B231D]">
                  {dish.ecuadorianIngredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C23B22]" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Indian Technique & Spice */}
              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#1C3A27]/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🇮🇳</span>
                  <h5 className="font-serif font-bold text-sm text-[#1C3A27]">
                    Indian Technique & Spice
                  </h5>
                </div>
                <p className="text-xs font-semibold text-[#1C3A27] mb-3">
                  {dish.flavorBridge.indianTechnique}
                </p>

                <span className="text-[10px] uppercase font-bold text-[#6B5E54] block mb-1">
                  Heritage Spices Used:
                </span>
                <ul className="space-y-1 text-xs text-[#2B231D]">
                  {dish.indianSpices.map((spice, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5982A]" />
                      <span>{spice}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Modal Footer Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-[#2B231D] hover:bg-gray-100 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              disabled={!dish.isAvailable}
              onClick={() => {
                onAddToCart(dish, selectedOptionsList, customerNote);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-[#C23B22] hover:bg-[#A52F1A] text-white text-xs font-bold flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Cart (${finalUnitPrice.toFixed(2)})</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
