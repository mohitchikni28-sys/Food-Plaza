/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Train, Sparkles, ChefHat } from 'lucide-react';
import { RestaurantInfo } from '../types/restaurant';

interface AboutSectionProps {
  restaurantInfo: RestaurantInfo;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ restaurantInfo }) => {
  const highlights = [
    {
      icon: ShieldCheck,
      title: '100% Pure Vegetarian Kitchen',
      description: 'Separate sanitized cookware, fresh daily dairy, and no compromise on purity. Jain options without onion/garlic available upon request.',
    },
    {
      icon: Train,
      title: 'Direct Train Coach Delivery',
      description: 'Halting at Jaipur? Order in advance with your Train & Coach number, and our delivery runner hands you hot, sealed meals right at your window/berth.',
    },
    {
      icon: Sparkles,
      title: 'IRCTC Food Plaza Certified',
      description: 'Operated under strict hygiene and quality protocols at Platform No. 1, with air-cooled seating for passengers waiting between connections.',
    },
    {
      icon: ChefHat,
      title: 'Freshly Prepared, Never Stored',
      description: 'Tawa rotis puffed to order, curries prepared in authentic North Indian and Rajasthani traditions, served boiling hot within minutes.',
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-20 bg-white border-b border-[#24211E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-semibold tracking-wider uppercase text-[#B45309] mb-2">
            About Our Kitchen
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24211E] tracking-tight text-balance">
            {restaurantInfo.aboutTitle}
          </h2>
          <div className="mt-4 space-y-4 text-base text-[#24211E]/80 leading-relaxed">
            <p>{restaurantInfo.aboutParagraph1}</p>
            <p>{restaurantInfo.aboutParagraph2}</p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((h, idx) => {
            const Icon = h.icon;
            return (
              <div
                key={h.title}
                className="p-6 rounded-xl bg-[#FAF7F2] border border-[#24211E]/10 space-y-3 transition-colors hover:border-[#B45309]/30"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs text-[#24211E]/50 font-medium">0{idx + 1}</div>
                <h3 className="font-semibold text-base text-[#24211E]">{h.title}</h3>
                <p className="text-xs text-[#24211E]/75 leading-relaxed">{h.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
