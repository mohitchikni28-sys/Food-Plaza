/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Category,
  GalleryItem,
  MenuItem,
  Offer,
  OrderRecord,
  RestaurantInfo,
} from '../types/restaurant';
import {
  getStoredCategories,
  getStoredGallery,
  getStoredMenu,
  getStoredOffers,
  getStoredOrders,
  getStoredRestaurantInfo,
  saveStoredCategories,
  saveStoredGallery,
  saveStoredMenu,
  saveStoredOffers,
  saveStoredRestaurantInfo,
  logNewOrder,
  updateOrderStatus as updateLocalOrderStatus,
} from './storage';

const API_BASE = '/api';

// Helper for safe fetch
async function safeFetch<T>(
  endpoint: string,
  options?: RequestInit,
  fallback?: () => T
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[Backend Sync Notice] Falling back to local storage for ${endpoint}:`, err);
    if (fallback) {
      return fallback();
    }
    throw err;
  }
}

// ----------------------------------------------------
// RESTAURANT INFO API
// ----------------------------------------------------
export async function apiFetchRestaurantInfo(): Promise<RestaurantInfo> {
  return safeFetch<RestaurantInfo>('/info', { method: 'GET' }, getStoredRestaurantInfo);
}

export async function apiSaveRestaurantInfo(info: RestaurantInfo): Promise<RestaurantInfo> {
  saveStoredRestaurantInfo(info);
  return safeFetch<{ success: boolean; data: RestaurantInfo }>(
    '/info',
    {
      method: 'PUT',
      body: JSON.stringify(info),
    },
    () => ({ success: true, data: info })
  ).then((res) => res.data || info);
}

// ----------------------------------------------------
// CATEGORIES API
// ----------------------------------------------------
export async function apiFetchCategories(): Promise<Category[]> {
  return safeFetch<Category[]>('/categories', { method: 'GET' }, getStoredCategories);
}

export async function apiAddCategory(name: string): Promise<Category> {
  return safeFetch<Category>(
    '/categories',
    {
      method: 'POST',
      body: JSON.stringify({ name }),
    },
    () => {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const local: Category = {
        id: `cat-${Date.now()}`,
        name,
        slug,
        sortOrder: 99,
      };
      const cats = [...getStoredCategories(), local];
      saveStoredCategories(cats);
      return local;
    }
  );
}

export async function apiReorderCategories(categories: Category[]): Promise<void> {
  saveStoredCategories(categories);
  await safeFetch('/categories/reorder', {
    method: 'PUT',
    body: JSON.stringify({ categories }),
  }, () => {});
}

export async function apiDeleteCategory(id: string): Promise<void> {
  const cats = getStoredCategories().filter((c) => c.id !== id);
  saveStoredCategories(cats);
  await safeFetch(`/categories/${id}`, { method: 'DELETE' }, () => {});
}

// ----------------------------------------------------
// MENU API
// ----------------------------------------------------
export async function apiFetchMenu(): Promise<MenuItem[]> {
  return safeFetch<MenuItem[]>('/menu', { method: 'GET' }, getStoredMenu);
}

export async function apiCreateMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
  return safeFetch<MenuItem>(
    '/menu',
    {
      method: 'POST',
      body: JSON.stringify(item),
    },
    () => {
      const newItem: MenuItem = {
        id: `custom-${Date.now()}`,
        name: item.name || 'New Item',
        hindiName: item.hindiName || '',
        description: item.description || '',
        price: Number(item.price || 100),
        category: item.category || 'thali',
        imageUrl: item.imageUrl || '/src/assets/images/food_deluxe_thali_1790167666117.jpg',
        isAvailable: item.isAvailable ?? true,
        isFeatured: item.isFeatured ?? false,
        spiceLevel: item.spiceLevel || 'Medium',
        stockCount: Number(item.stockCount ?? 50),
        minThreshold: Number(item.minThreshold ?? 10),
        prepTimeMinutes: Number(item.prepTimeMinutes ?? 10),
      };
      saveStoredMenu([newItem, ...getStoredMenu()]);
      return newItem;
    }
  );
}

export async function apiUpdateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
  return safeFetch<MenuItem>(
    `/menu/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
    () => {
      const updated = getStoredMenu().map((m) => (m.id === id ? { ...m, ...updates } : m));
      saveStoredMenu(updated);
      return updated.find((m) => m.id === id)!;
    }
  );
}

export async function apiDeleteMenuItem(id: string): Promise<void> {
  const updated = getStoredMenu().filter((m) => m.id !== id);
  saveStoredMenu(updated);
  await safeFetch(`/menu/${id}`, { method: 'DELETE' }, () => {});
}

