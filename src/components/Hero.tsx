/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Utensils, Navigation, Clock, Star, MapPin } from 'lucide-react';
import { RestaurantInfo } from '../types/restaurant';
import { VegBadge } from './VegBadge';

interface HeroProps {
  restaurantInfo: RestaurantInfo;
  onViewMenu: () => void;
  onOrderNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  restaurantInfo,
  onViewMenu,
  onOrderNow,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] border-b border-[#24211E]/10 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Location & Purity Context */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#78350F] font-medium tracking-wide">
              <VegBadge size="md" showLabel />
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B45309]" />
                Platform-1, IRCTC Food Plaza
              </span>
              <span aria-hidden="true">·</span>
              <span>Jaipur Junction</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#24211E] leading-[1.15] text-balance">
              {restaurantInfo.tagline}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#24211E]/80 leading-relaxed max-w-2xl">
              Authentic North Indian curries, royal Rajasthani thalis, crispy dosas, and fresh travel snacks.
              Enjoy wholesome dining right on Platform 1 or get meals delivered hot directly to your train coach and berth.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onViewMenu}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[#B45309] hover:bg-[#92400E] active:scale-[0.98] rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                <span>View Menu</span>
              </button>

              <button
                type="button"
                onClick={onOrderNow}
                className="px-6 py-3.5 text-sm font-semibold text-[#78350F] bg-[#FDE68A]/60 hover:bg-[#FDE68A] border border-[#F59E0B]/40 active:scale-[0.98] rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
              >
                <span>Order Now</span>
              </button>

              <a
                href={restaurantInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 text-sm font-medium text-[#24211E]/80 hover:text-[#24211E] hover:bg-[#24211E]/5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <Navigation className="w-4 h-4 text-[#B45309]" />
                <span>Get Directions</span>
              </a>
            </div>

            {/* Verified Facts & Adjacency Proof */}
            <div className="pt-6 border-t border-[#24211E]/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-[#24211E]/75">
              <div>
                <div className="font-semibold text-sm text-[#24211E] flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="tabular-nums">{restaurantInfo.googleRating} / 5</span>
                </div>
                <div className="text-[11px] text-[#24211E]/60 mt-0.5">
                  Real Google Rating ({restaurantInfo.googleReviewCount} reviews)
                </div>
              </div>

              <div>
                <div className="font-semibold text-sm text-[#24211E]">
                  ₹{restaurantInfo.priceForTwo} for two
                </div>
                <div className="text-[11px] text-[#24211E]/60 mt-0.5">
                  Pocket-friendly pure veg
                </div>
              </div>

              <div>
                <div className="font-semibold text-sm text-[#24211E] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Till {restaurantInfo.closingTime}</span>
                </div>
                <div className="text-[11px] text-[#24211E]/60 mt-0.5">
                  Delivery to train berth
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#24211E]/10 bg-[#EFE9DF] aspect-[4/3] sm:aspect-[16/11]">
              <img
                src="/src/assets/images/hero_indian_veg_feast_1790167650276.jpg"
                alt="Pure vegetarian royal thali and North Indian curries at Neelam Food Plaza, Jaipur Railway Station"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold tracking-wide uppercase text-emerald-200">
                    Platform 1 Kitchen Open
                  </span>
                </div>
                <p className="text-sm font-medium text-white/95 text-balance">
                  Freshly cooked meals prepared in pure desi ghee and refined vegetable oils.
                </p>
              </div>
            </div>

            {/* Side accent card */}
            <div className="hidden sm:flex items-center gap-3 absolute -bottom-4 -left-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#24211E]/10 shadow-lg text-xs">
              <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#B45309] font-bold">
                P-1
              </div>
              <div>
                <p className="font-semibold text-[#24211E]">Platform 1 IRCTC Court</p>
                <p className="text-[#24211E]/60">Opposite Coach Position B1–B4</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
