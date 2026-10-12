// WhatsApp messaging helper for Coach Sheikha

export function generateWhatsAppSubscriptionMessage({
  fullName,
  age,
  phone,
  packageName,
  packagePrice,
  durationValue,
  durationUnit,
  notes
}) {
  const durationText = durationValue ? `${durationValue} ${durationUnit || 'يوم'}` : 'غير محدد';
  const priceText = packagePrice ? `${packagePrice} ر.س` : 'غير محدد';

  return `السلام عليكم،
أرغب في الاشتراك مع كوتش شيخة.

الاسم: ${fullName || '—'}
العمر: ${age || '—'}
رقم الهاتف: ${phone || '—'}
الباقة: ${packageName || '—'}
السعر: ${priceText}
المدة: ${durationText}
الملاحظات: ${notes || 'لا يوجد'}

تم رفع سند الدفع عبر الموقع.`;
}

export function buildWhatsAppUrl(phoneNumber, messageText) {
  const coachPhone = (phoneNumber || '967770870321').replace(/[^0-9]/g, '');
  return `https://wa.me/${coachPhone}?text=${encodeURIComponent(messageText)}`;
}