// ----------------------------------------------------
// OFFERS API
// ----------------------------------------------------
export async function apiFetchOffers(): Promise<Offer[]> {
  return safeFetch<Offer[]>('/offers', { method: 'GET' }, getStoredOffers);
}

export async function apiCreateOffer(offer: Partial<Offer>): Promise<Offer> {
  return safeFetch<Offer>(
    '/offers',
    {
      method: 'POST',
      body: JSON.stringify(offer),
    },
    () => {
      const newOff: Offer = {
        id: `off-${Date.now()}`,
        title: offer.title || '',
        code: (offer.code || '').toUpperCase(),
        description: offer.description || '',
        discountPercent: offer.discountPercent,
        discountAmount: offer.discountAmount,
        minOrderValue: offer.minOrderValue || 0,
        badgeText: offer.badgeText || 'Special Offer',
        isActive: offer.isActive ?? true,
      };
      saveStoredOffers([newOff, ...getStoredOffers()]);
      return newOff;
    }
  );
}

export async function apiDeleteOffer(id: string): Promise<void> {
  const updated = getStoredOffers().filter((o) => o.id !== id);
  saveStoredOffers(updated);
  await safeFetch(`/offers/${id}`, { method: 'DELETE' }, () => {});
}

// ----------------------------------------------------
// GALLERY API
// ----------------------------------------------------
export async function apiFetchGallery(): Promise<GalleryItem[]> {
  return safeFetch<GalleryItem[]>('/gallery', { method: 'GET' }, getStoredGallery);
}

export async function apiCreateGalleryItem(g: Partial<GalleryItem>): Promise<GalleryItem> {
  return safeFetch<GalleryItem>(
    '/gallery',
    {
      method: 'POST',
      body: JSON.stringify(g),
    },
    () => {
      const newG: GalleryItem = {
        id: `gal-${Date.now()}`,
        title: g.title || '',
        category: g.category || 'Food',
        imageUrl: g.imageUrl || '',
        caption: g.caption || '',
      };
      saveStoredGallery([newG, ...getStoredGallery()]);
      return newG;
    }
  );
}

export async function apiDeleteGalleryItem(id: string): Promise<void> {
  const updated = getStoredGallery().filter((g) => g.id !== id);
  saveStoredGallery(updated);
  await safeFetch(`/gallery/${id}`, { method: 'DELETE' }, () => {});
}

// ----------------------------------------------------
// ORDERS & SALES REPORTING API
// ----------------------------------------------------
export async function apiFetchOrders(): Promise<OrderRecord[]> {
  return safeFetch<OrderRecord[]>('/orders', { method: 'GET' }, getStoredOrders);
}

export async function apiPostOrder(orderPayload: Partial<OrderRecord>): Promise<OrderRecord> {
  // Sync locally first
  const localOrder: OrderRecord = {
    id: orderPayload.id || `ORD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    customerName: orderPayload.customerName || 'Guest',
    customerPhone: orderPayload.customerPhone || '',
    orderType: orderPayload.orderType || 'station_pickup',
    trainDetails: orderPayload.trainDetails,
    deliveryAddress: orderPayload.deliveryAddress,
    items: orderPayload.items || [],
    totalAmount: orderPayload.totalAmount || 0,
    status: 'Pending',
  };
  logNewOrder(localOrder);

  return safeFetch<{ success: boolean; order: OrderRecord }>(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify(localOrder),
    },
    () => ({ success: true, order: localOrder })
  ).then((res) => res.order);
}

export async function apiUpdateOrderStatus(
  orderId: string,
  status: OrderRecord['status']
): Promise<void> {
  updateLocalOrderStatus(orderId, status);
  await safeFetch(
    `/orders/${orderId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    () => {}
  );
}

export async function apiClearAllOrders(): Promise<void> {
  await safeFetch('/orders', { method: 'DELETE' }, () => {});
}

// ----------------------------------------------------
// INVENTORY UPDATE API
// ----------------------------------------------------
export async function apiUpdateInventoryStock(
  itemId: string,
  stockCount: number
): Promise<void> {
  await safeFetch(
    `/inventory/${itemId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ stockCount }),
    },
    () => {}
  );
}

// ----------------------------------------------------
// AUTHENTICATION API
// ----------------------------------------------------
export async function apiLoginAdmin(password: string): Promise<{ success: boolean; token?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return await res.json();
  } catch {
    // Fallback if backend unreachable
    if (password === 'neelam123') {
      return { success: true, token: 'local_demo_token' };
    }
    return { success: false, message: 'Invalid password' };
  }
}
