/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, ExternalLink, CheckCircle2 } from 'lucide-react';
import { RestaurantInfo } from '../types/restaurant';

interface ReviewsSectionProps {
  restaurantInfo: RestaurantInfo;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ restaurantInfo }) => {
  return (
    <section id="reviews" className="py-16 sm:py-20 bg-white border-b border-[#24211E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="text-xs font-semibold tracking-wider uppercase text-[#B45309]">
            Customer Feedback
          </div>
          
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24211E] tracking-tight">
            Transparent Guest Ratings
          </h2>
          
          <p className="text-sm text-[#24211E]/75 max-w-xl mx-auto">
            We believe in honest, real experiences from daily passengers, railway staff, and traveling families.
          </p>

          {/* Rating Display Card */}
          <div className="mt-8 p-8 rounded-2xl bg-[#FAF7F2] border border-[#24211E]/10 max-w-lg mx-auto shadow-xs text-center space-y-4">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#24211E]/10 rounded-full text-xs text-[#24211E]/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Google Business Profile</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="font-heading text-5xl font-bold text-[#24211E] tabular-nums">
                {restaurantInfo.googleRating}
              </span>
              <div className="text-left">
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(restaurantInfo.googleRating)
                          ? 'fill-[#F59E0B] text-[#F59E0B]'
                          : star - 0.5 <= restaurantInfo.googleRating
                          ? 'fill-[#F59E0B]/50 text-[#F59E0B]'
                          : 'text-[#24211E]/20'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-[#24211E]/70 font-medium mt-1">
                  Based on <span className="font-bold text-[#24211E] tabular-nums">{restaurantInfo.googleReviewCount}</span> real Google Reviews
                </div>
              </div>
            </div>

            <p className="text-xs text-[#24211E]/70 leading-relaxed border-t border-[#24211E]/10 pt-4">
              Passengers frequently note the quick service during tight train halts, generous thali portions, and piping hot North Indian flavours right on Platform 1.
            </p>

            <div className="pt-2">
              <a
                href={restaurantInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#78350F] bg-[#FDE68A]/60 hover:bg-[#FDE68A] border border-[#F59E0B]/40 rounded-lg transition-colors shadow-xs"
              >
                <span>View Google Reviews</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
