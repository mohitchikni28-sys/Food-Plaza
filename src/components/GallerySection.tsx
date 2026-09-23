/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GalleryItem } from '../types/restaurant';
import { X, ZoomIn } from 'lucide-react';

interface GallerySectionProps {
  galleryItems: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ galleryItems }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  const categories = ['all', ...Array.from(new Set(galleryItems.map((g) => g.category)))];

  const filteredItems = galleryItems.filter((item) =>
    selectedCategory === 'all' ? true : item.category === selectedCategory
  );

  return (
    <section id="gallery" className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#24211E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-[#B45309] mb-1.5">
              Visual Glimpse
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24211E] tracking-tight">
              Food & Platform 1 Ambiance
            </h2>
            <p className="text-sm text-[#24211E]/70 mt-1 max-w-xl">
              Authentic presentations, fresh ingredients, and clean dining spaces at Jaipur Railway Station.
            </p>
          </div>

          {/* Category filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#B45309] text-white'
                    : 'bg-white text-[#24211E]/70 hover:bg-[#F3EDE2] border border-[#24211E]/10'
                }`}
              >
                {cat === 'all' ? 'All Photos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className="group relative rounded-xl overflow-hidden bg-[#EFE9DF] border border-[#24211E]/10 aspect-[4/3] cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                      {item.category}
                    </span>
                    <h3 className="font-semibold text-sm leading-snug">{item.title}</h3>
                    <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{item.caption}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] bg-black">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close image lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 bg-white flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-[#B45309] uppercase tracking-wider">
                  {activeImage.category}
                </span>
                <h3 className="font-heading text-lg font-bold text-[#24211E]">
                  {activeImage.title}
                </h3>
                <p className="text-xs text-[#24211E]/70 mt-1">{activeImage.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="px-4 py-2 text-xs font-semibold text-[#78350F] bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#24211E]/10 rounded-lg cursor-pointer shrink-0"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
