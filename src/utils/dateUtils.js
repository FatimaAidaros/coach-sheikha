// Date utility functions for subscription duration and status calculations

export function calculateEndDate(startDateStr, durationValue = 30, durationUnit = 'يوم') {
  if (!startDateStr) return '';
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return '';

  const days = Number(durationValue) || 30;
  // If durationUnit is month, convert or treat as days
  let totalDaysToAdd = days;
  if (durationUnit === 'شهر' || durationUnit === 'أشهر') {
    totalDaysToAdd = days * 30;
  } else if (durationUnit === 'أسبوع' || durationUnit === 'أسابيع') {
    totalDaysToAdd = days * 7;
  }

  const end = new Date(start);
  end.setDate(end.getDate() + totalDaysToAdd);
  return end.toISOString().split('T')[0];
}

export function calculateRemainingDays(endDateStr) {
  if (!endDateStr) return null;
  const end = new Date(endDateStr);
  if (isNaN(end.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getSubscriptionTimelineStatus(startDateStr, endDateStr) {
  if (!endDateStr) return 'unknown';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDateStr) {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    if (today < start) {
      return 'upcoming'; // قادم
    }
  }

  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);

  if (today > end) {
    return 'expired'; // منتهي
  }

  return 'active'; // نشط
}

export function getRemainingDaysBadge(startDateStr, endDateStr) {
  const status = getSubscriptionTimelineStatus(startDateStr, endDateStr);
  const remaining = calculateRemainingDays(endDateStr);

  if (status === 'upcoming') {
    return {
      text: 'يبدأ قريباً',
      className: 'badge-upcoming',
      type: 'upcoming'
    };
  }

  if (status === 'expired' || (remaining !== null && remaining < 0)) {
    return {
      text: 'انتهى الاشتراك',
      className: 'badge-expired',
      type: 'expired'
    };
  }

  if (remaining === 0) {
    return {
      text: 'ينتهي اليوم',
      className: 'badge-warning',
      type: 'warning'
    };
  }

  if (remaining !== null) {
    return {
      text: `متبقي ${remaining} يوم`,
      className: 'badge-active',
      type: 'active'
    };
  }

  return {
    text: 'غير محدد',
    className: 'badge-neutral',
    type: 'unknown'
  };
}

export function formatDateArabic(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
