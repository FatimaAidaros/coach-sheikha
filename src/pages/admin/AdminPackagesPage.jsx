import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react';
import { getPackages, savePackage, deletePackage, isPackageCurrentlyAvailable } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatPrice } from '../../utils/formatters';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [editingPackage, setEditingPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [packageType, setPackageType] = useState('basic');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [durationValue, setDurationValue] = useState(30);
  const [durationUnit, setDurationUnit] = useState('يوم');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  async function load() {
    try {
      setLoading(true);
      const data = await getPackages();
      setPackages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);
  const packageTypes = [
  ...new Map(
    [
      { value: 'basic', label: 'الباقة الأساسية' },
      { value: 'custom', label: 'الباقة المخصصة' },
      { value: 'comprehensive', label: 'الباقات الشاملة' },
      ...packages
        .filter(p => p.package_type)
        .map(p => ({
          value: p.package_type,
          label:
            p.package_type === 'basic'
              ? 'الباقة الأساسية'
              : p.package_type === 'custom'
                ? 'الباقة المخصصة'
                : p.package_type === 'comprehensive'
                  ? 'الباقات الشاملة'
                  : p.package_type
        }))
    ].map(type => [type.value, type])
  ).values()
];
  function handleOpenAdd() {
    setEditingPackage(null);
    setName('');
    setPackageType('basic');
    setSlug('');
    setPrice('150');
    setBadge('');
    setDescription('');
    setFeaturesText('خطة غذائية متكاملة\nمتابعة مستمرة\nتعديل الخطة');
    setDurationValue(30);
    setDurationUnit('يوم');
    setIsAvailable(true);
    setIsPublished(true);
    setDisplayOrder(packages.length + 1);
    setError('');
    setShowModal(true);
  }

  function handleOpenEdit(pkg) {
    setEditingPackage(pkg);
    setName(pkg.name || '');
    setPackageType(pkg.package_type || (pkg.slug?.includes('custom') || pkg.name?.includes('مخصص') ? 'custom' : 'basic'));
    setSlug(pkg.slug || '');
    setPrice(String(pkg.price || ''));
    setBadge(pkg.badge || '');
    setDescription(pkg.description || '');
    setFeaturesText(Array.isArray(pkg.features) ? pkg.features.join('\n') : '');
    setDurationValue(pkg.duration_value || 30);
    setDurationUnit(pkg.duration_unit || 'يوم');
    setIsAvailable(pkg.is_available !== false);
    setIsPublished(pkg.is_published !== false);
    setDisplayOrder(pkg.display_order || 0);
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('اسم الباقة مطلوب.');
    if (!price) return setError('سعر الباقة مطلوب.');

    setSubmitting(true);
    setError('');

    try {
      const features = featuresText
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        package_type: packageType,
        slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
        price: Number(price),
        badge: badge.trim() || null,
        description: description.trim(),
        features,
        duration_value: Number(durationValue) || 30,
        duration_unit: durationUnit,
        is_available: isAvailable,
        is_published: isPublished,
        display_order: Number(displayOrder) || 0
      };

      if (editingPackage) {
        payload.id = editingPackage.id;
      }

      await savePackage(payload);
      await load();
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'فشل حفظ الباقة.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleAvailability(pkg) {
    try {
      const currentAvailable = isPackageCurrentlyAvailable(pkg);
      await savePackage({
        ...pkg,
        is_available: !currentAvailable
      });
      load();
    } catch (err) {
      console.error(err.message);
    }
  }

  async function handleTogglePublish(pkg) {
    try {
      await savePackage({
        ...pkg,
        is_published: !pkg.is_published
      });
      load();
    } catch (err) {
      console.error(err.message);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    try {
      await deletePackage(deletingId);
      setPackages(prev => prev.filter(p => p.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div className="admin-packages-page">
      <div className="admin-page-header-row">
        <div>
          <h1>إدارة الباقات التدريبية</h1>
          <p>التحكم في أسعار وميزات ومدد الباقات وحالة التوفر والظهور</p>
        </div>
        <div className="admin-page-header-actions">
          <button type="button" className="button small" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>إضافة باقة جديدة</span>
          </button>
        </div>
      </div>

      <section className="admin-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="custom-spinner" />
            <p style={{ marginTop: '12px' }}>جاري تحميل الباقات...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="empty-panel">
            <p>لا توجد أي باقات حالياً.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-custom-table">
              <thead>
                <tr>
                  <th>الترتيب</th>
                  <th>اسم الباقة</th>
                  <th>السعر</th>
                  <th>المدة</th>
                  <th>الشارة (Badge)</th>
                  <th>حالة التوفر (Available)</th>
                  <th>الظهور (Published)</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(p => {
                  const isAvail = isPackageCurrentlyAvailable(p);
                  const isPub = p.is_published !== false;
                  return (
                    <tr key={p.id}>
                      <td>#{p.display_order || 0}</td>
                      <td>
                        <strong>{p.name}</strong>
                        <small style={{ display: 'block', color: '#888' }}>
                          الرمز: <code>{p.slug}</code>
                        </small>
                      </td>
                      <td>
                        <strong>{formatPrice(p.price)}</strong>
                      </td>
                      <td>
                        <span className="duration-pill">
                          <Clock size={12} /> {p.duration_value} {p.duration_unit || 'يوم'}
                        </span>
                      </td>
                      <td>
                        {p.badge ? <span className="badge-preview">{p.badge}</span> : '—'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${isAvail ? 'available' : 'closed'}`}
                          onClick={() => handleToggleAvailability(p)}
                          title="انقري للتبديل بين متوفر وغير متوفر"
                        >
                          {isAvail ? <Unlock size={14} /> : <Lock size={14} />}
                          <span>{isAvail ? 'متوفر' : 'غير متوفر'}</span>
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${isPub ? 'published' : 'draft'}`}
                          onClick={() => handleTogglePublish(p)}
                          title="انقري للتبديل بين معروض ومخفي"
                        >
                          {isPub ? <Eye size={14} /> : <EyeOff size={14} />}
                          <span>{isPub ? 'منشورة' : 'مخفية'}</span>
                        </button>
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            className="icon-btn"
                            title="تعديل الباقة"
                            onClick={() => handleOpenEdit(p)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="حذف الباقة"
                            onClick={() => setDeletingId(p.id)}
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

      {/* Package Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPackage ? 'تعديل الباقة التدريبية' : 'إضافة باقة تدريبية جديدة'}
        maxWidth="620px"
      >
        <form onSubmit={handleSubmit} className="admin-modal-form">
          {error && (
            <div className="form-status error" style={{ marginBottom: '14px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-form-grid">
            <label className="span-2">
              <span>اسم الباقة *</span>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="مثال: باقة مخصصة متابعة يومية"
              />
            </label>

            <label className="span-2">
              <span>نوع الباقة *</span>
              <select
  value={packageType}
  onChange={e => setPackageType(e.target.value)}
  required
>
  {packageTypes.map(type => (
    <option key={type.value} value={type.value}>
      {type.label}
    </option>
  ))}
</select>
            </label>

            <label>
              <span>الرمز اللطيف (Slug)</span>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="custom-daily"
              />
            </label>

            <label>
              <span>السعر (ر.س) *</span>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="200"
              />
            </label>

            <label>
              <span>الشارة الترويجية (Badge)</span>
              <input
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder="الأكثر طلباً، VIP..."
              />
            </label>

            <label>
              <span>ترتيب العرض</span>
              <input
                type="number"
                value={displayOrder}
                onChange={e => setDisplayOrder(e.target.value)}
              />
            </label>

            <div className="duration-split-group span-2">
              <label>
                <span>مدة الاشتراك</span>
                <input
                  type="number"
                  min="1"
                  value={durationValue}
                  onChange={e => setDurationValue(e.target.value)}
                />
              </label>
              <label>
                <span>وحدة المدة</span>
                <select
                  value={durationUnit}
                  onChange={e => setDurationUnit(e.target.value)}
                >
                  <option value="يوم">يوم</option>
                  <option value="أسبوع">أسبوع</option>
                  <option value="شهر">شهر</option>
                </select>
              </label>
            </div>

            {/* حالة توفر الباقة */}
            <div className="span-2" style={{ marginBottom: '6px' }}>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '13.5px', marginBottom: '8px', color: '#553e2e' }}>
                حالة توفر الباقة للاشتراك *
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAvailable(true)}
                  style={{
                    flex: '1',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: isAvailable ? '2px solid #16a34a' : '1.5px solid #d1d5db',
                    background: isAvailable ? '#f0fdf4' : '#fff',
                    color: isAvailable ? '#15803d' : '#6b7280',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a' }}></span>
                  <span>متوفر</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAvailable(false)}
                  style={{
                    flex: '1',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: !isAvailable ? '2px solid #dc2626' : '1.5px solid #d1d5db',
                    background: !isAvailable ? '#fef2f2' : '#fff',
                    color: !isAvailable ? '#b91c1c' : '#6b7280',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }}></span>
                  <span>غير متوفر</span>
                </button>
              </div>
            </div>

            <div className="admin-checkbox-row span-2">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                />
                <span>منشورة ومعروضة في الموقع (Published)</span>
              </label>
            </div>

            <label className="span-2">
              <span>وصف الباقة</span>
              <textarea
                rows="2"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="وصف مختصر للباقة..."
              />
            </label>

            <label className="span-2">
              <span>المميزات (اكتبي كل ميزة في سطر منفصل)</span>
              <textarea
                rows="4"
                value={featuresText}
                onChange={e => setFeaturesText(e.target.value)}
                placeholder="خطة غذائية متكاملة&#10;متابعة أسبوعية&#10;إرشادات صحية"
              />
            </label>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="button outline small"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              إلغاء
            </button>
            <button type="submit" className="button small" disabled={submitting}>
              {submitting ? 'جاري الحفظ...' : editingPackage ? 'حفظ التعديلات' : 'إضافة الباقة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="حذف الباقة"
        message="هل أنت متأكدة من حذف هذه الباقة؟ لن تتأثر الاشتراكات التاريخية السابقة التي تمت على هذه الباقة."
      />
    </div>
  );
}
