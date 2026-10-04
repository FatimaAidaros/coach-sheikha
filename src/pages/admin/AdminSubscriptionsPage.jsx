import React, { useState, useEffect, useMemo } from 'react';

import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Download
} from 'lucide-react';

import {
  getSubscriptions,
  getPackages,
  deleteSubscription,
  getSiteSettings,
  saveSiteSettings
} from '../../services/api';

import { supabase, hasSupabase } from '../../lib/supabase';

import {
  formatDateArabic,
  getRemainingDaysBadge,
  getSubscriptionTimelineStatus
} from '../../utils/dateUtils';

import { formatPrice } from '../../utils/formatters';
import { exportSubscribersToExcel } from '../../utils/exportSubscribersExcel';

import SubscriptionDetailsModal from '../../components/admin/SubscriptionDetailsModal';
import SubscriptionFormModal from '../../components/admin/SubscriptionFormModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const statusLabels = {
  new: 'جديد',
  under_review: 'قيد المراجعة',
  accepted: 'مقبول',
  completed: 'مكتمل',
  rejected: 'مرفوض'
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [registrationClosedMessage, setRegistrationClosedMessage] = useState('');
  const [showCloseRegistrationModal, setShowCloseRegistrationModal] =
    useState(false);
  const [closeRegistrationMessage, setCloseRegistrationMessage] = useState('');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Global registration state
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [togglingReg, setTogglingReg] = useState(false);

  // Search, Filters & Sort State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [selectedSubForDetails, setSelectedSubForDetails] = useState(null);
  const [selectedSubForEdit, setSelectedSubForEdit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [subToDelete, setSubToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    try {
      setLoading(true);

      const [subs, packs, settings] = await Promise.all([
        getSubscriptions(),
        getPackages(),
        getSiteSettings()
      ]);

      setSubscriptions(subs || []);
      setPackages(packs || []);

      if (settings) {
        if (typeof settings.registration_open !== 'undefined') {
          setRegistrationOpen(Boolean(settings.registration_open));
        }

        setRegistrationClosedMessage(
          settings.registration_closed_message || ''
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportExcel() {
  if (exportingExcel) return;

  try {
    setExportingExcel(true);

    await exportSubscribersToExcel(
      subscriptions
    );
  } catch (err) {
    console.error(
      'فشل تصدير بيانات المشتركين:',
      err
    );

    alert(
      'حدث خطأ أثناء إصدار ملف Excel.'
    );
  } finally {
    setExportingExcel(false);
  }
}

  async function handleToggleRegistration() {
    if (togglingReg) return;

    // إذا كان التسجيل مفتوحًا ونريد إغلاقه
    if (registrationOpen) {
      setCloseRegistrationMessage(
        registrationClosedMessage ||
          'التسجيل مغلق حاليًا، وسيتم فتح التسجيل قريبًا.'
      );

      setShowCloseRegistrationModal(true);
      return;
    }

    // إذا كان التسجيل مغلقًا ونريد فتحه
    setRegistrationOpen(true);
    setTogglingReg(true);

    try {
      await saveSiteSettings({
        registration_open: true,
        registration_closed_message: ''
      });

      setRegistrationClosedMessage('');
    } catch (err) {
      console.error('فشل فتح التسجيل:', err);
      setRegistrationOpen(false);
    } finally {
      setTogglingReg(false);
    }
  }

  async function handleConfirmCloseRegistration() {
    if (togglingReg) return;

    const message =
      closeRegistrationMessage.trim() ||
      'التسجيل مغلق حاليًا، وسيتم فتح التسجيل قريبًا.';

    setTogglingReg(true);

    try {
      await saveSiteSettings({
        registration_open: false,
        registration_closed_message: message
      });

      setRegistrationOpen(false);
      setRegistrationClosedMessage(message);
      setShowCloseRegistrationModal(false);
    } catch (err) {
      console.error('فشل إغلاق التسجيل:', err);
      alert('حدث خطأ أثناء إغلاق التسجيل، حاولي مرة أخرى.');
    } finally {
      setTogglingReg(false);
    }
  }

  useEffect(() => {
    loadData();

    if (hasSupabase) {
      const channel = supabase
        .channel('subscriptions-page-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions'
          },
          () => {
            getSubscriptions().then(data => {
              setSubscriptions(data || []);
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'site_settings'
          },
          payload => {
            if (payload.new) {
              if (
                typeof payload.new.registration_open !== 'undefined'
              ) {
                setRegistrationOpen(
                  Boolean(payload.new.registration_open)
                );
              }

              if (
                typeof payload.new.registration_closed_message !==
                'undefined'
              ) {
                setRegistrationClosedMessage(
                  payload.new.registration_closed_message || ''
                );
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  async function handleDeleteConfirm() {
    if (!subToDelete) return;

    try {
      setDeleting(true);

      await deleteSubscription(subToDelete.id);

      setSubscriptions(prev =>
        prev.filter(s => s.id !== subToDelete.id)
      );

      setSubToDelete(null);
    } catch (err) {
      console.error('فشل حذف الاشتراك: ' + err.message);
    } finally {
      setDeleting(false);
    }
  }

  // Filtered and Sorted list
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter(s => {
        // Search by name or phone
        if (search.trim()) {
          const term = search.trim().toLowerCase();

          const nameMatch = (s.full_name || '')
            .toLowerCase()
            .includes(term);

          const phoneMatch = (s.phone || '')
            .toLowerCase()
            .includes(term);

          if (!nameMatch && !phoneMatch) {
            return false;
          }
        }

        // Filter by status
        if (statusFilter !== 'all' && s.status !== statusFilter) {
          return false;
        }

        // Filter by package
        if (packageFilter !== 'all') {
          const matchesPkgId = s.package_id === packageFilter;

          const matchesPkgName = (
            s.package_name_snapshot || ''
          ).includes(packageFilter);

          if (!matchesPkgId && !matchesPkgName) {
            return false;
          }
        }

        // Filter by timeline
        if (timelineFilter !== 'all') {
          const timeline = getSubscriptionTimelineStatus(
            s.start_date,
            s.end_date
          );

          if (timeline !== timelineFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return (
            new Date(b.created_at) -
            new Date(a.created_at)
          );
        }

        if (sortBy === 'oldest') {
          return (
            new Date(a.created_at) -
            new Date(b.created_at)
          );
        }

        if (sortBy === 'start_date') {
          return (
            new Date(b.start_date || 0) -
            new Date(a.start_date || 0)
          );
        }

        if (sortBy === 'end_date') {
          return (
            new Date(b.end_date || 0) -
            new Date(a.end_date || 0)
          );
        }

        return 0;
      });
  }, [
    subscriptions,
    search,
    statusFilter,
    packageFilter,
    timelineFilter,
    sortBy
  ]);

  return (
    <div className="admin-subscriptions-page">

      {/* Header */}
      <div className="admin-page-header-row">
        <div>
          <h1>إدارة الاشتراكات</h1>

          <p>
            متابعة وتحديث كافة طلبات وحجوزات الباقات وحساب التواريخ والمدد
          </p>
        </div>

        <div
          className="admin-page-header-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '14px',
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap'
          }}
        >

          {/* Switch للتحكم في حالة التسجيل العام */}
          <div
            className="registration-switch-box"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              padding: '6px 14px',
              borderRadius: '30px',
              border: '1px solid #e7ddd5',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              userSelect: 'none'
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#5a483e'
              }}
            >
              حالة التسجيل
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={registrationOpen}
              disabled={togglingReg}
              onClick={handleToggleRegistration}
              style={{
                direction: 'ltr',
                position: 'relative',
                width: '48px',
                height: '26px',
                borderRadius: '26px',
                background: registrationOpen
                  ? '#10b981'
                  : '#e2e8f0',
                border: `2px solid ${
                  registrationOpen
                    ? '#059669'
                    : '#cbd5e1'
                }`,
                cursor: togglingReg
                  ? 'wait'
                  : 'pointer',
                transition:
                  'background-color 0.25s ease, border-color 0.25s ease',
                padding: 0,
                display: 'inline-block',
                outline: 'none',
                opacity: togglingReg ? 0.7 : 1
              }}
              title={
                registrationOpen
                  ? 'انقر لإغلاق التسجيل'
                  : 'انقر لفتح التسجيل'
              }
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: registrationOpen
                    ? '24px'
                    : '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow:
                    '0 1px 3px rgba(0,0,0,0.25)',
                  transition:
                    'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </button>

            <span
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: registrationOpen
                  ? '#059669'
                  : '#dc2626',
                minWidth: '95px'
              }}
            >
              {registrationOpen
                ? '🟢 التسجيل مفتوح'
                : '🔴 التسجيل مغلق'}
            </span>
          </div>

          {/* Excel */}
          <button
            type="button"
            className="button small export-excel-button"
            onClick={handleExportExcel}
            disabled={
              exportingExcel ||
              subscriptions.length === 0
            }
          >
            <Download size={16} />

            <span>
              {exportingExcel
                ? 'جاري إصدار الملف...'
                : 'إصدار ملف Excel'}
            </span>
          </button>

          {/* Add subscription */}
          <button
            type="button"
            className="button small"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>إضافة اشتراك جديد</span>
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Controls Card */}
      <section className="admin-filters-card">
        <div className="admin-filters-grid">

          {/* Search box */}
          <div className="filter-item search-col">
            <label>بحث بالاسم أو رقم الجوال</label>

            <div className="input-with-icon">
              <Search size={16} />

              <input
                type="text"
                placeholder="ابحثي هنا..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="filter-item">
            <label>حالة الطلب</label>

            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="all">جميع الحالات</option>
              <option value="new">جديد</option>
              <option value="under_review">
                قيد المراجعة
              </option>
              <option value="accepted">مقبول</option>
              <option value="completed">مكتمل</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          {/* Package filter */}
          <div className="filter-item">
            <label>الباقة</label>

            <select
              value={packageFilter}
              onChange={e =>
                setPackageFilter(e.target.value)
              }
            >
              <option value="all">جميع الباقات</option>

              {packages.map(p => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline filter */}
          <div className="filter-item">
            <label>صلاحية الاشتراك</label>

            <select
              value={timelineFilter}
              onChange={e =>
                setTimelineFilter(e.target.value)
              }
            >
              <option value="all">
                الكل (نشط ومنتهي)
              </option>

              <option value="active">
                نشط حالياً
              </option>

              <option value="expired">
                منتهي
              </option>

              <option value="upcoming">
                قادم قريباً
              </option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="filter-item">
            <label>الترتيب حسب</label>

            <select
              value={sortBy}
              onChange={e =>
                setSortBy(e.target.value)
              }
            >
              <option value="newest">
                الأحدث تسجيلاً
              </option>

              <option value="oldest">
                الأقدم تسجيلاً
              </option>

              <option value="start_date">
                تاريخ البداية
              </option>

              <option value="end_date">
                تاريخ النهاية
              </option>
            </select>
          </div>

        </div>
      </section>

      {/* Subscriptions Data Table */}
      <section
        className="admin-panel"
        style={{ marginTop: '22px' }}
      >
        <div className="panel-sub-header">
          <span>
            النتائج المعروضة: {filteredSubscriptions.length}{' '}
            اشتراك
          </span>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '50px'
            }}
          >
            <div className="custom-spinner" />

            <p style={{ marginTop: '12px' }}>
              جاري تحميل الاشتراكات...
            </p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="empty-panel">
            <p>
              لم يتم العثور على اشتراكات تطابق خيارات البحث
              والفلترة.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-custom-table">
              <thead>
                <tr>
                  <th>العميلة</th>
                  <th>الجوال</th>
                  <th>الهدف</th>
                  <th>الباقة</th>
                  <th>السعر</th>
                  <th>تاريخ الاشتراك</th>
                  <th>تاريخ البداية</th>
                  <th>تاريخ النهاية والصلاحية</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubscriptions.map(s => {
                  const remaining =
                    getRemainingDaysBadge(
                      s.start_date,
                      s.end_date
                    );

                  return (
                    <tr key={s.id}>

                      {/* العميلة */}
                      <td>
                        <strong>{s.full_name}</strong>

                        <small
                          style={{
                            display: 'block',
                            color: '#888'
                          }}
                        >
                          {s.age} سنة
                        </small>
                      </td>

                      {/* الجوال */}
                      <td>
                        <a
                          href={`https://wa.me/${(s.phone || '').replace(
                            /[^0-9]/g,
                            ''
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="table-phone-link"
                        >
                          <Phone size={12} />

                          <span dir="ltr">
                            {s.phone}
                          </span>
                        </a>
                      </td>

                      {/* الهدف */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            fontWeight: '600',
                            color: '#6b4226'
                          }}
                        >
                          {s.goal || 'غير محدد'}
                        </span>
                      </td>

                      {/* الباقة */}
                      <td>
                        <span>
                          {s.package_name_snapshot ||
                            'باقة مخصصة'}
                        </span>

                        {s.duration_value && (
                          <small
                            style={{
                              display: 'block',
                              color: '#888'
                            }}
                          >
                            {s.duration_value}{' '}
                            {s.duration_unit || 'يوم'}
                          </small>
                        )}
                      </td>

                      {/* السعر */}
                      <td>
                        <strong>
                          {formatPrice(
                            s.package_price_snapshot
                          )}
                        </strong>
                      </td>

                      {/* تاريخ الاشتراك */}
                      <td>
                        {formatDateArabic(
                          s.created_at
                        )}
                      </td>

                      {/* تاريخ البداية */}
                      <td>
                        {formatDateArabic(
                          s.start_date
                        )}
                      </td>

                      {/* تاريخ النهاية والصلاحية */}
                      <td>
                        <div>
                          {formatDateArabic(
                            s.end_date
                          )}
                        </div>

                        <span
                          className={`table-sub-badge ${remaining.className}`}
                        >
                          {remaining.text}
                        </span>
                      </td>

                      {/* الحالة */}
                      <td>
                        <span
                          className={`status-pill status-${s.status}`}
                        >
                          {statusLabels[s.status] ||
                            s.status}
                        </span>
                      </td>

                      {/* الإجراءات */}
                      <td>
                        <div className="table-actions-cell">

                          <button
                            type="button"
                            className="icon-btn"
                            title="عرض التفاصيل والسند"
                            onClick={() =>
                              setSelectedSubForDetails(s)
                            }
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="icon-btn"
                            title="تعديل الاشتراك"
                            onClick={() =>
                              setSelectedSubForEdit(s)
                            }
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            className="icon-btn danger"
                            title="حذف"
                            onClick={() =>
                              setSubToDelete(s)
                            }
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Subscription Details Modal */}
      <SubscriptionDetailsModal
        isOpen={Boolean(selectedSubForDetails)}
        onClose={() =>
          setSelectedSubForDetails(null)
        }
        subscription={selectedSubForDetails}
        onStatusUpdated={loadData}
      />

      {/* Subscription Form Modal */}
      <SubscriptionFormModal
        isOpen={
          showAddModal ||
          Boolean(selectedSubForEdit)
        }
        onClose={() => {
          setShowAddModal(false);
          setSelectedSubForEdit(null);
        }}
        subscription={selectedSubForEdit}
        packages={packages}
        onSaved={loadData}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={Boolean(subToDelete)}
        onClose={() => setSubToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="حذف الاشتراك"
        message={`هل أنت متأكدة من حذف اشتراك (${subToDelete?.full_name})؟`}
      />

      {/* Close Registration Modal */}
      {showCloseRegistrationModal && (
        <div className="registration-modal-overlay">
          <div className="registration-modal">

            <div className="registration-modal-header">
              <div>
                <h3>إغلاق التسجيل</h3>

                <p>
                  اكتبي الرسالة التي ستظهر للزوار عند إغلاق التسجيل.
                </p>
              </div>

              <button
                type="button"
                className="registration-modal-close"
                onClick={() =>
                  setShowCloseRegistrationModal(false)
                }
                disabled={togglingReg}
              >
                ×
              </button>
            </div>

            <div className="registration-modal-body">
              <label htmlFor="registration-close-message">
                رسالة الإغلاق
              </label>

              <textarea
                id="registration-close-message"
                value={closeRegistrationMessage}
                onChange={e =>
                  setCloseRegistrationMessage(
                    e.target.value
                  )
                }
                placeholder="مثال: التسجيل مغلق حاليًا بسبب اكتمال المقاعد، وسيتم فتح التسجيل قريبًا."
                rows={5}
                disabled={togglingReg}
              />

              <span className="registration-modal-hint">
                هذه الرسالة ستظهر للزوار بدل نموذج التسجيل.
              </span>
            </div>

            <div className="registration-modal-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() =>
                  setShowCloseRegistrationModal(false)
                }
                disabled={togglingReg}
              >
                إلغاء
              </button>

              <button
                type="button"
                className="button"
                onClick={handleConfirmCloseRegistration}
                disabled={togglingReg}
              >
                {togglingReg
                  ? 'جاري الحفظ...'
                  : 'إغلاق التسجيل'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}