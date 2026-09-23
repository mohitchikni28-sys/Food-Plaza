/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Navigation, Phone, MessageSquare, Train, Compass } from 'lucide-react';
import { RestaurantInfo } from '../types/restaurant';

interface LocationSectionProps {
  restaurantInfo: RestaurantInfo;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ restaurantInfo }) => {
  const cleanPhone = restaurantInfo.phone.replace(/\s+/g, '');
  const cleanWhatsapp = restaurantInfo.whatsappNumber.replace(/[^\d]/g, '');

  return (
    <section id="location" className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#24211E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold tracking-wider uppercase text-[#B45309] mb-1.5">
            Railway Station Presence
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24211E] tracking-tight">
            Prime Location on Platform Number 1
          </h2>
          <p className="text-sm text-[#24211E]/75 mt-1">
            Conveniently situated inside Jaipur Junction for both passing trains and passengers boarding from the main station concourse.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Address & Detail Cards */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#24211E]/10 shadow-xs space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#24211E]">Complete Address</h3>
                  <p className="text-xs text-[#24211E]/80 mt-1 leading-relaxed font-normal">
                    {restaurantInfo.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-4 border-t border-[#24211E]/10">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#24211E]">Platform Landmarks</h3>
                  <p className="text-xs text-[#24211E]/80 mt-1 leading-relaxed">
                    {restaurantInfo.platformDetail}
                  </p>
                  <p className="text-[11px] text-[#B45309] font-medium mt-1">
                    Direct access from Platform 1 escalator and main station porch.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap gap-3">
                <a
                  href={restaurantInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps Directions</span>
                </a>

                <a
                  href={`tel:${cleanPhone}`}
                  className="px-4 py-2.5 text-xs font-semibold text-[#78350F] bg-[#FDE68A]/60 hover:bg-[#FDE68A] border border-[#F59E0B]/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {restaurantInfo.displayPhone}</span>
                </a>

                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>

            {/* Travel notice banner */}
            <div className="bg-[#FEF3C7]/40 border border-[#F59E0B]/30 rounded-xl p-4 flex items-center gap-3">
              <Compass className="w-5 h-5 text-[#B45309] shrink-0" />
              <p className="text-xs text-[#78350F]">
                <strong className="font-semibold">Traveling via Jaipur?</strong> Place your order 20–30 minutes before your train pulls into Platform 1 for seamless coach delivery.
              </p>
            </div>

          </div>

          {/* Visual Platform Map Graphic */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#24211E]/10 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#24211E] uppercase tracking-wider">
                  Station Concourse Map Guide
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                  Platform 1 Active
                </span>
              </div>

              {/* Station layout diagram */}
              <div className="relative rounded-xl bg-[#FAF7F2] border border-[#24211E]/10 p-6 space-y-4">
                <div className="text-center pb-2 border-b border-[#24211E]/10">
                  <span className="text-xs font-semibold text-[#24211E]/60 uppercase tracking-widest">
                    Main Station Entrance / Porch (29 Station Rd)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-white border border-[#24211E]/10 rounded-lg text-[#24211E]/70">
                    Ticket Counters
                  </div>
                  <div className="p-2.5 bg-[#FEF3C7] border-2 border-[#B45309] rounded-lg font-bold text-[#78350F] shadow-xs scale-105">
                    ★ Neelam Food Plaza (IRCTC)
                  </div>
                  <div className="p-2.5 bg-white border border-[#24211E]/10 rounded-lg text-[#24211E]/70">
                    VIP Waiting Hall
                  </div>
                </div>

                <div className="p-3 bg-amber-900/10 border border-amber-900/20 rounded-lg text-center font-mono text-xs font-bold text-amber-950">
                  ═════════ TRACK 1 · PLATFORM 1 ═════════
                </div>

                <div className="grid grid-cols-4 gap-1 text-[11px] text-[#24211E]/60 text-center font-mono">
                  <div className="bg-white/60 p-1 rounded">Coach S1-S5</div>
                  <div className="bg-white/60 p-1 rounded font-bold text-[#B45309]">B1-B4 (Express Gate)</div>
                  <div className="bg-white/60 p-1 rounded">A1-A2</div>
                  <div className="bg-white/60 p-1 rounded">General</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#24211E]/10 flex items-center justify-between text-xs text-[#24211E]/70">
              <span>Station Code: <strong>JP (Jaipur Junction)</strong></span>
              <span>Division: <strong>North Western Railway</strong></span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
