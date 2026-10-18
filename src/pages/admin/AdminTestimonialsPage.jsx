import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MessageSquareQuote,
  AlertCircle
} from 'lucide-react';
import { getTestimonials, saveTestimonial, deleteTestimonial } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  async function load() {
    try {
      setLoading(true);
      const data = await getTestimonials();
      setTestimonials(data || []);
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
    setEditingTestimonial(null);
    setName('');
    setContent('');
    setImageUrl('');
    setIsPublished(true);
    setDisplayOrder(testimonials.length + 1);
    setError('');
    setShowModal(true);
  }

  function handleOpenEdit(t) {
    setEditingTestimonial(t);
    setName(t.name || '');
    setContent(t.content || t.body || '');
    setImageUrl(t.image_url || '');
    setIsPublished(t.is_published !== false);
    setDisplayOrder(t.display_order || 0);
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('اسم العميلة مطلوب.');
    if (!content.trim()) return setError('نص التجربة أو الرأي مطلوب.');

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        is_published: isPublished,
        display_order: Number(displayOrder) || 0
      };

      if (editingTestimonial) {
        payload.id = editingTestimonial.id;
      }

      await saveTestimonial(payload);
      await load();
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'فشل حفظ تجربة العميلة.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(t) {
    try {
      await saveTestimonial({
        ...t,
        is_published: !t.is_published
      });
      load();
    } catch (err) {
      console.error(err.message);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    try {
      await deleteTestimonial(deletingId);
      setTestimonials(prev => prev.filter(t => t.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div className="admin-testimonials-page">
      <div className="admin-page-header-row">
        <div>
          <h1>إدارة قصص النجاح والآراء</h1>
          <p>عرض وتحديث تجارب المشتركات المعروضة في الصفحة الرئيسية</p>
        </div>
        <div className="admin-page-header-actions">
          <button type="button" className="button small" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>إضافة قصة جديدة</span>
          </button>
        </div>
      </div>

      <section className="admin-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="custom-spinner" />
            <p style={{ marginTop: '12px' }}>جاري تحميل الآراء...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="empty-panel">
            <p>لا توجد قصص نجاح مسجلة بعد.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-custom-table">
              <thead>
                <tr>
                  <th>الترتيب</th>
                  <th>العميلة</th>
                  <th>الرأي / التجربة</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map(t => {
                  const isPub = t.is_published !== false;
                  return (
                    <tr key={t.id}>
                      <td>#{t.display_order || 0}</td>
                      <td>
                        <strong>{t.name}</strong>
                      </td>
                      <td>
                        <p style={{ maxWidth: '400px', margin: 0, fontSize: '13px', color: '#555' }}>
                          "{t.content}"
                        </p>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${isPub ? 'published' : 'draft'}`}
                          onClick={() => handleTogglePublish(t)}
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
                            onClick={() => handleOpenEdit(t)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="حذف"
                            onClick={() => setDeletingId(t.id)}
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

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTestimonial ? 'تعديل التجربة' : 'إضافة قصة نجاح جديدة'}
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
              <span>اسم العميلة *</span>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="نورا محمد"
              />
            </label>

            <label className="span-2">
              <span>نص التجربة أو الرأي *</span>
              <textarea
                rows="4"
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="اكتبي تجربة العميلة ونتائجها مع كوتش شيخة..."
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
                <span>إظهار في الصفحة الرئيسية</span>
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
              {submitting ? 'جاري الحفظ...' : editingTestimonial ? 'حفظ التعديلات' : 'إضافة القصة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="حذف قصة النجاح"
        message="هل أنت متأكدة من حذف هذه القصة نهائياً؟"
      />
    </div>
  );
}
