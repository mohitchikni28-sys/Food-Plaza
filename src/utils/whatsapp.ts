/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem, OrderRecord, OrderType } from '../types/restaurant';
import { logNewOrder } from './storage';

export interface CheckoutPayload {
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
  appliedDiscount?: number;
  promoCode?: string;
}

/**
 * Builds the exact message according to user requirements:
 * 
 * NEW ORDER - NEELAM FOOD PLAZA
 * 
 * Customer: [Name]
 * Phone: [Phone]
 * 
 * Items:
 * [Item] x [Quantity] - ₹[Price]
 * 
 * Total: ₹[Total]
 * 
 * Order Type: [Delivery / Pickup]
 * Address: [Address]
 * 
 * Please confirm the order.
 */
export function generateWhatsAppMessage(
  cartItems: CartItem[],
  totalAmount: number,
  payload: CheckoutPayload
): string {
  const itemsText = cartItems
    .map((ci) => `${ci.item.name} x ${ci.quantity} - ₹${ci.item.price * ci.quantity}`)
    .join('\n');

  let orderTypeLabel = 'Pickup';
  let addressText = '';

  if (payload.orderType === 'train_delivery') {
    orderTypeLabel = 'Train Berth Delivery (Platform 1)';
    const trainInfo = [
      payload.trainDetails?.trainNumberOrName ? `Train: ${payload.trainDetails.trainNumberOrName}` : '',
      payload.trainDetails?.coach ? `Coach: ${payload.trainDetails.coach}` : '',
      payload.trainDetails?.seatBerth ? `Berth/Seat: ${payload.trainDetails.seatBerth}` : '',
      payload.trainDetails?.pnr ? `PNR: ${payload.trainDetails.pnr}` : '',
    ]
      .filter(Boolean)
      .join(' | ');
    addressText = trainInfo || 'Jaipur Railway Station Platform-1';
  } else if (payload.orderType === 'station_pickup') {
    orderTypeLabel = 'Pickup (Platform 1 Counter)';
    addressText = 'Counter Pickup at Platform No. 1, IRCTC Food Plaza, Jaipur Station';
  } else {
    orderTypeLabel = 'Delivery';
    addressText = payload.deliveryAddress || 'Jaipur local area';
  }

  const discountNote = payload.appliedDiscount && payload.appliedDiscount > 0
    ? `\n(Discount applied: -₹${payload.appliedDiscount}${payload.promoCode ? ` via code ${payload.promoCode}` : ''})`
    : '';

  return `NEW ORDER - NEELAM FOOD PLAZA

Customer: ${payload.customerName.trim()}
Phone: ${payload.customerPhone.trim()}

Items:
${itemsText}

Total: ₹${totalAmount}${discountNote}

Order Type: ${orderTypeLabel}
Address: ${addressText}

Please confirm the order.`;
}

/**
 * Handles sending WhatsApp order and logging into local sales system
 */
export function dispatchWhatsAppOrder(
  cartItems: CartItem[],
  totalAmount: number,
  payload: CheckoutPayload,
  restaurantPhone: string = '+91 81072 04520'
): { orderId: string; whatsappUrl: string } {
  const message = generateWhatsAppMessage(cartItems, totalAmount, payload);
  
  // Clean phone number for WhatsApp link (digits only, e.g. 918107204520)
  const cleanNumber = restaurantPhone.replace(/[^\d]/g, '');
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanNumber.length === 10 ? '91' + cleanNumber : cleanNumber}?text=${encodedText}`;

  // Generate unique local order ID
  const orderId = `ORD-${Date.now().toString().slice(-4)}`;

  // Create order log for frontend real-time sales reporting
  const orderRecord: OrderRecord = {
    id: orderId,
    timestamp: new Date().toISOString(),
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    orderType: payload.orderType,
    trainDetails: payload.trainDetails,
    deliveryAddress: payload.deliveryAddress,
    items: cartItems.map((ci) => ({
      id: ci.item.id,
      name: ci.item.name,
      price: ci.item.price,
      quantity: ci.quantity,
      subtotal: ci.item.price * ci.quantity,
    })),
    totalAmount,
    status: 'Pending',
  };

  logNewOrder(orderRecord);

  return { orderId, whatsappUrl };
}
