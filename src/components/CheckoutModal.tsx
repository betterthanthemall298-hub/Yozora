import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  X,
  Truck,
  ShieldCheck,
  Phone,
  User,
  MapPin,
  FileText,
  Building2,
  MessageCircle
} from 'lucide-react';
import { OrderItem } from '../types';
import { playPurchaseSuccessSound, triggerSuccessVibration } from '../utils/soundEffects';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    governorates,
    appliedCoupon,
    getCartSubtotal,
    getCartDiscount,
    createOrder,
    settings,
    setActiveView,
    addToast
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('القاهرة');
  const [center, setCenter] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const currentGov = governorates.find((g) => g.name === selectedGovernorate) || governorates[0];
  const baseShippingCost = currentGov ? currentGov.cost : 50;

  const totalPieces = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const minQtyForOffer = Math.max(1, Number(settings.quantityShippingMinItems) || 2);
  const isQtyOfferActive = Boolean(settings.quantityShippingEnabled && totalPieces >= minQtyForOffer);
  const shippingCost = isQtyOfferActive
    ? Math.max(0, Number(settings.quantityShippingCost ?? 0))
    : baseShippingCost;

  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const grandTotal = Math.max(0, subtotal - discount + shippingCost);

  const validateEgyptianPhone = (p: string) => {
    const clean = p.replace(/\s+/g, '');
    const regex = /^01[0125][0-9]{8}$/;
    return regex.test(clean);
  };

  const handleClose = () => {
    setCustomerName('');
    setPhone('');
    setAlternatePhone('');
    setCenter('');
    setAddress('');
    setNotes('');
    setPhoneError('');
    setIsCheckoutOpen(false);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!customerName.trim()) {
      alert('يرجى إدخال اسم المستلم بالكامل');
      return;
    }
    if (!validateEgyptianPhone(phone)) {
      setPhoneError('رقم الهاتف غير صحيح. يجب أن يتكون من 11 رقماً ويبدأ بـ 01 (مثال: 01012345678)');
      return;
    }
    setPhoneError('');

    if (!center.trim()) {
      alert('يرجى تحديد المركز أو الحي');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      alert('يرجى إدخال تفاصيل العنوان (اسم الشارع ورقم العقار أو علامة مميزة)');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = cart.map((item) => {
        const firstImg = item.product.images?.[0] || '';
        const isRemoteUrl = firstImg.startsWith('http');
        return {
          productId: item.productId,
          productName: item.product.name,
          subtitle: item.product.subtitle || '',
          image: isRemoteUrl ? firstImg : '',
          size: item.size,
          colorName: item.colorName,
          colorHex: item.colorHex,
          price: item.product.price,
          quantity: item.quantity
        };
      });

      const newOrder = await createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim() || undefined,
        governorate: selectedGovernorate,
        center: center.trim(),
        address: address.trim(),
        notes: notes.trim() || undefined,
        items: orderItems,
        subtotal,
        shippingCost,
        discount,
        couponCode: discount > 0 ? appliedCoupon?.code : undefined,
        total: grandTotal
      });

      // 1. Play immediate celebratory sound chime & haptic
      playPurchaseSuccessSound();
      triggerSuccessVibration();

      // 2. Save order number locally for tracking
      try {
        localStorage.setItem('yozora_last_track_query', newOrder.orderNumber);
        localStorage.setItem('beyond_last_track_query', newOrder.orderNumber);
      } catch {}

      // 3. Prepare detailed WhatsApp message with order & customer specs
      const rawWaNumber = settings.whatsappNumber || '01000000000';
      const cleanWaDigits = rawWaNumber.replace(/[^0-9]/g, '');
      const waPhone = cleanWaDigits.startsWith('20')
        ? cleanWaDigits
        : '20' + cleanWaDigits.replace(/^0+/, '');

      const itemsListText = orderItems
        .map(
          (item, idx) =>
            `${idx + 1}. *${item.productName}*\n   - المقاس: ${item.size} | اللون: ${item.colorName || 'أساسي'}\n   - الكمية: ${item.quantity} | السعر: ${(item.price * item.quantity).toLocaleString()} ج.م`
        )
        .join('\n');

      const waMessage = [
        `مرحباً *${settings.storeName || 'Yozora'}*! أود تأكيد طلبي الجديد:`,
        `━━━━━━━━━━━━━━━━━━`,
        `📋 *رقم الطلب:* #${newOrder.orderNumber}`,
        `👤 *الاسم بالكامل:* ${newOrder.customerName}`,
        `📞 *رقم الهاتف (واتساب):* ${newOrder.phone}`,
        ...(newOrder.alternatePhone ? [`📱 *هاتف بديل:* ${newOrder.alternatePhone}`] : []),
        `📍 *المحافظة:* ${newOrder.governorate}`,
        `🏢 *المركز / الحي:* ${newOrder.center}`,
        `🏠 *العنوان بالتفصيل:* ${newOrder.address}`,
        ...(newOrder.notes ? [`📝 *ملاحظات التوصيل:* ${newOrder.notes}`] : []),
        `━━━━━━━━━━━━━━━━━━`,
        `🛍️ *تفاصيل المنتجات (${totalPieces} قطع):*`,
        itemsListText,
        `━━━━━━━━━━━━━━━━━━`,
        `💰 *المجموع الفرعي:* ${newOrder.subtotal.toLocaleString()} ج.م`,
        `🚚 *مصاريف الشحن:* ${newOrder.shippingCost === 0 ? 'شحن مجاني' : `${newOrder.shippingCost} ج.م`}`,
        ...(newOrder.discount > 0 ? [`🏷️ *الخصم:* -${newOrder.discount.toLocaleString()} ج.م`] : []),
        `💵 *الإجمالي النهائي للدفع:* ${newOrder.total.toLocaleString()} ج.م (عند الاستلام)`,
        `━━━━━━━━━━━━━━━━━━`,
        `أرجو تأكيد استلام الطلب والبدء في تجهيز الشحنة. شكراً لكم!`
      ].join('\n');

      // Copy order details to clipboard as fail-safe backup
      try {
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(waMessage);
        }
      } catch {}

      // Always use direct phone endpoint to guarantee that WhatsApp pre-fills the message with full order data
      const waUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(waMessage)}`;

      // 4. Notify user and close checkout modal
      addToast({
        type: 'success',
        title: 'تم تسجيل طلبك بنجاح! 🚀',
        description: `طلب #${newOrder.orderNumber} - تم تجهيز تفاصيل طلبك للإرسال في رسالة واتساب.`
      });

      handleClose();

      // 5. Transfer directly to WhatsApp with pre-filled order details
      try {
        const opened = window.open(waUrl, '_blank');
        if (!opened || opened.closed || typeof opened.closed === 'undefined') {
          window.location.href = waUrl;
        }
      } catch {
        window.location.href = waUrl;
      }
    } catch (err: any) {
      console.error('Failed to submit order:', err);
      alert(err?.message || 'فشل إرسال الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        id="checkout-modal-panel"
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div>
            <h3 className="text-base font-bold text-stone-100">
              إتمام الطلب والدفع عند الاستلام
            </h3>
            <p className="text-xs text-stone-400">
              يرجى إدخال بيانات التوصيل بدقة للتسليم السريع
            </p>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-5">
            {/* Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  الاسم بالكامل <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="checkout-name-input"
                    type="text"
                    required
                    placeholder="الاسم ثلاثي أو ثنائي"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Primary Phone */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  رقم الهاتف (واتساب) <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="checkout-phone-input"
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="01012345678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError('');
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono text-left"
                  />
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                </div>
                {phoneError && (
                  <p className="text-[11px] text-rose-400 mt-1">{phoneError}</p>
                )}
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  رقم هاتف بديل (اختياري)
                </label>
                <div className="relative">
                  <input
                    id="checkout-alt-phone-input"
                    type="tel"
                    dir="ltr"
                    placeholder="01112345678"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono text-left"
                  />
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Governorate Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  المحافظة <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="checkout-governorate-select"
                    value={selectedGovernorate}
                    onChange={(e) => setSelectedGovernorate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500 appearance-none"
                  >
                    {governorates.map((g) => (
                      <option key={g.name} value={g.name}>
                        {g.name} — {isQtyOfferActive ? (shippingCost === 0 ? 'مجاني (0 ج.م)' : `${shippingCost} ج.م`) : `${g.cost} ج.م`}
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-stone-500 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Center / City */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  المركز / المدينة / الحي <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="checkout-center-input"
                    type="text"
                    required
                    placeholder="مثال: مدينة نصر، المعادي، بنها..."
                    value={center}
                    onChange={(e) => setCenter(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Detailed Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  العنوان التفصيلي (اسم الشارع، رقم العمارة، رقم الشقة) <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="checkout-address-input"
                    required
                    rows={2}
                    placeholder="مثال: شارع 15 - عمارة 5 - الدور الثالث - شقة 7"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              {/* Delivery Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  ملاحظات إضافية للتوصيل (اختياري)
                </label>
                <div className="relative">
                  <input
                    id="checkout-notes-input"
                    type="text"
                    placeholder="مثال: التسليم بعد الساعة 4 عصراً"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <FileText className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Order Cost Summary */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>المجموع الفرعي ({totalPieces} قطع):</span>
                <span className="font-mono text-stone-200">{subtotal} ج.م</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>
                    خصم الكوبون ({appliedCoupon?.code}
                    {appliedCoupon?.targetProductName ? ` - لمنتج ${appliedCoupon.targetProductName}` : ''}):
                  </span>
                  <span className="font-mono">-{discount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-stone-400">
                <span>
                  شحن محافظة {selectedGovernorate}
                  {isQtyOfferActive ? ` (عرض ${minQtyForOffer} قطع وأكثر)` : ''}:
                </span>
                {isQtyOfferActive ? (
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    {baseShippingCost !== shippingCost && (
                      <span className="line-through text-stone-500 text-[11px]">{baseShippingCost} ج.م</span>
                    )}
                    <span>{shippingCost === 0 ? 'مجاني (0 ج.م)' : `${shippingCost} ج.م`}</span>
                  </span>
                ) : (
                  <span className="font-mono text-stone-200">{shippingCost} ج.م</span>
                )}
              </div>
              <div className="flex justify-between items-baseline text-stone-100 text-base font-black border-t border-stone-800 pt-2">
                <span>الإجمالي النهائي للدفع:</span>
                <span className="text-amber-400 font-mono text-lg">{grandTotal} ج.م</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-between text-[11px] text-stone-400 bg-stone-950/40 p-3 rounded-xl border border-stone-800/60">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>معاينة القطعة قبل الاستلام</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>الدفع نقدياً عند الاستلام</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="submit-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>جاري تسجيل الطلب...</span>
                </>
              ) : (
                <>
                  <span>تأكيد الطلب والتكملة عبر واتساب</span>
                  <MessageCircle className="w-4 h-4 text-stone-950 fill-current" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
