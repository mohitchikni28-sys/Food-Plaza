/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CartItem,
  Category,
  GalleryItem,
  MenuItem,
  Offer,
  RestaurantInfo,
} from './types/restaurant';
import {
  DATA_CHANGE_EVENT,
  getStoredCategories,
  getStoredGallery,
  getStoredMenu,
  getStoredOffers,
  getStoredRestaurantInfo,
  saveStoredCategories,
  saveStoredGallery,
  saveStoredMenu,
  saveStoredOffers,
  saveStoredRestaurantInfo,
} from './utils/storage';
import {
  apiFetchCategories,
  apiFetchGallery,
  apiFetchMenu,
  apiFetchOffers,
  apiFetchRestaurantInfo,
} from './utils/api';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { MenuSection } from './components/MenuSection';
import { OffersSection } from './components/OffersSection';
import { GallerySection } from './components/GallerySection';
import { ReviewsSection } from './components/ReviewsSection';
import { LocationSection } from './components/LocationSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { MobileBottomCTA } from './components/MobileBottomCTA';
import { AdminModal } from './components/admin/AdminModal';

export default function App() {
  // Data State persisted via localStorage
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(getStoredRestaurantInfo);
  const [categories, setCategories] = useState<Category[]>(getStoredCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(getStoredMenu);
  const [offers, setOffers] = useState<Offer[]>(getStoredOffers);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(getStoredGallery);

  // Cart State (stored in session or memory)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('neelam_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI Drawer / Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync cart to sessionStorage for reload safety
  useEffect(() => {
    try {
      sessionStorage.setItem('neelam_cart_v1', JSON.stringify(cartItems));
    } catch {
      // silent
    }
  }, [cartItems]);

  // Synchronize state when admin makes changes in localStorage or backend API
  const reloadDataFromStorage = useCallback(() => {
    // 1. Immediate optimistic reload from local storage
    setRestaurantInfo(getStoredRestaurantInfo());
    setCategories(getStoredCategories());
    setMenuItems(getStoredMenu());
    setOffers(getStoredOffers());
    setGalleryItems(getStoredGallery());

    // 2. Asynchronous sync with full-stack backend
    Promise.all([
      apiFetchRestaurantInfo(),
      apiFetchCategories(),
      apiFetchMenu(),
      apiFetchOffers(),
      apiFetchGallery(),
    ])
      .then(([info, cats, menu, offs, gal]) => {
        setRestaurantInfo(info);
        setCategories(cats);
        setMenuItems(menu);
        setOffers(offs);
        setGalleryItems(gal);
        // also keep local storage synchronized
        saveStoredRestaurantInfo(info);
        saveStoredCategories(cats);
        saveStoredMenu(menu);
        saveStoredOffers(offs);
        saveStoredGallery(gal);
      })
      .catch((err) => {
        console.debug('Backend sync complete (running with local cache)', err);
      });
  }, []);

  useEffect(() => {
    // Initial backend fetch
    reloadDataFromStorage();
  }, [reloadDataFromStorage]);

  useEffect(() => {
    const handleDataChanged = () => {
      reloadDataFromStorage();
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChanged);
    window.addEventListener('storage', handleDataChanged);

    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChanged);
      window.removeEventListener('storage', handleDataChanged);
    };
  }, [reloadDataFromStorage]);

  // Cart Handlers
  const handleAddToCart = (item: MenuItem, quantity = 1, instructions = '') => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id
            ? {
                ...ci,
                quantity: ci.quantity + quantity,
                specialInstructions: instructions || ci.specialInstructions,
              }
            : ci
        );
      }
      return [...prev, { item, quantity, specialInstructions: instructions }];
    });
  };

  const handleUpdateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity: newQuantity } : ci))
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
  const cartTotal = cartItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);

  // Scroll utilities
  const scrollToMenu = () => {
    const el = document.getElementById('menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#24211E] selection:bg-[#B45309]/20 selection:text-[#78350F]">
      
      {/* Sticky Navigation Bar with Triple-Click Admin Trigger */}
      <Navbar
        restaurantInfo={restaurantInfo}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Website Sections */}
      <main className="flex-1">
        {/* 1. Hero */}
        <Hero
          restaurantInfo={restaurantInfo}
          onViewMenu={scrollToMenu}
          onOrderNow={() => {
            if (cartCount > 0) {
              setIsCartOpen(true);
            } else {
              scrollToMenu();
            }
          }}
        />

        {/* 2. About Kitchen & Standards */}
        <AboutSection restaurantInfo={restaurantInfo} />

        {/* 3. Dynamic Menu */}
        <MenuSection
          categories={categories}
          items={menuItems}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateCartQuantity}
        />

        {/* 4. Special Offers */}
        <OffersSection
          offers={offers}
          onApplyCode={() => {
            setIsCartOpen(true);
          }}
        />

        {/* 5. Food & Ambiance Gallery */}
        <GallerySection galleryItems={galleryItems} />

        {/* 6. Real Google Rating & Feedback */}
        <ReviewsSection restaurantInfo={restaurantInfo} />

        {/* 7. Platform 1 Location & Map Guide */}
        <LocationSection restaurantInfo={restaurantInfo} />

        {/* 8. Order Desk Contact & Hours */}
        <ContactSection restaurantInfo={restaurantInfo} />
      </main>

      {/* Footer (Strictly without any visible admin link) */}
      <Footer restaurantInfo={restaurantInfo} />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        offers={offers}
        restaurantInfo={restaurantInfo}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Sticky Mobile Bottom CTA Bar */}
      <MobileBottomCTA
        restaurantInfo={restaurantInfo}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Hidden Admin Panel (Accessible only via triple-click on logo + password) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        categories={categories}
        menuItems={menuItems}
        offers={offers}
        galleryItems={galleryItems}
        restaurantInfo={restaurantInfo}
        onRefreshData={reloadDataFromStorage}
      />

    </div>
  );
}
