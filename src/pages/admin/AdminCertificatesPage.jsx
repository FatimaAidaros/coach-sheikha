import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Award,
  AlertCircle,
  Upload
} from 'lucide-react';
import { getCertificates, saveCertificate, deleteCertificate, uploadPublicImage } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [editingCert, setEditingCert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  async function load() {
    try {
      setLoading(true);
      const data = await getCertificates();
      setCertificates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleOpenAdd() {
    setEditingCert(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setIsPublished(true);
    setDisplayOrder(certificates.length + 1);
    setError('');
    setShowModal(true);
  }

  function handleOpenEdit(cert) {
    setEditingCert(cert);
    setTitle(cert.title || cert.name || '');
    setDescription(cert.description || '');
    setImageUrl(cert.image_url || '');
    setIsPublished(cert.is_published !== false);
    setDisplayOrder(cert.display_order || 0);
    setError('');
    setShowModal(true);
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError('');
      const publicUrl = await uploadPublicImage('certificates', file);
      setImageUrl(publicUrl);
    } catch (err) {
      console.error('Upload certificate image error:', err);
      setError('فشل رفع صورة الشهادة: ' + (err.message || 'يرجى المحاولة مرة أخرى'));
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('عنوان الشهادة مطلوب.');

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || null,
        is_published: isPublished,
        display_order: Number(displayOrder) || 0
      };

      if (editingCert) {
        payload.id = editingCert.id;
      }

      await saveCertificate(payload);
      await load();
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'فشل حفظ الشهادة.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(cert) {
    try {
      await saveCertificate({
        ...cert,
        is_published: !cert.is_published
      });
      load();
    } catch (err) {
      console.error(err.message);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    try {
      await deleteCertificate(deletingId);
      setCertificates(prev => prev.filter(c => c.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div className="admin-certificates-page">
      <div className="admin-page-header-row">
        <div>
          <h1>إدارة الشهادات والاعتمادات</h1>
          <p>عرض وتوثيق الشهادات الأكاديمية والمهنية المعروضة في الموقع</p>
        </div>
        <div className="admin-page-header-actions">
          <button type="button" className="button small" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>إضافة شهادة جديدة</span>
          </button>
        </div>
      </div>

      <section className="admin-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="custom-spinner" />
            <p style={{ marginTop: '12px' }}>جاري تحميل الشهادات...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="empty-panel">
            <p>لا توجد شهادات مضافة بعد.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-custom-table">
              <thead>
                <tr>
                  <th>الترتيب</th>
                  <th>صورة الشهادة</th>
                  <th>عنوان الشهادة</th>
                  <th>الوصف</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map(c => {
                  const isPub = c.is_published !== false;
                  return (
                    <tr key={c.id}>
                      <td>#{c.display_order || 0}</td>
                      <td>
                        {c.image_url ? (
                          <img
                            src={c.image_url}
                            alt={c.title}
                            style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #decabb' }}
                          />
                        ) : (
                          <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: '#f5e9e0', display: 'grid', placeItems: 'center', color: '#825126' }}>
                            <Award size={20} />
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{c.title}</strong>
                      </td>
                      <td>
                        <span>{c.description || '—'}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${isPub ? 'published' : 'draft'}`}
                          onClick={() => handleTogglePublish(c)}
                        >
                          {isPub ? <Eye size={14} /> : <EyeOff size={14} />}
                          <span>{isPub ? 'معروضة' : 'مخفية'}</span>
                        </button>
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            className="icon-btn"
                            title="تعديل"
                            onClick={() => handleOpenEdit(c)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="حذف"
                            onClick={() => setDeletingId(c.id)}
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

      {/* Certificate Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCert ? 'تعديل الشهادة' : 'إضافة شهادة جديدة'}
        maxWidth="550px"
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
              <span>اسم / عنوان الشهادة *</span>
              <input
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: Mezan Academy Certificate"
              />
            </label>

            <label className="span-2">
              <span>الوصف أو التخصص المعتمد</span>
              <textarea
                rows="3"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="تدريب وتغذية رياضية معتمدة..."
              />
            </label>

            <div className="span-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>صورة الشهادة</span>
              {imageUrl && (
                <div style={{ marginBottom: '8px' }}>
                  <img
                    src={imageUrl}
                    alt="معاينة الشهادة"
                    style={{
                      maxHeight: '140px',
                      maxWidth: '100%',
                      borderRadius: '8px',
                      border: '1px solid #decabb',
                      objectFit: 'contain',
                      background: '#fffaf6',
                      padding: '4px'
                    }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="button outline small" style={{ cursor: uploadingImage ? 'not-allowed' : 'pointer' }}>
                  <Upload size={16} />
                  <span>{uploadingImage ? 'جاري رفع الصورة إلى التخزين...' : imageUrl ? 'تغيير الصورة من الجهاز' : 'اختيار صورة من الجهاز'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={uploadingImage}
                    onChange={handleFileSelect}
                  />
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    className="button outline small"
                    style={{ border: '1px solid #b91c1c', color: '#b91c1c' }}
                    onClick={() => setImageUrl('')}
                    disabled={uploadingImage}
                  >
                    حذف الصورة
                  </button>
                )}
              </div>
              <small style={{ color: '#7e6957', marginTop: '4px' }}>
                يتم رفع الصورة تلقائياً إلى Storage Bucket (certificates).
              </small>
            </div>

            <label className="span-2">
              <span>رابط صورة الشهادة (يمكن التعديل يدوياً)</span>
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://... أو مسار الصورة"
                dir="ltr"
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

            <div className="admin-checkbox-row span-2">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                />
                <span>إظهار الشهادة في الصفحة الرئيسية</span>
              </label>
            </div>
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
              {submitting ? 'جاري الحفظ...' : editingCert ? 'حفظ التعديلات' : 'إضافة الشهادة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="حذف الشهادة"
        message="هل أنت متأكدة من حذف هذه الشهادة نهائياً؟"
      />
    </div>
  );
}
