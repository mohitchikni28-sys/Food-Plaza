/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, MessageSquare, ShoppingBag } from 'lucide-react';
import { RestaurantInfo } from '../types/restaurant';

interface MobileBottomCTAProps {
  restaurantInfo: RestaurantInfo;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export const MobileBottomCTA: React.FC<MobileBottomCTAProps> = ({
  restaurantInfo,
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  const cleanPhone = restaurantInfo.phone.replace(/\s+/g, '');
  const cleanWhatsapp = restaurantInfo.whatsappNumber.replace(/[^\d]/g, '');

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#24211E]/10 px-3 py-2 shadow-lg max-h-[14vh]">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Call button */}
        <a
          href={`tel:${cleanPhone}`}
          className="flex-1 py-2 px-2.5 bg-white border border-[#24211E]/15 rounded-lg text-center flex items-center justify-center gap-1.5 text-xs font-semibold text-[#78350F] active:scale-95 transition-transform"
          aria-label="Call restaurant"
        >
          <Phone className="w-3.5 h-3.5 text-[#B45309]" />
          <span>Call</span>
        </a>

        {/* WhatsApp button */}
        <a
          href={`https://wa.me/${cleanWhatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800 active:scale-95 transition-transform"
          aria-label="Chat on WhatsApp"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp</span>
        </a>

        {/* Order / View Cart button */}
        <button
          type="button"
          onClick={onOpenCart}
          className="flex-1.5 py-2 px-3 bg-[#B45309] hover:bg-[#92400E] active:scale-95 text-white rounded-lg text-center flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer transition-transform"
          aria-label="View shopping cart"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>
            {cartCount > 0 ? `Cart (${cartCount} · ₹${cartTotal})` : 'Order Now'}
          </span>
        </button>
      </div>
    </div>
  );
};
