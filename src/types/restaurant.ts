/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategorySlug = 'thali' | 'north-indian' | 'snacks' | 'beverages' | 'south-indian' | 'desserts' | string;

export interface MenuItem {
  id: string;
  name: string;
  hindiName?: string;
  description: string;
  price: number;
  category: CategorySlug;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  spiceLevel?: 'Mild' | 'Medium' | 'Spicy';
  stockCount: number;
  minThreshold: number;
  prepTimeMinutes?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  sortOrder: number;
}

export interface Offer {
  id: string;
  title: string;
  code: string;
  description: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue: number;
  badgeText: string;
  isActive: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  type: string;
  googleRating: number;
  googleReviewCount: number;
  priceForTwo: number;
  address: string;
  platformDetail: string;
  phone: string;
  displayPhone: string;
  whatsappNumber: string;
  openingHours: string;
  closingTime: string;
  deliveryAvailable: boolean;
  cuisine: string;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  googleMapsUrl: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export type OrderType = 'train_delivery' | 'station_pickup' | 'local_delivery';

export interface OrderRecord {
  id: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  trainDetails?: {
    trainNumberOrName?: string;
    coach?: string;
    seatBerth?: string;
    pnr?: string;
  };
  deliveryAddress?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  totalAmount: number;
  status: 'Pending' | 'Preparing' | 'Delivered' | 'Cancelled';
}
