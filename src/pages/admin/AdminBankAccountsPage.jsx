import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';

import {
  getBanks,
  saveBankAccount,
  deleteBankAccount
} from '../../services/api';

import { supabase } from '../../lib/supabase';

import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminBankAccountsPage() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [editingBank, setEditingBank] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('شيخة');
  const [accountNumber, setAccountNumber] = useState('');

  // صورة البنك
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [isPublished, setIsPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  async function load() {
    try {
      setLoading(true);

      const data = await getBanks();

      setBanks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetImage() {
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
  }

  function handleOpenAdd() {
    setEditingBank(null);

    setBankName('');
    setAccountName('شيخة');
    setAccountNumber('');

    resetImage();

    setIsPublished(true);
    setDisplayOrder(banks.length + 1);

    setError('');
    setShowModal(true);
  }

  function handleOpenEdit(b) {
    setEditingBank(b);

    setBankName(b.bank_name || b.name || '');
    setAccountName(b.account_name || b.owner || '');
    setAccountNumber(b.account_number || b.account || '');

    setImageUrl(b.image_url || '');
    setImageFile(null);
    setImagePreview(b.image_url || '');

    setIsPublished(b.is_published !== false);
    setDisplayOrder(b.display_order || 0);

    setError('');
    setShowModal(true);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    // السماح فقط بصور
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة فقط.');
      return;
    }

    // الحد الأقصى 3MB
    if (file.size > 3 * 1024 * 1024) {
      setError('حجم صورة الشعار يجب ألا يتجاوز 3 ميجابايت.');
      return;
    }

    setError('');

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  }

  async function uploadBankLogo() {
    if (!imageFile) {
      return imageUrl || null;
    }

    const fileExt =
      imageFile.name.split('.').pop()?.toLowerCase() || 'png';

    const fileName = `bank-logo-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${fileExt}`;

    const filePath = `bank-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('خطأ رفع شعار البنك:', uploadError);
      throw new Error(
        'فشل رفع شعار البنك. تأكدي من إعدادات Storage.'
      );
    }

    const { data } = supabase.storage
      .from('site-images')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('تعذر الحصول على رابط صورة شعار البنك.');
    }

    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!bankName.trim()) {
      return setError('اسم البنك مطلوب.');
    }

    if (!accountNumber.trim()) {
      return setError('رقم الحساب أو الآيبان مطلوب.');
    }

    setSubmitting(true);
    setError('');

    try {
      // رفع الصورة أولًا إذا تم اختيار صورة جديدة
      const finalImageUrl = await uploadBankLogo();

      const payload = {
        bank_name: bankName.trim(),
        account_name: accountName.trim(),
        account_number: accountNumber.trim(),

        image_url: finalImageUrl || null,

        is_published: isPublished,
        display_order: Number(displayOrder) || 0
      };

      if (editingBank) {
        payload.id = editingBank.id;
      }

      await saveBankAccount(payload);

      await load();

      setShowModal(false);
    } catch (err) {
      console.error(err);

      setError(
        err.message || 'فشل حفظ الحساب البنكي.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(b) {
    try {
      await saveBankAccount({
        ...b,
        is_published: !b.is_published
      });

      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;

    try {
      await deleteBankAccount(deletingId);

      setBanks(prev =>
        prev.filter(b => b.id !== deletingId)
      );

      setDeletingId(null);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="admin-banks-page">

      {/* Header */}

      <div className="admin-page-header-row">

        <div>
          <h1>إدارة الحسابات البنكية</h1>

          <p>
            الحسابات المعتمدة المعروضة للمشتركات للتحويل في صفحة الاشتراك
          </p>
        </div>

        <div className="admin-page-header-actions">

          <button
            type="button"
            className="button small"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />

            <span>
              إضافة حساب بنكي
            </span>
          </button>

        </div>

      </div>

      {/* Banks Table */}

      <section className="admin-panel">

        {loading ? (

          <div
            style={{
              textAlign: 'center',
              padding: '40px'
            }}
          >
            <div className="custom-spinner" />

            <p style={{ marginTop: '12px' }}>
              جاري تحميل الحسابات...
            </p>
          </div>

        ) : banks.length === 0 ? (

          <div className="empty-panel">
            <p>
              لا توجد حسابات بنكية مضافة بعد.
            </p>
          </div>

        ) : (

          <div className="table-responsive">

            <table className="admin-custom-table">

              <thead>

                <tr>
                  <th>الترتيب</th>
                  <th>اسم البنك</th>
                  <th>صاحب الحساب</th>
                  <th>رقم الحساب</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>

              </thead>

              <tbody>

                {banks.map(b => {

                  const isPub =
                    b.is_published !== false;

                  return (

                    <tr key={b.id}>

                      <td>
                        #{b.display_order || 0}
                      </td>

                      <td>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >

                          {b.image_url ? (
                            <img
                              src={b.image_url}
                              alt=""
                              style={{
                                width: '38px',
                                height: '38px',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                border: '1px solid #eee',
                                background: '#fff',
                                padding: '4px',
                                boxSizing: 'border-box'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                background: '#f5f0ec',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: '#8b5e3c'
                                }}
                              >
                                بدون شعار
                              </span>
                            </div>
                          )}

                          <strong>
                            {b.bank_name || b.name}
                          </strong>

                        </div>

                      </td>

                      <td>
                        {b.account_name ||
                          b.owner ||
                          '—'}
                      </td>

                      <td>

                        <code
                          dir="ltr"
                          style={{
                            fontSize: '15px',
                            fontWeight: 'bold'
                          }}
                        >
                          {b.account_number ||
                            b.account}
                        </code>

                      </td>

                      <td>

                        <button
                          type="button"
                          className={`status-toggle-btn ${
                            isPub
                              ? 'published'
                              : 'draft'
                          }`}
                          onClick={() =>
                            handleTogglePublish(b)
                          }
                        >

                          {isPub ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}

                          <span>
                            {isPub
                              ? 'مفعل'
                              : 'معطل'}
                          </span>

                        </button>

                      </td>

                      <td>

                        <div className="table-actions-cell">

                          <button
                            type="button"
                            className="icon-btn"
                            title="تعديل"
                            onClick={() =>
                              handleOpenEdit(b)
                            }
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            className="icon-btn danger"
                            title="حذف"
                            onClick={() =>
                              setDeletingId(b.id)
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

      {/* Add / Edit Modal */}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingBank
            ? 'تعديل الحساب البنكي'
            : 'إضافة حساب بنكي جديد'
        }
        maxWidth="500px"
      >

        <form
          onSubmit={handleSubmit}
          className="admin-modal-form"
        >

          {error && (

            <div
              className="form-status error"
              style={{
                marginBottom: '14px'
              }}
            >

              <AlertCircle size={18} />

              <span>
                {error}
              </span>

            </div>

          )}

          <div className="admin-form-grid">

            {/* Bank Name */}

            <label className="span-2">

              <span>
                اسم البنك أو المصرف *
              </span>

              <input
                required
                value={bankName}
                onChange={e =>
                  setBankName(e.target.value)
                }
                placeholder="مثال: شركة العمقي وإخوانه"
              />

            </label>

            {/* Account Name */}

            <label className="span-2">

              <span>
                اسم المستفيد / صاحب الحساب
              </span>

              <input
                value={accountName}
                onChange={e =>
                  setAccountName(e.target.value)
                }
                placeholder="شيخة"
              />

            </label>

            {/* Account Number */}

            <label className="span-2">

              <span>
                رقم الحساب أو الآيبان *
              </span>

              <input
                required
                dir="ltr"
                value={accountNumber}
                onChange={e =>
                  setAccountNumber(e.target.value)
                }
                placeholder="254092562"
              />

            </label>

            {/* Display Order */}

            <label>

              <span>
                ترتيب العرض
              </span>

              <input
                type="number"
                value={displayOrder}
                onChange={e =>
                  setDisplayOrder(e.target.value)
                }
              />

            </label>

            {/* Bank Logo Upload */}

            <div className="span-2">

              <span
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600'
                }}
              >
                شعار البنك
              </span>

              {imagePreview ? (

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '150px',
                    border: '1px solid #decabb',
                    borderRadius: '12px',
                    background: '#faf8f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '15px',
                    boxSizing: 'border-box'
                  }}
                >

                  <img
                    src={imagePreview}
                    alt="معاينة شعار البنك"
                    style={{
                      maxWidth: '180px',
                      maxHeight: '120px',
                      objectFit: 'contain'
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={submitting}
                    title="حذف الشعار"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      width: '32px',
                      height: '32px',
                      border: 'none',
                      borderRadius: '50%',
                      background: '#fff',
                      color: '#8b5e3c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow:
                        '0 2px 8px rgba(0,0,0,0.10)'
                    }}
                  >
                    <X size={17} />
                  </button>

                </div>

              ) : (

                <label
                  style={{
                    width: '100%',
                    minHeight: '130px',
                    border: '1.5px dashed #c9b4a5',
                    borderRadius: '12px',
                    background: '#faf8f6',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: submitting
                      ? 'not-allowed'
                      : 'pointer',
                    boxSizing: 'border-box'
                  }}
                >

                  <Upload
                    size={28}
                    color="#8b5e3c"
                  />

                  <strong
                    style={{
                      color: '#6b4226',
                      fontSize: '14px'
                    }}
                  >
                    اختيار شعار البنك
                  </strong>

                  <small
                    style={{
                      color: '#888',
                      fontSize: '12px'
                    }}
                  >
                    PNG أو JPG أو WEBP — حتى 3MB
                  </small>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    disabled={submitting}
                    style={{
                      display: 'none'
                    }}
                  />

                </label>

              )}

            </div>

            {/* Publish */}

            <div className="admin-checkbox-row span-2">

              <label className="checkbox-label">

                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e =>
                    setIsPublished(
                      e.target.checked
                    )
                  }
                />

                <span>
                  تفعيل وظهور الحساب في صفحة الاشتراك
                </span>

              </label>

            </div>

          </div>

          {/* Actions */}

          <div className="admin-form-actions">

            <button
              type="button"
              className="button outline small"
              onClick={() =>
                setShowModal(false)
              }
              disabled={submitting}
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="button small"
              disabled={submitting}
            >
              {submitting
                ? 'جاري الحفظ...'
                : editingBank
                  ? 'حفظ التعديلات'
                  : 'إضافة الحساب'}
            </button>

          </div>

        </form>

      </Modal>

      {/* Delete Confirm */}

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="حذف الحساب البنكي"
        message="هل أنت متأكدة من حذف هذا الحساب البنكي نهائياً؟"
      />

    </div>
  );
}