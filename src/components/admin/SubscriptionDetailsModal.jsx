import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import {
  User,
  Phone,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileDown,
  ZoomIn,
  X
} from 'lucide-react';
import { getReceiptSignedUrl, getLocalReceiptFile, saveSubscription } from '../../services/api';
import { isLocalDevelopment, hasSupabase } from '../../lib/supabase';
import { getRemainingDaysBadge, formatDateArabic } from '../../utils/dateUtils';
import { formatPrice } from '../../utils/formatters';

const statusLabels = {
  new: 'جديد',
  under_review: 'قيد المراجعة',
  accepted: 'مقبول',
  completed: 'مكتمل',
  rejected: 'مرفوض'
};

export default function SubscriptionDetailsModal({
  isOpen,
  onClose,
  subscription,
  onStatusUpdated
}) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(subscription?.status || 'new');
  const [showLightbox, setShowLightbox] = useState(false);

  const isLocal = isLocalDevelopment || !hasSupabase;

  useEffect(() => {
    if (!subscription) return;
    setCurrentStatus(subscription.status || 'new');
    setSignedUrl(null);
    setShowLightbox(false);

    let isMounted = true;
    let localCreatedUrl = null;

    if (isLocal) {
      // In local development mode: never call Supabase Storage
      setLoadingUrl(false);

      // 1. Direct preview URL on subscription object
      let localUrl = subscription.receipt_preview_url;

      // 2. Direct File/Blob on subscription object
      if (!localUrl && (subscription.receipt_file instanceof Blob || subscription.receipt_file instanceof File)) {
        localCreatedUrl = URL.createObjectURL(subscription.receipt_file);
        localUrl = localCreatedUrl;
      }

      // 3. Direct displayable string (blob:, data:, http)
      if (!localUrl && (
        subscription.payment_receipt_path?.startsWith('blob:') ||
        subscription.payment_receipt_path?.startsWith('data:') ||
        subscription.payment_receipt_path?.startsWith('http')
      )) {
        localUrl = subscription.payment_receipt_path;
      }

      if (localUrl) {
        if (isMounted) setSignedUrl(localUrl);
        return () => {
          isMounted = false;
          if (localCreatedUrl) {
            try {
              URL.revokeObjectURL(localCreatedUrl);
            } catch (e) {
              console.warn(e);
            }
          }
        };
      }

      // 4. Check persistent local storage (IndexedDB)
      if (subscription.id && subscription.payment_receipt_path && subscription.payment_receipt_path !== 'no-file') {
        getLocalReceiptFile(subscription.id)
          .then(stored => {
            if (isMounted && stored?.previewUrl) {
              setSignedUrl(stored.previewUrl);
            } else if (isMounted) {
              setSignedUrl(null);
            }
          })
          .catch(() => {
            if (isMounted) setSignedUrl(null);
          });
      } else {
        if (isMounted) setSignedUrl(null);
      }

      return () => {
        isMounted = false;
        if (localCreatedUrl) {
          try {
            URL.revokeObjectURL(localCreatedUrl);
          } catch (e) {
            console.warn(e);
          }
        }
      };
    }

    // In real mode with Supabase: generate private signed URL
    if (subscription.payment_receipt_path && subscription.payment_receipt_path !== 'no-file') {
      setLoadingUrl(true);
      getReceiptSignedUrl(subscription.payment_receipt_path)
        .then(url => {
          if (isMounted) setSignedUrl(url);
        })
        .finally(() => {
          if (isMounted) setLoadingUrl(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [subscription, isLocal]);


  if (!subscription) return null;

  const remaining = getRemainingDaysBadge(subscription.start_date, subscription.end_date);
  const isPdf = subscription.payment_receipt_path?.toLowerCase().endsWith('.pdf');

  async function handleStatusChange(newStatus) {
    try {
      setUpdatingStatus(true);
      await saveSubscription({
        ...subscription,
        status: newStatus
      });
      setCurrentStatus(newStatus);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      console.error('فشل تحديث الحالة:', err.message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تفاصيل اشتراك: ${subscription.full_name}`}
      maxWidth="750px"
    >
      <div className="sub-details-wrapper">
        {/* Status Bar */}
        <div className="sub-status-bar">
          <div className="sub-status-current">
            <span>الحالة الحالية:</span>
            <span className={`status-pill status-${currentStatus}`}>
              {statusLabels[currentStatus] || currentStatus}
            </span>
          </div>

          <div className="sub-status-selector">
            <span>تغيير الحالة:</span>
            <select
              value={currentStatus}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
            >
              <option value="new">جديد</option>
              <option value="under_review">قيد المراجعة</option>
              <option value="accepted">مقبول</option>
              <option value="completed">مكتمل</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
        </div>

        <div className="sub-grid-details">
          {/* Customer Info Card */}
          <div className="sub-detail-card">
            <h4>
              <User size={18} />
              <span>بيانات العميلة</span>
            </h4>
            <div className="detail-row">
              <span className="label">الاسم الكامل:</span>
              <strong className="val">{subscription.full_name}</strong>
            </div>
            <div className="detail-row">
              <span className="label">العمر:</span>
              <span className="val">{subscription.age} سنة</span>
            </div>
            <div className="detail-row">
              <span className="label">رقم الجوال:</span>
              <a
                href={`https://wa.me/${(subscription.phone || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="val val-link"
              >
                <Phone size={14} />
                <span dir="ltr">{subscription.phone}</span>
              </a>
            </div>
            {subscription.notes && (
              <div className="detail-notes-box">
                <span className="label">ملاحظات العميلة:</span>
                <p>{subscription.notes}</p>
              </div>
            )}
          </div>

          {/* Package & Pricing Info Card */}
          <div className="sub-detail-card">
            <h4>
              <CreditCard size={18} />
              <span>بيانات الباقة والرسوم</span>
            </h4>
            <div className="detail-row">
              <span className="label">اسم الباقة:</span>
              <strong className="val">{subscription.package_name_snapshot || 'غير محدد'}</strong>
            </div>
            <div className="detail-row">
              <span className="label">سعر الباقة:</span>
              <strong className="val price-val">
                {formatPrice(subscription.package_price_snapshot)}
              </strong>
            </div>
            <div className="detail-row">
              <span className="label">المدة المحددة:</span>
              <span className="val">
                {subscription.duration_value} {subscription.duration_unit || 'يوم'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">تاريخ التسجيل:</span>
              <span className="val">{formatDateArabic(subscription.created_at)}</span>
            </div>
          </div>

          {/* Timeline & Duration Card */}
          <div className="sub-detail-card span-2">
            <h4>
              <Clock size={18} />
              <span>مدة وصلاحية الاشتراك</span>
            </h4>
            <div className="timeline-items-row">
              <div className="timeline-col">
                <span className="label">تاريخ البداية:</span>
                <strong>{subscription.start_date ? formatDateArabic(subscription.start_date) : 'غير محدد'}</strong>
              </div>
              <div className="timeline-col">
                <span className="label">تاريخ الانتهاء:</span>
                <strong>{subscription.end_date ? formatDateArabic(subscription.end_date) : 'غير محدد'}</strong>
              </div>
              <div className="timeline-col">
                <span className="label">حالة الصلاحية:</span>
                <span className={`timeline-badge ${remaining.className}`}>
                  {remaining.text}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Receipt Viewer Card */}
          <div className="sub-detail-card span-2 receipt-preview-card">
            <h4>
              <FileText size={18} />
              <span>سند التحويل البنكي المرفوع</span>
            </h4>

            {loadingUrl ? (
              <div className="receipt-loading-box">
                <div className="custom-spinner small" />
                <span>جاري إنشاء رابط آمن لمشاهدة السند (Signed URL)...</span>
              </div>
            ) : signedUrl ? (
              <div className="receipt-display-area">
                {isPdf ? (
                  <div className="pdf-preview-box">
                    <FileText size={48} color="var(--brown)" />
                    <p>ملف سند تحويل بصيغة PDF</p>
                    <a
                      href={signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button small"
                    >
                      <FileDown size={16} />
                      <span>فتح وعرض ملف PDF</span>
                    </a>
                  </div>
                ) : (
                  <div className="image-preview-box">
                    <div
                      className="image-clickable-container"
                      onClick={() => setShowLightbox(true)}
                      title="اضغطي لعرض السند بالحجم الكامل"
                    >
                      <img src={signedUrl} alt="سند التحويل" />
                      <div className="image-hover-hint">
                        <ZoomIn size={22} />
                        <span>تكبير السند</span>
                      </div>
                    </div>

                    {subscription.payment_receipt_path && subscription.payment_receipt_path !== 'no-file' && !subscription.payment_receipt_path.startsWith('blob:') && !subscription.payment_receipt_path.startsWith('data:') && (
                      <span className="receipt-filename-tag">
                        الملف المرفق: {subscription.payment_receipt_path}
                      </span>
                    )}

                    <div className="receipt-actions-row">
                      <button
                        type="button"
                        className="button outline small"
                        onClick={() => setShowLightbox(true)}
                      >
                        <Eye size={16} />
                        <span>عرض الصورة بالحجم الكامل</span>
                      </button>
                      <a
                        href={signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button outline small"
                      >
                        <ExternalLink size={16} />
                        <span>فتح في نافذة جديدة</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-receipt-box">
                <p className="no-receipt-notice">لم يتم إرفاق سند</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-bottom-actions">
          <button type="button" className="button outline small" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>

      {/* Lightbox / Zoom Modal for Full-Size Receipt */}
      {showLightbox && signedUrl && (
        <div className="receipt-lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <div className="receipt-lightbox-content" onClick={e => e.stopPropagation()}>
            <div className="receipt-lightbox-header">
              <h3>سند التحويل: {subscription.full_name}</h3>
              <div className="receipt-lightbox-actions">
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button outline small"
                  title="فتح في نافذة جديدة"
                >
                  <ExternalLink size={14} />
                  <span>نافذة جديدة</span>
                </a>
                <button
                  type="button"
                  className="icon-btn close-lightbox-btn"
                  onClick={() => setShowLightbox(false)}
                  title="إغلاق"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="receipt-lightbox-body">
              <img src={signedUrl} alt="سند التحويل بالحجم الكامل" />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
