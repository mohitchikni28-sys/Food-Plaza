/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DEFAULT_CATEGORIES,
  DEFAULT_GALLERY,
  DEFAULT_MENU_ITEMS,
  DEFAULT_OFFERS,
  DEFAULT_RECENT_ORDERS,
  DEFAULT_RESTAURANT_INFO,
} from '../data/defaultData';
import { Category, GalleryItem, MenuItem, Offer, OrderRecord, RestaurantInfo } from '../types/restaurant';

const STORAGE_KEYS = {
  MENU: 'neelam_menu_items_v1',
  CATEGORIES: 'neelam_categories_v1',
  OFFERS: 'neelam_offers_v1',
  GALLERY: 'neelam_gallery_v1',
  INFO: 'neelam_restaurant_info_v1',
  ORDERS: 'neelam_orders_v1',
  ADMIN_AUTH: 'neelam_admin_authenticated_v1',
};

export const DATA_CHANGE_EVENT = 'neelam_data_changed';

export function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
  }
}

// Menu Items
export function getStoredMenu(): MenuItem[] {
  if (typeof window === 'undefined') return DEFAULT_MENU_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
      return DEFAULT_MENU_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read menu from localStorage', e);
    return DEFAULT_MENU_ITEMS;
  }
}

export function saveStoredMenu(items: MenuItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to save menu to localStorage', e);
  }
}

// Categories
export function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read categories from localStorage', e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to save categories to localStorage', e);
  }
}

// Offers
export function getStoredOffers(): Offer[] {
  if (typeof window === 'undefined') return DEFAULT_OFFERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(DEFAULT_OFFERS));
      return DEFAULT_OFFERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read offers from localStorage', e);
    return DEFAULT_OFFERS;
  }
}

export function saveStoredOffers(offers: Offer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to save offers to localStorage', e);
  }
}

// Gallery
export function getStoredGallery(): GalleryItem[] {
  if (typeof window === 'undefined') return DEFAULT_GALLERY;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
      return DEFAULT_GALLERY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read gallery from localStorage', e);
    return DEFAULT_GALLERY;
  }
}

export function saveStoredGallery(gallery: GalleryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to save gallery to localStorage', e);
  }
}

// Restaurant Info
export function getStoredRestaurantInfo(): RestaurantInfo {
  if (typeof window === 'undefined') return DEFAULT_RESTAURANT_INFO;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INFO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INFO, JSON.stringify(DEFAULT_RESTAURANT_INFO));
      return DEFAULT_RESTAURANT_INFO;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read restaurant info from localStorage', e);
    return DEFAULT_RESTAURANT_INFO;
  }
}

export function saveStoredRestaurantInfo(info: RestaurantInfo): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INFO, JSON.stringify(info));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to save restaurant info to localStorage', e);
  }
}

// Orders (for Real-time Sales Reporting & Analytics)
export function getStoredOrders(): OrderRecord[] {
  if (typeof window === 'undefined') return DEFAULT_RECENT_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_RECENT_ORDERS));
      return DEFAULT_RECENT_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read orders from localStorage', e);
    return DEFAULT_RECENT_ORDERS;
  }
}

export function logNewOrder(order: OrderRecord): void {
  try {
    const currentOrders = getStoredOrders();
    const updated = [order, ...currentOrders];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));

    // Also deduct stock count from inventory
    const currentMenu = getStoredMenu();
    let menuUpdated = false;
    const newMenu = currentMenu.map((item) => {
      const matched = order.items.find((oi) => oi.id === item.id);
      if (matched) {
        menuUpdated = true;
        const newStock = Math.max(0, item.stockCount - matched.quantity);
        return {
          ...item,
          stockCount: newStock,
          isAvailable: newStock > 0,
        };
      }
      return item;
    });

    if (menuUpdated) {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(newMenu));
    }

    notifyDataChanged();
  } catch (e) {
    console.error('Failed to log order to localStorage', e);
  }
}

export function updateOrderStatus(orderId: string, status: OrderRecord['status']): void {
  try {
    const orders = getStoredOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to update order status', e);
  }
}

export function clearOrderHistory(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to clear orders', e);
  }
}

// Reset everything to factory initial seed
export function resetAllDataToDefault(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(DEFAULT_OFFERS));
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
    localStorage.setItem(STORAGE_KEYS.INFO, JSON.stringify(DEFAULT_RESTAURANT_INFO));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_RECENT_ORDERS));
    notifyDataChanged();
  } catch (e) {
    console.error('Failed to reset all data', e);
  }
}
