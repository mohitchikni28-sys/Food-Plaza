/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RestaurantInfo } from '../types/restaurant';
import { VegBadge } from './VegBadge';

interface FooterProps {
  restaurantInfo: RestaurantInfo;
}

export const Footer: React.FC<FooterProps> = ({ restaurantInfo }) => {
  return (
    <footer className="bg-[#24211E] text-white/80 pt-12 pb-24 lg:pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          
          {/* Brand info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-white tracking-tight">
                {restaurantInfo.name}
              </span>
              <VegBadge size="sm" />
            </div>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Authentic 100% Pure Vegetarian dining and train seat meal service, located inside the IRCTC Food Plaza at Platform 1, Jaipur Railway Station.
            </p>
            <div className="text-xs text-[#F59E0B] font-medium pt-1">
              Open Daily: {restaurantInfo.openingHours}
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li>
                <a href="#menu" className="hover:text-amber-300 transition-colors">
                  Menu & Pricing
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-amber-300 transition-colors">
                  Kitchen Standards & Hygiene
                </a>
              </li>
              <li>
                <a href="#offers" className="hover:text-amber-300 transition-colors">
                  Passenger Deals
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-amber-300 transition-colors">
                  Food Gallery
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-amber-300 transition-colors">
                  Platform 1 Map
                </a>
              </li>
            </ul>
          </div>

          {/* Station Location */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Location</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              {restaurantInfo.address}
            </p>
            <div className="pt-2 text-xs">
              <span className="text-white/50">Helpline / Order Desk: </span>
              <a href={`tel:${restaurantInfo.phone.replace(/\s+/g, '')}`} className="text-amber-400 font-semibold hover:underline">
                {restaurantInfo.displayPhone}
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-3">
          <p>© {new Date().getFullYear()} {restaurantInfo.name}. All rights reserved.</p>
          <p>Pure Vegetarian Restaurant · Jaipur Railway Station</p>
        </div>
      </div>
    </footer>
  );
};
