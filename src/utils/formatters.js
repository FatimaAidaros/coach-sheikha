// Formatters utility for Coach Sheikha platform

export function formatPrice(price) {
  if (price === undefined || price === null) return '—';
  return `${Number(price).toLocaleString('ar-SA')} ر.س`;
}

export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  // Remove spaces, dashes, parentheses
  return String(phone).replace(/[^0-9+]/g, '');
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 بايت';
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
