/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Check, Clock, Flame, Info, X } from 'lucide-react';
import { Category, MenuItem, CartItem } from '../types/restaurant';
import { VegBadge } from './VegBadge';

interface MenuSectionProps {
  categories: Category[];
  items: MenuItem[];
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem, quantity?: number, instructions?: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  categories,
  items,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);
  const [modalSpecialNote, setModalSpecialNote] = useState('');

  // Cart quantity lookup helper
  const getItemCartQuantity = (itemId: string) => {
    const found = cartItems.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.hindiName && item.hindiName.includes(q)) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <section id="menu" className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#24211E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-[#B45309] mb-1.5">
              Pure Vegetarian Menu
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24211E] tracking-tight">
              Freshly Prepared Delicacies
            </h2>
            <p className="text-sm text-[#24211E]/70 mt-1 max-w-xl">
              All dishes cooked fresh on order with pure dairy and traditional spices. Suitable for railway passengers and dine-in.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#24211E]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thali, dosa, paneer..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#24211E]/15 rounded-lg text-sm text-[#24211E] placeholder:text-[#24211E]/40 focus:outline-none focus:ring-2 focus:ring-[#B45309]/30 focus:border-[#B45309]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#24211E]/40 hover:text-[#24211E]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Selector (Interactive segmented buttons with no-scrollbar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-[#24211E]/10 mb-8">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#B45309] text-white shadow-sm'
                : 'bg-white text-[#24211E]/80 hover:bg-[#F3EDE2] border border-[#24211E]/10'
            }`}
          >
            All Items ({items.length})
          </button>

          {categories.map((cat) => {
            const count = items.filter((it) => it.category === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#B45309] text-white shadow-sm'
                    : 'bg-white text-[#24211E]/80 hover:bg-[#F3EDE2] border border-[#24211E]/10'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-16 text-center bg-white rounded-xl border border-dashed border-[#24211E]/20 p-8">
            <p className="text-sm font-semibold text-[#24211E]">No food items found</p>
            <p className="text-xs text-[#24211E]/60 mt-1">
              Try adjusting your search query or select another category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-medium text-[#B45309] bg-[#FEF3C7] rounded-lg hover:bg-[#FDE68A]"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const qty = getItemCartQuantity(item.id);
            const isOutOfStock = !item.isAvailable || item.stockCount <= 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#24211E]/10 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                {/* Photo & Badge Area */}
                <div
                  className="relative aspect-[16/10] bg-[#EFE9DF] overflow-hidden cursor-pointer"
                  onClick={() => setActiveModalItem(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback gradient container if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Overlay for quick glance */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-xs flex items-center gap-1.5">
                    <VegBadge size="sm" />
                    {item.isFeatured && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B45309]">
                        Chef Special
                      </span>
                    )}
                  </div>

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Spice or Prep time hint */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                    {item.prepTimeMinutes && (
                      <span className="bg-black/70 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{item.prepTimeMinutes}m</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => setActiveModalItem(item)}
                        className="font-semibold text-base text-[#24211E] hover:text-[#B45309] transition-colors cursor-pointer leading-snug"
                      >
                        {item.name}
                      </h3>
                      <span className="font-semibold text-base text-[#24211E] tabular-nums shrink-0">
                        ₹{item.price}
                      </span>
                    </div>

                    {item.hindiName && (
                      <p className="text-xs text-[#24211E]/50 font-serif mt-0.5">
                        {item.hindiName}
                      </p>
                    )}

                    <p className="text-xs text-[#24211E]/70 line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Action Row */}
                  <div className="mt-4 pt-3 border-t border-[#24211E]/10 flex items-center justify-between">
                    <div className="text-[11px] text-[#24211E]/60">
                      {isOutOfStock ? (
                        <span className="text-red-600 font-medium">Currently unavailable</span>
                      ) : item.stockCount <= 5 ? (
                        <span className="text-amber-700 font-medium">Only {item.stockCount} left</span>
                      ) : (
                        <span>Available for train & dine-in</span>
                      )}
                    </div>

                    {/* Quantity or Add Button */}
                    <div>
                      {isOutOfStock ? (
                        <button
                          disabled
                          className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      ) : qty > 0 ? (
                        <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#B45309]/30 rounded-lg px-2 py-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, qty - 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#B45309] hover:bg-[#B45309]/10 rounded cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-[#24211E] tabular-nums min-w-[14px] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, qty + 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#B45309] hover:bg-[#B45309]/10 rounded cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddToCart(item)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] active:scale-95 rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Item Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#24211E]/10">
            <div className="relative aspect-[16/10] bg-[#EFE9DF]">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => {
                  setActiveModalItem(null);
                  setModalSpecialNote('');
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5">
                <VegBadge size="sm" showLabel />
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-xl font-bold text-[#24211E]">
                    {activeModalItem.name}
                  </h3>
                  {activeModalItem.hindiName && (
                    <p className="text-xs text-[#24211E]/50 font-serif">
                      {activeModalItem.hindiName}
                    </p>
                  )}
                </div>
                <div className="text-xl font-bold text-[#24211E] tabular-nums">
                  ₹{activeModalItem.price}
                </div>
              </div>

              <p className="text-xs text-[#24211E]/80 leading-relaxed">
                {activeModalItem.description}
              </p>

              {/* Attributes */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#24211E]/70 py-2 border-y border-[#24211E]/10">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Prep time: ~{activeModalItem.prepTimeMinutes || 10} mins</span>
                </div>
                {activeModalItem.spiceLevel && (
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>Spice: {activeModalItem.spiceLevel}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Freshly Cooked</span>
                </div>
              </div>

              {/* Special Instructions note */}
              <div>
                <label className="block text-[11px] font-semibold text-[#24211E]/70 uppercase tracking-wide mb-1">
                  Special Cooking Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={modalSpecialNote}
                  onChange={(e) => setModalSpecialNote(e.target.value)}
                  placeholder="e.g., Less spicy, no onion-garlic, extra butter roti..."
                  className="w-full px-3 py-2 text-xs border border-[#24211E]/15 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>

              {/* Modal Add to Cart CTA */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalItem(null);
                    setModalSpecialNote('');
                  }}
                  className="px-4 py-2 text-xs font-medium text-[#24211E]/70 hover:text-[#24211E] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(activeModalItem, 1, modalSpecialNote);
                    setActiveModalItem(null);
                    setModalSpecialNote('');
                  }}
                  disabled={!activeModalItem.isAvailable || activeModalItem.stockCount <= 0}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] disabled:bg-gray-300 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart (₹{activeModalItem.price})</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
};
