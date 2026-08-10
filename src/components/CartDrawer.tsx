import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, MapPin, Send, ShoppingBag, Sparkles, AlertCircle, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { CartItem, CustomerInfo, RestaurantConfig, PayphoneTransactionResult } from '../types';
import { PayphonePaymentModal } from './PayphonePaymentModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearCart: () => void;
  config: RestaurantConfig;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  config
}) => {
  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    orderType: 'delivery',
    address: '',
    locationLink: '',
    specialInstructions: ''
  });

  const [paymentGateway, setPaymentGateway] = useState<'payphone' | 'cash'>('payphone');
  const [isPayphoneModalOpen, setIsPayphoneModalOpen] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice || item.dish.price) * item.quantity, 0);
  const deliveryFee = customer.orderType === 'delivery' ? (subtotal > 0 ? 2.50 : 0) : 0;
  const grandTotal = subtotal + deliveryFee;

  // Browser Geolocation Trigger
  const handleCaptureLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Capturing GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
        setCustomer(prev => ({ ...prev, locationLink: mapUrl }));
        setIsLocating(false);
        setLocationStatus(`GPS pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus('Location access denied or unavailable. Please enter address manually.');
        console.warn('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Dispatch Order via WhatsApp (with optional Payphone payment voucher)
  const dispatchWhatsAppOrder = (payphoneVoucher?: PayphoneTransactionResult) => {
    // Build Detailed Item Summary with Custom Options & Specific Customer Notes
    const itemSummary = cartItems
      .map(item => {
        const lineTotal = (item.unitPrice || item.dish.price) * item.quantity;
        let line = `• ${item.quantity}x ${item.dish.name} ($${lineTotal.toFixed(2)})`;
        if (item.selectedOptions && item.selectedOptions.length > 0) {
          const optsText = item.selectedOptions
            .map(o => `   └ ${o.groupTitle}: ${o.choiceName}${o.priceExtra ? ` (+$${o.priceExtra.toFixed(2)})` : ''}`)
            .join('\n');
          line += `\n${optsText}`;
        }
        if (item.customerNote) {
          line += `\n   └ 📝 Customer Prep Note: "${item.customerNote}"`;
        }
        return line;
      })
      .join('\n\n');

    const paymentText = payphoneVoucher
      ? `✅ PAID & VERIFIED VIA PAYPHONE ECUADOR\n• Payphone Auth Code: ${payphoneVoucher.authorizationCode}\n• Transaction ID: ${payphoneVoucher.clientTransactionId}\n• Tax ID / Document: ${payphoneVoucher.documentId || 'Included'}\n• Card: ${payphoneVoucher.cardBrand || 'Payphone Wallet'}`
      : `💵 Payment Method: Cash / Card on Delivery`;

    // Build Exact Message Format
    const message = `*NEW ORDER - Sher E Punjab (Quito)*
----------------------------------
*Customer Details:*
• Name: ${customer.fullName}
• Phone: ${customer.phone}
• Order Type: ${customer.orderType === 'delivery' ? 'Delivery' : 'Takeaway'}
• Google Maps Location: ${customer.locationLink || 'Not Shared'}
• Address Note: ${customer.address || 'N/A'}

*Payment Details:*
${paymentText}

*Order & Dish Specifications:*
${itemSummary}

*Total Amount:* $${grandTotal.toFixed(2)} USD
*Overall Special Instructions:* ${customer.specialInstructions.trim() || 'None'}
----------------------------------`;

    const encodedMessage = encodeURIComponent(message);
    const targetPhone = config.whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

    // Open WhatsApp URL
    window.open(whatsappUrl, '_blank');

    // Reset customer form
    setCustomer({
      fullName: '',
      phone: '',
      orderType: 'delivery',
      address: '',
      locationLink: '',
      specialInstructions: ''
    });

    // Clear cart and close drawer
    onClearCart();
    onClose();
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (!customer.fullName.trim() || !customer.phone.trim()) {
      alert('Please provide your Full Name and WhatsApp Phone Number.');
      return;
    }

    if (customer.orderType === 'delivery' && !customer.address.trim() && !customer.locationLink) {
      alert('Please provide a delivery address or pin your GPS location.');
      return;
    }

    if (paymentGateway === 'payphone') {
      setIsPayphoneModalOpen(true);
    } else {
      dispatchWhatsAppOrder();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF6F0] text-[#2B231D] shadow-2xl flex flex-col border-l border-[#E5982A]/30 text-left">
          
          {/* Header */}
          <div className="p-5 bg-[#1C3A27] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#E5982A]" />
              <h2 className="font-serif text-lg font-bold">Your Order Cart</h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Selected Items List */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C23B22]">
                  Selected Dishes ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
                </span>
                {cartItems.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="text-[11px] text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-10 bg-[#FFFDF9] rounded-2xl border border-dashed border-gray-300 p-6">
                  <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="font-serif text-base font-bold text-[#2B231D]">Your cart is empty</p>
                  <p className="text-xs text-[#6B5E54] mt-1">
                    Explore our fusion menu and add your favorite dishes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const itemIdKey = item.cartItemId || item.dish.id;
                    const itemUnitPrice = item.unitPrice || item.dish.price;

                    return (
                      <div
                        key={itemIdKey}
                        className="bg-[#FFFDF9] p-3 rounded-xl border border-gray-200/80 shadow-xs flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <img
                            src={item.dish.image}
                            alt={item.dish.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-sm font-bold text-[#2B231D]">
                              {item.dish.name}
                            </h4>
                            <span className="text-xs font-semibold text-[#C23B22]">
                              ${(itemUnitPrice * item.quantity).toFixed(2)} USD
                              {item.quantity > 1 && <span className="text-[10px] text-gray-500 font-normal"> (${itemUnitPrice.toFixed(2)} each)</span>}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-lg border border-gray-200">
                            <button
                              onClick={() => onUpdateQuantity(itemIdKey, -1)}
                              className="p-1 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(itemIdKey, 1)}
                              className="p-1 hover:bg-gray-200 rounded text-gray-700 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(itemIdKey)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Selected specifications / options display */}
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="text-[11px] bg-[#FAF6F0] p-2 rounded-lg border border-amber-200/60 space-y-0.5">
                            <span className="font-bold text-[10px] text-[#1C3A27] uppercase tracking-wider block">
                              Chosen Specifications:
                            </span>
                            {item.selectedOptions.map((opt, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[#2B231D]">
                                <span>• {opt.groupTitle}: <strong>{opt.choiceName}</strong></span>
                                {opt.priceExtra !== 0 && (
                                  <span className="text-[10px] font-semibold text-[#C23B22]">
                                    {opt.priceExtra > 0 ? `+$${opt.priceExtra.toFixed(2)}` : `-$${Math.abs(opt.priceExtra).toFixed(2)}`}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Customer preparation request note */}
                        {item.customerNote && (
                          <div className="text-[11px] bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200 flex items-start gap-1">
                            <span className="font-bold shrink-0">📝 Request:</span>
                            <span className="italic">{item.customerNote}</span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Details Form */}
            {cartItems.length > 0 && (
              <form onSubmit={handleConfirmOrder} className="space-y-4 pt-4 border-t border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C3A27] block">
                  Delivery & Contact Information
                </span>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sofia Morales"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+593 98 765 4321"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                  />
                </div>

                {/* Order Type Toggle */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Order Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, orderType: 'delivery' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        customer.orderType === 'delivery'
                          ? 'bg-[#C23B22] text-white border-[#C23B22]'
                          : 'bg-[#FFFDF9] text-gray-700 border-gray-200'
                      }`}
                    >
                      🚀 Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, orderType: 'takeaway' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        customer.orderType === 'takeaway'
                          ? 'bg-[#1C3A27] text-white border-[#1C3A27]'
                          : 'bg-[#FFFDF9] text-gray-700 border-gray-200'
                      }`}
                    >
                      🛍️ Takeaway
                    </button>
                  </div>
                </div>

                {/* Delivery Address / Geolocation */}
                {customer.orderType === 'delivery' && (
                  <div className="space-y-2 bg-[#FFFDF9] p-3 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-gray-700">
                        Delivery Address
                      </label>

                      {/* GPS Button */}
                      <button
                        type="button"
                        onClick={handleCaptureLocation}
                        disabled={isLocating}
                        className="px-2.5 py-1 rounded-lg bg-[#1C3A27] hover:bg-[#2A5239] text-white text-[10px] font-bold flex items-center gap-1 transition-all"
                      >
                        {isLocating ? (
                          <Loader2 className="w-3 h-3 animate-spin text-[#E5982A]" />
                        ) : (
                          <MapPin className="w-3 h-3 text-[#E5982A]" />
                        )}
                        <span>📍 Share Current Location</span>
                      </button>
                    </div>

                    {locationStatus && (
                      <p className="text-[10px] text-[#C23B22] font-semibold">
                        {locationStatus}
                      </p>
                    )}

                    {customer.locationLink && (
                      <div className="bg-green-50 p-2 rounded-lg border border-green-200 text-[10px] text-green-800 break-all">
                        <strong>GPS Pin Saved: </strong>
                        <a href={customer.locationLink} target="_blank" rel="noreferrer" className="underline">
                          {customer.locationLink}
                        </a>
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Urbanización / Street / House # / Reference in Cumbayá"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-[#FAF6F0] text-xs text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                    />
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Special Instructions / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Extra spicy, no cutlery needed, ring doorbell..."
                    value={customer.specialInstructions}
                    onChange={(e) => setCustomer({ ...customer, specialInstructions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                  />
                </div>

                {/* PAYMENT METHOD SELECTION */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <label className="block text-[11px] font-bold text-[#1C3A27] uppercase tracking-wider">
                    Select Payment Method
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('payphone')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        paymentGateway === 'payphone'
                          ? 'border-[#FF5A00] bg-orange-50/80 shadow-xs'
                          : 'border-gray-200 bg-[#FFFDF9] hover:border-gray-300'
                      }`}
                    >
                      {paymentGateway === 'payphone' && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-[#FF5A00] rounded-bl" />
                      )}
                      <div className="flex items-center gap-1.5 text-[#FF5A00] font-bold text-xs">
                        <CreditCard className="w-4 h-4 shrink-0" />
                        <span>Payphone Ecuador</span>
                      </div>
                      <p className="text-[10px] text-gray-600 mt-1">
                        Visa, Mastercard, Diners or Payphone Wallet.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentGateway('cash')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        paymentGateway === 'cash'
                          ? 'border-[#1C3A27] bg-green-50/80 shadow-xs'
                          : 'border-gray-200 bg-[#FFFDF9] hover:border-gray-300'
                      }`}
                    >
                      {paymentGateway === 'cash' && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-[#1C3A27] rounded-bl" />
                      )}
                      <div className="flex items-center gap-1.5 text-[#1C3A27] font-bold text-xs">
                        <Send className="w-4 h-4 shrink-0 text-green-600" />
                        <span>Cash / Delivery</span>
                      </div>
                      <p className="text-[10px] text-gray-600 mt-1">
                        Pay in cash or card upon driver arrival.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Itemized Pricing & Grand Total */}
                <div className="pt-3 border-t border-gray-200 space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)} USD</span>
                  </div>
                  {customer.orderType === 'delivery' && (
                    <div className="flex justify-between">
                      <span>Delivery Fee (Cumbayá area):</span>
                      <span className="font-semibold">${deliveryFee.toFixed(2)} USD</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#1C3A27] pt-1 border-t border-gray-100">
                    <span>Total Amount:</span>
                    <span className="text-[#C23B22]">${grandTotal.toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Confirm & Checkout Action Button */}
                {paymentGateway === 'payphone' ? (
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5A00] to-[#E84D00] hover:from-[#E84D00] hover:to-[#C23B22] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Payphone ($${grandTotal.toFixed(2)} USD)</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirm & Order via WhatsApp</span>
                  </button>
                )}
              </form>
            )}

          </div>

        </div>
      </div>

      {/* Payphone Payment Modal */}
      <PayphonePaymentModal
        isOpen={isPayphoneModalOpen}
        onClose={() => setIsPayphoneModalOpen(false)}
        cartItems={cartItems}
        customer={customer}
        config={config}
        onSuccessPayment={(result) => dispatchWhatsAppOrder(result)}
      />
    </div>
  );
};
