/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tag, Copy, Check } from 'lucide-react';
import { Offer } from '../types/restaurant';

interface OffersSectionProps {
  offers: Offer[];
  onApplyCode?: (code: string) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({ offers, onApplyCode }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeOffers = offers.filter((o) => o.isActive);

  if (activeOffers.length === 0) {
    return null;
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onApplyCode) {
      onApplyCode(code);
    }
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <section id="offers" className="py-16 sm:py-20 bg-white border-b border-[#24211E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-semibold tracking-wider uppercase text-[#B45309] mb-1.5">
            Special Value Deals
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24211E] tracking-tight">
            Exclusive Deals & Passenger Offers
          </h2>
          <p className="text-sm text-[#24211E]/70 mt-1">
            Apply these coupon codes at checkout or mention them in your WhatsApp order message.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeOffers.map((offer) => {
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer.id}
                className="relative rounded-xl border border-[#F59E0B]/30 bg-[#FAF7F2] p-6 flex flex-col justify-between overflow-hidden shadow-xs hover:border-[#B45309] transition-colors"
              >
                {/* Decorative border cutouts simulating coupon ticket */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border border-[#24211E]/10" />
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border border-[#24211E]/10" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-[#B45309] uppercase tracking-wider bg-[#FEF3C7] px-2.5 py-0.5 rounded">
                      {offer.badgeText}
                    </span>
                    <Tag className="w-4 h-4 text-[#B45309]" />
                  </div>

                  <h3 className="font-semibold text-lg text-[#24211E]">{offer.title}</h3>
                  <p className="text-xs text-[#24211E]/75 mt-2 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-[#24211E]/15 flex items-center justify-between">
                  <div className="bg-white border border-[#24211E]/15 px-3 py-1.5 rounded-md font-mono text-xs font-bold text-[#78350F] tracking-wider">
                    {offer.code}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(offer.code)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#78350F] bg-[#FDE68A]/60 hover:bg-[#FDE68A] rounded-md transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-emerald-800">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
