/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  Train,
  Store,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CartItem, OrderType, RestaurantInfo, Offer } from '../types/restaurant';
import { dispatchWhatsAppOrder } from '../utils/whatsapp';
import { apiPostOrder } from '../utils/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  offers: Offer[];
  restaurantInfo: RestaurantInfo;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  offers,
  restaurantInfo,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('train_delivery');
  
  // Train Details
  const [trainNameOrNo, setTrainNameOrNo] = useState('');
  const [coach, setCoach] = useState('');
  const [seatBerth, setSeatBerth] = useState('');
  const [pnr, setPnr] = useState('');

  // Local delivery address
  const [localAddress, setLocalAddress] = useState('');

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [promoError, setPromoError] = useState('');

  // Post-order success feedback
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  // Calculation math
  const itemsSubtotal = cartItems.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0
  );

  let discountAmount = 0;
  if (appliedOffer && appliedOffer.isActive) {
    if (itemsSubtotal >= appliedOffer.minOrderValue) {
      if (appliedOffer.discountPercent) {
        discountAmount = Math.round((itemsSubtotal * appliedOffer.discountPercent) / 100);
      } else if (appliedOffer.discountAmount) {
        discountAmount = appliedOffer.discountAmount;
      }
    }
  }

  const packagingCharge = 0; // Complimentary packaging for rail passengers
  const totalAmount = Math.max(0, itemsSubtotal - discountAmount + packagingCharge);

  const handleApplyPromo = () => {
    setPromoError('');
    const found = offers.find(
      (o) => o.code.toUpperCase() === promoCodeInput.trim().toUpperCase() && o.isActive
    );
    if (!found) {
      setPromoError('Invalid coupon code or expired offer.');
      setAppliedOffer(null);
      return;
    }
    if (itemsSubtotal < found.minOrderValue) {
      setPromoError(`Minimum order amount of ₹${found.minOrderValue} required for this coupon.`);
      setAppliedOffer(null);
      return;
    }
    setAppliedOffer(found);
  };

  const handleRemovePromo = () => {
    setAppliedOffer(null);
    setPromoCodeInput('');
    setPromoError('');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (cartItems.length === 0) {
      setFormError('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (orderType === 'train_delivery' && !trainNameOrNo.trim()) {
      setFormError('Please provide your Train Name or Train Number for platform delivery.');
      return;
    }

    if (orderType === 'local_delivery' && !localAddress.trim()) {
      setFormError('Please enter your local delivery address in Jaipur.');
      return;
    }

    // Dispatch WhatsApp order
    const result = dispatchWhatsAppOrder(
      cartItems,
      totalAmount,
      {
        customerName,
        customerPhone,
        orderType,
        trainDetails: {
          trainNumberOrName: trainNameOrNo,
          coach,
          seatBerth,
          pnr,
        },
        deliveryAddress: localAddress,
        appliedDiscount: discountAmount,
        promoCode: appliedOffer?.code,
      },
      restaurantInfo.whatsappNumber
    );

    // Asynchronously log to server database & update server inventory
    apiPostOrder({
      id: result.orderId,
      customerName,
      customerPhone,
      orderType,
      trainDetails: {
        trainNumberOrName: trainNameOrNo,
        coach,
        seatBerth,
        pnr,
      },
      deliveryAddress: localAddress,
      items: cartItems.map((ci) => ({
        id: ci.item.id,
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
        subtotal: ci.item.price * ci.quantity,
      })),
      totalAmount,
    }).catch((err) => {
      console.warn('Background order sync to backend note:', err);
    });

    // Open WhatsApp in new tab / app
    window.open(result.whatsappUrl, '_blank');

    // Show order success state
    setPlacedOrderId(result.orderId);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#24211E]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="font-heading text-lg font-bold text-[#24211E]">
              Your Food Cart
            </h2>
            <span className="text-xs bg-[#FEF3C7] text-[#B45309] font-semibold px-2 py-0.5 rounded-full tabular-nums">
              {cartItems.reduce((acc, c) => acc + c.quantity, 0)} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && !placedOrderId && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded cursor-pointer"
                title="Clear all cart items"
              >
                Clear Cart
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#24211E]/60 hover:text-[#24211E] rounded-md transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Post-order Placed Success State */}
        {placedOrderId ? (
          <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-[#24211E]">
              WhatsApp Order Prepared!
            </h3>
            <p className="text-xs text-[#24211E]/75 max-w-sm leading-relaxed">
              Order Reference <strong className="font-mono text-[#B45309]">{placedOrderId}</strong> has been formatted and opened in your WhatsApp.
            </p>
            <div className="p-4 bg-white rounded-xl border border-[#24211E]/10 text-xs text-left w-full space-y-1.5">
              <div className="font-semibold text-[#24211E]">Next Steps:</div>
              <p className="text-[#24211E]/70">1. Press <strong>Send</strong> in WhatsApp to transmit order details directly to our Platform 1 kitchen desk.</p>
              <p className="text-[#24211E]/70">2. Our manager will reply with your preparation time and runner delivery contact.</p>
              <p className="text-[#24211E]/70">3. Pay via Cash or UPI upon receiving hot, sealed meals.</p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  onClearCart();
                  setPlacedOrderId(null);
                  onClose();
                }}
                className="w-full py-2.5 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg cursor-pointer"
              >
                Done / Back to Menu
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EFE9DF] text-[#24211E]/40 flex items-center justify-center">
              <Train className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#24211E]">
              Your Cart is Empty
            </h3>
            <p className="text-xs text-[#24211E]/60 max-w-xs">
              Explore our pure vegetarian thalis, paneer curries, crispy dosas, and travel snacks.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg cursor-pointer"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          /* Cart Items & Checkout Form */
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6">
            
            {/* Items list */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#24211E]/50">
                Order Items ({cartItems.length})
              </div>

              {cartItems.map((ci) => (
                <div
                  key={ci.item.id}
                  className="p-3 bg-white rounded-xl border border-[#24211E]/10 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs text-[#24211E] truncate">
                      {ci.item.name}
                    </h4>
                    <div className="text-[11px] text-[#24211E]/60 tabular-nums">
                      ₹{ci.item.price} each
                    </div>
                    {ci.specialInstructions && (
                      <p className="text-[10px] text-[#B45309] italic truncate">
                        Note: {ci.specialInstructions}
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#24211E]/15 rounded-lg px-2 py-1">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(ci.item.id, ci.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center text-[#24211E] hover:text-[#B45309] cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#24211E] tabular-nums min-w-[14px] text-center">
                      {ci.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(ci.item.id, ci.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center text-[#24211E] hover:text-[#B45309] cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal and Remove */}
                  <div className="text-right shrink-0">
                    <div className="font-bold text-xs text-[#24211E] tabular-nums">
                      ₹{ci.item.price * ci.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(ci.item.id)}
                      className="text-[11px] text-red-600 hover:text-red-800 p-0.5 mt-0.5 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Box */}
            <div className="p-3 bg-white rounded-xl border border-[#24211E]/10 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#24211E]">
                <Tag className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Coupon or Passenger Code</span>
              </div>

              {appliedOffer ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-xs">
                  <div>
                    <span className="font-bold text-emerald-800 uppercase">{appliedOffer.code}</span>
                    <p className="text-[11px] text-emerald-700">
                      Savings: -₹{discountAmount}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Enter code (e.g. TRAIN15)"
                    className="flex-1 px-3 py-1.5 text-xs uppercase bg-[#FAF7F2] border border-[#24211E]/15 rounded-lg focus:outline-none focus:border-[#B45309]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3 py-1.5 text-xs font-semibold text-[#78350F] bg-[#FDE68A]/70 hover:bg-[#FDE68A] rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-[11px] text-red-600">{promoError}</p>
              )}
            </div>

            {/* Delivery / Order Type Selector */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#24211E]/50">
                Order Type & Delivery Destination
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('train_delivery')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    orderType === 'train_delivery'
                      ? 'bg-[#FEF3C7] border-[#B45309] text-[#78350F] shadow-xs'
                      : 'bg-white border-[#24211E]/10 text-[#24211E]/70 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <Train className="w-4 h-4" />
                  <span className="text-[11px] font-semibold leading-tight">Train Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('station_pickup')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    orderType === 'station_pickup'
                      ? 'bg-[#FEF3C7] border-[#B45309] text-[#78350F] shadow-xs'
                      : 'bg-white border-[#24211E]/10 text-[#24211E]/70 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span className="text-[11px] font-semibold leading-tight">Platform 1 Pickup</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('local_delivery')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    orderType === 'local_delivery'
                      ? 'bg-[#FEF3C7] border-[#B45309] text-[#78350F] shadow-xs'
                      : 'bg-white border-[#24211E]/10 text-[#24211E]/70 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-[11px] font-semibold leading-tight">Jaipur Local</span>
                </button>
              </div>

              {/* Dynamic details based on order type */}
              {orderType === 'train_delivery' && (
                <div className="p-3 bg-white rounded-xl border border-[#24211E]/10 space-y-2.5">
                  <p className="text-[11px] font-semibold text-[#B45309]">
                    Train Passenger Details (For Berth Delivery)
                  </p>
                  <div>
                    <input
                      type="text"
                      value={trainNameOrNo}
                      onChange={(e) => setTrainNameOrNo(e.target.value)}
                      placeholder="Train Name or Number (e.g., 12956 Superfast)*"
                      className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#24211E]/15 rounded-lg focus:outline-none focus:border-[#B45309]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={coach}
                      onChange={(e) => setCoach(e.target.value)}
                      placeholder="Coach (e.g., B4 or S2)"
                      className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#24211E]/15 rounded-lg focus:outline-none focus:border-[#B45309]"
                    />
                    <input
                      type="text"
                      value={seatBerth}
                      onChange={(e) => setSeatBerth(e.target.value)}
                      placeholder="Seat/Berth No (e.g., 32)"
                      className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#24211E]/15 rounded-lg focus:outline-none focus:border-[#B45309]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={pnr}
                      onChange={(e) => setPnr(e.target.value)}
                      placeholder="PNR (Optional)"
                      className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#24211E]/15 rounded-lg focus:outline-none focus:border-[#B45309]"
                    />
                  </div>
                </div>
              )}

              {orderType === 'station_pickup' && (
                <div className="p-3 bg-white rounded-xl border border-[#24211E]/10 text-xs text-[#24211E]/80">
                  <p className="font-semibold text-[#24211E]">Pickup Location:</p>
                  <p className="text-[11px] text-[#24211E]/70 mt-0.5">
                    Platform Number-1, IRCTC Food Plaza counter (Opposite Coach B1-B4), Jaipur Junction.
                  </p>
                </div>
              )}

              {orderType === 'local_delivery' && (
                <div className="p-3 bg-white rounded-xl border border-[#24211E]/10 space-y-2">
                  <label className="block text-[11px] font-semibold text-[#24211E]">
                    Delivery Address in Jaipur*
                  </label>
                  <textarea
                    rows={2}
                    value={localAddress}
                    onChange={(e) => setLocalAddress(e.target.value)}
                    placeholder="House/Hotel/Office address, Street name, Landmark..."
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#24211E]/15 rounded-lg focus:outline-none focus:border-[#B45309]"
                    required
                  />
                </div>
              )}
            </div>

            {/* Customer Contact Information */}
            <div className="p-3 bg-white rounded-xl border border-[#24211E]/10 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#24211E]/50">
                Customer Information
              </div>

              <div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Full Name*"
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#24211E]/15 rounded-lg focus:outline-none focus:border-[#B45309]"
                  required
                />
              </div>

              <div>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="10-digit WhatsApp Mobile Number*"
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#24211E]/15 rounded-lg focus:outline-none focus:border-[#B45309]"
                  required
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-white rounded-xl border border-[#24211E]/10 space-y-2 text-xs">
              <div className="flex justify-between text-[#24211E]/70">
                <span>Items Subtotal</span>
                <span className="tabular-nums">₹{itemsSubtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({appliedOffer?.code})</span>
                  <span className="tabular-nums">-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-[#24211E]/70">
                <span>Platform Packaging</span>
                <span className="text-emerald-700 font-semibold">FREE (Complimentary)</span>
              </div>

              <div className="pt-2 border-t border-[#24211E]/10 flex justify-between font-bold text-sm text-[#24211E]">
                <span>Total Amount to Pay</span>
                <span className="tabular-nums text-base text-[#B45309]">₹{totalAmount}</span>
              </div>
            </div>

            {/* Validation Error Banner */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="text-[11px] text-[#24211E]/60 text-center">
              Payment mode: Cash on Delivery or UPI Scan upon receiving food.
            </div>

          </div>
        )}

        {/* Drawer Footer CTA */}
        {cartItems.length > 0 && !placedOrderId && (
          <div className="p-4 bg-white border-t border-[#24211E]/10">
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="w-full py-3 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Place Order on WhatsApp (₹{totalAmount})</span>
            </button>
            <p className="text-[10px] text-center text-[#24211E]/50 mt-1.5">
              Direct connection to Neelam Food Plaza WhatsApp desk at {restaurantInfo.whatsappNumber}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
