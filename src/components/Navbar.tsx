/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Phone, ShoppingBag, Menu as MenuIcon, X } from 'lucide-react';
import { RestaurantInfo } from '../types/restaurant';

interface NavbarProps {
  restaurantInfo: RestaurantInfo;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  restaurantInfo,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hidden admin trigger: 3 taps/clicks on logo within 800ms
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      onOpenAdmin();
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 800);
  };

  const navLinks = [
    { label: 'Menu', href: '#menu' },
    { label: 'About', href: '#about' },
    { label: 'Offers', href: '#offers' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Location', href: '#location' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#24211E]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Zone 1: Single text element wordmark with triple-click hidden trigger */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleLogoClick}
              className="text-left group cursor-pointer focus:outline-none select-none"
              title="Neelam Food Plaza - Jaipur Railway Station"
              aria-label="Neelam Food Plaza home"
            >
              <span className="font-display font-bold text-xl sm:text-2xl text-[#24211E] tracking-tight group-hover:text-[#B45309] transition-colors whitespace-nowrap block">
                {restaurantInfo.name}
              </span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#24211E]/80">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#B45309] transition-colors whitespace-nowrap py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#B45309] after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${restaurantInfo.phone.replace(/\s+/g, '')}`}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#78350F] bg-[#FDE68A]/40 hover:bg-[#FDE68A]/70 border border-[#F59E0B]/30 rounded-lg transition-colors whitespace-nowrap"
              title="Call Neelam Food Plaza"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{restaurantInfo.displayPhone}</span>
            </a>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] active:scale-[0.98] rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
              aria-label={`View cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center bg-white text-[#92400E] font-bold text-[11px] px-1.5 py-0.2 rounded-full tabular-nums">
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="hidden md:inline text-white/90 text-xs font-normal tabular-nums pl-1 border-l border-white/20">
                  ₹{cartTotal}
                </span>
              )}
            </button>

            {/* Mobile menu hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#24211E] hover:text-[#B45309] rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#24211E]/10 bg-[#FAF7F2] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[#24211E] hover:bg-[#F3EDE2] rounded-md transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-[#24211E]/10">
            <a
              href={`tel:${restaurantInfo.phone.replace(/\s+/g, '')}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-[#78350F] bg-[#FDE68A]/40 rounded-lg"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call {restaurantInfo.displayPhone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
