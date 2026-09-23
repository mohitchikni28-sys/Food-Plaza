/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, Clock, MessageSquare, MapPin, Truck } from 'lucide-react';
import { RestaurantInfo } from '../types/restaurant';

interface ContactSectionProps {
  restaurantInfo: RestaurantInfo;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ restaurantInfo }) => {
  const cleanPhone = restaurantInfo.phone.replace(/\s+/g, '');
  const cleanWhatsapp = restaurantInfo.whatsappNumber.replace(/[^\d]/g, '');

  return (
    <section id="contact" className="py-16 sm:py-20 bg-white border-b border-[#24211E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold tracking-wider uppercase text-[#B45309] mb-1.5">
            Get in Touch
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24211E] tracking-tight">
            Order Desk & Passenger Support
          </h2>
          <p className="text-sm text-[#24211E]/75 mt-1">
            Need catering for a group of train travelers, bulk orders, or custom dietary requests? Speak directly with our kitchen manager.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Phone */}
          <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#24211E]/10 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#24211E]">Phone Support</h3>
            <p className="text-xs text-[#24211E]/70">
              Direct line to our food counter at Platform 1.
            </p>
            <div className="pt-2">
              <a
                href={`tel:${cleanPhone}`}
                className="font-bold text-sm text-[#B45309] hover:underline"
              >
                {restaurantInfo.displayPhone}
              </a>
            </div>
          </div>

          {/* Timings */}
          <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#24211E]/10 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#24211E]">Operating Hours</h3>
            <p className="text-xs text-[#24211E]/70">
              Serving early morning travelers to late-night halts.
            </p>
            <div className="pt-2">
              <p className="font-bold text-xs text-[#24211E]">
                {restaurantInfo.openingHours}
              </p>
              <p className="text-[11px] text-red-700 mt-0.5">Closes at {restaurantInfo.closingTime}</p>
            </div>
          </div>

          {/* Train Delivery */}
          <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#24211E]/10 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#24211E]">Train Seat Delivery</h3>
            <p className="text-xs text-[#24211E]/70">
              Available for trains stopping at Jaipur Junction.
            </p>
            <div className="pt-2">
              <span className="inline-block text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Active On Platform 1
              </span>
            </div>
          </div>

          {/* WhatsApp Direct */}
          <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#24211E]/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-[#24211E]">WhatsApp Ordering</h3>
              <p className="text-xs text-[#24211E]/70">
                Instant order confirmation & live tracking of your delivery runner.
              </p>
            </div>
            <div className="pt-3">
              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
