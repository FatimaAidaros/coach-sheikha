import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { saveSubscription, uploadReceiptFile } from '../../services/api';
import { calculateEndDate } from '../../utils/dateUtils';
import { Upload, AlertCircle } from 'lucide-react';

export default function SubscriptionFormModal({
  isOpen,
  onClose,
  subscription = null,
  packages = [],
  onSaved
}) {
  const isEditing = Boolean(subscription?.id);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('25');
  const [phone, setPhone] = useState('');
  const [packageId, setPackageId] = useState('');
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [durationValue, setDurationValue] = useState('30');
  const [durationUnit, setDurationUnit] = useState('يوم');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subscription) {
      setFullName(subscription.full_name || '');
      setAge(String(subscription.age || 25));
      setPhone(subscription.phone || '');
      setPackageId(subscription.package_id || '');
      setPackageName(subscription.package_name_snapshot || '');
      setPackagePrice(String(subscription.package_price_snapshot || 0));
      setStartDate(subscription.start_date || '');
      setDurationValue(String(subscription.duration_value || 30));
      setDurationUnit(subscription.duration_unit || 'يوم');
      setEndDate(subscription.end_date || '');
      setStatus(subscription.status || 'new');
      setNotes(subscription.notes || '');
      setReceiptFile(subscription.receipt_file || null);
      setPreviewUrl(subscription.receipt_preview_url || null);
    } else {
      // Defaults for new subscription
      const todayStr = new Date().toISOString().split('T')[0];

      setFullName('');
      setAge('25');
      setPhone('');

      const defaultPack = packages[0];

      setPackageId(defaultPack?.id || '');
      setPackageName(defaultPack?.name || 'باقة مخصصة');
      setPackagePrice(String(defaultPack?.price || 120));
      setStartDate(todayStr);
      setDurationValue(String(defaultPack?.duration_value || 30));
      setDurationUnit(defaultPack?.duration_unit || 'يوم');

      setEndDate(
        calculateEndDate(
          todayStr,
          defaultPack?.duration_value || 30,
          defaultPack?.duration_unit || 'يوم'
        )
      );

      setStatus('new');
      setNotes('');
      setReceiptFile(null);
      setPreviewUrl(null);
    }

    setError('');
  }, [subscription, packages, isOpen]);

  // When package selection changes in form, sync defaults
  function handlePackageChange(id) {
    setPackageId(id);

    const found = packages.find(p => p.id === id);

    if (found) {
      setPackageName(found.name);
      setPackagePrice(String(found.price));

      const durVal = found.duration_value || 30;
      const durUnit = found.duration_unit || 'يوم';

      setDurationValue(String(durVal));
      setDurationUnit(durUnit);

      if (startDate) {
        setEndDate(
          calculateEndDate(startDate, durVal, durUnit)
        );
      }
    }
  }

  // When start date or duration changes, auto-calculate end date
  function handleStartDateChange(date) {
    setStartDate(date);

    if (date) {
      setEndDate(
        calculateEndDate(
          date,
          durationValue,
          durationUnit
        )
      );
    }
  }

  function handleDurationChange(val) {
    setDurationValue(val);

    if (startDate) {
      setEndDate(
        calculateEndDate(
          startDate,
          val,
          durationUnit
        )
      );
    }
  }

  function handleFileChange(e) {
    const chosenFile = e.target.files?.[0] || null;

    if (!chosenFile) return;

    // Clean up temporary object URL if previously generated during this modal session
    if (
      previewUrl &&
      previewUrl.startsWith('blob:') &&
      previewUrl !== subscription?.receipt_preview_url
    ) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (err) {
        console.warn(
          'Failed to revoke temporary object URL:',
          err
        );
      }
    }

    const newUrl = URL.createObjectURL(chosenFile);

    setReceiptFile(chosenFile);
    setPreviewUrl(newUrl);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      return setError('يرجى إدخال اسم العميلة.');
    }

    if (!phone.trim()) {
      return setError('يرجى إدخال رقم الجوال.');
    }

    setLoading(true);

    try {
      let receiptPath =
        subscription?.payment_receipt_path || 'no-file';

      if (receiptFile instanceof File) {
        receiptPath = await uploadReceiptFile(receiptFile);
      }

      const payload = {
        full_name: fullName.trim(),
        age: parseInt(age, 10),
        phone: phone.trim(),

        package_id: packageId || null,

        package_name_snapshot:
          packageName || 'باقة مخصصة',

        package_price_snapshot:
          Number(packagePrice) || 0,

        payment_receipt_path: receiptPath,

        receipt_file: receiptFile,
        receipt_preview_url: previewUrl,

        notes: notes.trim(),

        status,

        start_date: startDate || null,
        end_date: endDate || null,

        duration_value:
          Number(durationValue) || 30,

        duration_unit:
          durationUnit || 'يوم'
      };

      if (isEditing) {
        payload.id = subscription.id;
      }

      await saveSubscription(payload, receiptFile);

      if (onSaved) {
        onSaved();
      }

      onClose();

    } catch (err) {
      setError(
        err.message || 'فشل حفظ بيانات الاشتراك.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (
      previewUrl &&
      previewUrl.startsWith('blob:') &&
      previewUrl !== subscription?.receipt_preview_url
    ) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (err) {
        console.warn(
          'Failed to revoke temporary object URL:',
          err
        );
      }
    }

    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={
        isEditing
          ? 'تعديل بيانات الاشتراك'
          : 'إضافة اشتراك يدوي جديد'
      }
      maxWidth="680px"
    >
      <form
        onSubmit={handleSubmit}
        className="admin-modal-form"
      >

        {error && (
          <div
            className="form-status error"
            style={{ marginBottom: '14px' }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="admin-form-grid">

          <label>
            <span>الاسم الكامل *</span>

            <input
              required
              value={fullName}
              onChange={e =>
                setFullName(e.target.value)
              }
              placeholder="سارة محمد"
            />
          </label>

          <label>
            <span>رقم الجوال (واتساب) *</span>

            <input
              required
              value={phone}
              onChange={e =>
                setPhone(e.target.value)
              }
              placeholder="05xxxxxxxx"
            />
          </label>

          <label>
            <span>العمر *</span>

            <input
              type="number"
              required
              min="12"
              max="100"
              value={age}
              onChange={e =>
                setAge(e.target.value)
              }
            />
          </label>

          <label>
            <span>الباقة</span>

            <select
              value={packageId}
              onChange={e =>
                handlePackageChange(e.target.value)
              }
            >
              {packages.map(p => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.name} ({p.price} ر.س)
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>اسم الباقة المحفوظ (Snapshot)</span>

            <input
              value={packageName}
              onChange={e =>
                setPackageName(e.target.value)
              }
            />
          </label>

          <label>
            <span>السعر (ر.س)</span>

            <input
              type="number"
              value={packagePrice}
              onChange={e =>
                setPackagePrice(e.target.value)
              }
            />
          </label>

          <label>
            <span>تاريخ البداية</span>

            <input
              type="date"
              value={startDate}
              onChange={e =>
                handleStartDateChange(
                  e.target.value
                )
              }
            />
          </label>

          <div className="duration-split-group">

            <label>
              <span>مدة الاشتراك</span>

              <input
                type="number"
                min="1"
                value={durationValue}
                onChange={e =>
                  handleDurationChange(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              <span>الوحدة</span>

              <select
                value={durationUnit}
                onChange={e =>
                  setDurationUnit(
                    e.target.value
                  )
                }
              >
                <option value="يوم">يوم</option>
                <option value="أسبوع">أسبوع</option>
                <option value="شهر">شهر</option>
              </select>
            </label>

          </div>

          <label className="span-2">
            <span>
              تاريخ النهاية (يُحسب تلقائياً أو يمكن تعديله يدوياً)
            </span>

            <input
              type="date"
              value={endDate}
              onChange={e =>
                setEndDate(e.target.value)
              }
            />
          </label>

          <label className="span-2">
            <span>حالة الاشتراك</span>

            <select
              value={status}
              onChange={e =>
                setStatus(e.target.value)
              }
            >
              <option value="new">جديد</option>
              <option value="under_review">
                قيد المراجعة
              </option>
              <option value="accepted">
                مقبول
              </option>
              <option value="completed">
                مكتمل
              </option>
              <option value="rejected">
                مرفوض
              </option>
            </select>
          </label>


          {/* تنبيه صحي قبل الدفع */}

          <div className="health-warning span-2">

            <div className="health-warning-title">
              <span className="health-warning-icon">
                <AlertCircle size={17} />
              </span>

              <strong>تنبيه</strong>
            </div>

            <p>
              لا يتم استقبال المشاكل الصحية التي تحتاج
              إشراف دكتور بشكل دوري مثل (السكري، الديدان،
              لخبطة الهرمونات، أمراض المعدة الحادة،
              مشاكل الغدة الدرقية، أمراض القلب، أمراض
              الكبد، الفشل الكلوي، سوء التغذية الحاد الذي
              يحتاج تغذية أنبوبية أو وريدية).
            </p>

          </div>


          <label className="span-2">
            <span>إرفاق أو استبدال سند الدفع</span>

            <div className="admin-file-picker">

              <Upload size={18} />

              <span>
                {receiptFile
                  ? receiptFile.name
                  : subscription?.payment_receipt_path &&
                    subscription.payment_receipt_path !== 'no-file'
                  ? `الملف الحالي: ${subscription.payment_receipt_path}`
                  : 'اختيار ملف جديد...'}
              </span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                onChange={handleFileChange}
              />

            </div>

            {previewUrl &&
              !receiptFile?.name
                ?.toLowerCase()
                .endsWith('.pdf') && (
                <div className="form-receipt-thumbnail-preview">

                  <img
                    src={previewUrl}
                    alt="معاينة السند"
                  />

                  <span>
                    معاينة السند المرفق
                  </span>

                </div>
              )}

          </label>

          <label className="span-2">
            <span>ملاحظات إضافية</span>

            <textarea
              rows="3"
              value={notes}
              onChange={e =>
                setNotes(e.target.value)
              }
              placeholder="أي تفاصيل أخرى..."
            />
          </label>

        </div>

        <div className="admin-form-actions">

          <button
            type="button"
            className="button outline small"
            onClick={handleCancel}
            disabled={loading}
          >
            إلغاء
          </button>

          <button
            type="submit"
            className="button small"
            disabled={loading}
          >
            {loading
              ? 'جاري الحفظ...'
              : isEditing
              ? 'حفظ التعديلات'
              : 'إضافة الاشتراك'}
          </button>

        </div>

      </form>
    </Modal>
  );
}