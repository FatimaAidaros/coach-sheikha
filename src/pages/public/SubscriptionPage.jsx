import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';

import {
  Upload,
  Copy,
  Check,
  Landmark,
  AlertCircle,
  FileCheck,
  Lock,
  Clock
} from 'lucide-react';

import PublicLayout from '../../layouts/PublicLayout';
import SuccessModal from '../../components/public/SuccessModal';

import {
  getPackages,
  getBanks,
  getSiteSettings,
  createSubscription,
  isRegistrationCurrentlyOpen,
  isPackageCurrentlyAvailable,
  getPackageStatusInfo
} from '../../services/api';

import {
  generateWhatsAppSubscriptionMessage,
  buildWhatsAppUrl
} from '../../utils/whatsapp';

import { formatFileSize } from '../../utils/formatters';

export default function SubscriptionPage() {
  const [params] = useSearchParams();
  const packageParam = params.get('package');

  const [packages, setPackages] = useState([]);
  const [banks, setBanks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [chosenPackageId, setChosenPackageId] = useState('');

  // هدف الاشتراك
  const [goal, setGoal] = useState('');

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [copiedBankId, setCopiedBankId] = useState(null);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // =========================
  // Turnstile
  // =========================
  const [turnstileToken, setTurnstileToken] = useState('');

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [registeredCustomerName, setRegisteredCustomerName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch published packages
    getPackages().then(res => {
      const published = (res || []).filter(
        p => p.is_published !== false
      );

      setPackages(published);

      if (packageParam) {
        // match by slug or id
        const match = published.find(
          p =>
            p.slug === packageParam ||
            String(p.id) === String(packageParam)
        );

        if (match && isPackageCurrentlyAvailable(match)) {
          setChosenPackageId(match.id);
        } else {
          // If match is closed or not found, select first available
          const firstAvailable =
            published.find(p => isPackageCurrentlyAvailable(p)) ||
            published[0];

          setChosenPackageId(firstAvailable?.id || '');
        }
      } else if (published.length > 0) {
        // default select first available package
        const firstAvailable =
          published.find(p => isPackageCurrentlyAvailable(p)) ||
          published[0];

        setChosenPackageId(firstAvailable?.id || '');
      }
    });

    // Fetch published bank accounts
    getBanks().then(res => {
      const published = (res || []).filter(
        b => b.is_published !== false
      );

      setBanks(published);
    });

    // Fetch settings for dynamic registration status & coach phone number
    setLoadingSettings(true);

    getSiteSettings()
      .then(setSettings)
      .finally(() => setLoadingSettings(false));
  }, [packageParam]);

  const selectedPackage =
    packages.find(p => p.id === chosenPackageId) || null;

  const isSelectedPackageClosed =
    selectedPackage &&
    !isPackageCurrentlyAvailable(selectedPackage);

  // Registration status
  const isRegistrationOpen =
    isRegistrationCurrentlyOpen(settings);

  const registrationStatusText = isRegistrationOpen
    ? 'التسجيل متاح حاليًا لجميع الباقات التدريبية'
    : (
        settings?.registration_closed_message ||
        'التسجيل مغلق حاليًا، يرجى المحاولة لاحقًا.'
      );

  // Validate File (Type and Size up to 5MB)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFileError('');

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError(
        'نوع الملف غير مدعوم. يرجى رفع JPG أو PNG أو WebP أو PDF.'
      );

      e.target.value = '';
      setFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setFileError(
        'حجم الملف كبير جدًا. الحد الأقصى المسموح به هو 5 ميجابايت.'
      );

      e.target.value = '';
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  function handleCopyAccount(bankId, accountNumber) {
    navigator.clipboard.writeText(accountNumber);

    setCopiedBankId(bankId);

    setTimeout(() => {
      setCopiedBankId(null);
    }, 2500);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setFormError('');

    if (!isRegistrationOpen) {
      return setFormError(
        'التسجيل مغلق حالياً، يرجى المحاولة لاحقاً.'
      );
    }

    if (!chosenPackageId || !selectedPackage) {
      return setFormError(
        'يرجى اختيار باقة للاشتراك.'
      );
    }

    if (isSelectedPackageClosed) {
      return setFormError(
        'هذه الباقة مغلقة حالياً ولا يمكن استقبال طلبات جديدة عليها.'
      );
    }

    if (!file) {
      return setFormError(
        'يرجى إرفاق صورة أو ملف سند التحويل البنكي.'
      );
    }

    // Turnstile validation
    if (!turnstileToken) {
      return setFormError(
        'يرجى إكمال التحقق الأمني أولاً.'
      );
    }

    const formData = new FormData(e.currentTarget);

    const fullName =
      formData.get('full_name')?.toString().trim();

    const phone =
      formData.get('phone')?.toString().trim();

    const age =
      parseInt(
        formData.get('age')?.toString() || '0',
        10
      );

    const selectedGoal =
      formData.get('goal')?.toString().trim() || '';

    const notes =
      formData.get('notes')?.toString().trim() || '';

    // Validation
    if (!fullName) {
      return setFormError(
        'يرجى كتابة الاسم الكامل.'
      );
    }

    if (!phone) {
      return setFormError(
        'يرجى إدخال رقم الجوال.'
      );
    }

    if (!age || age < 12 || age > 100) {
      return setFormError(
        'يرجى إدخال عمر صحيح بين 12 و 100 عام.'
      );
    }

    if (!selectedGoal) {
      return setFormError(
        'يرجى اختيار هدفك من الاشتراك.'
      );
    }

    setLoading(true);

    try {
      // Create subscription
      await createSubscription(
        {
          full_name: fullName,
          age,
          phone,
          goal: selectedGoal,
          notes,
          turnstileToken
        },
        file,
        selectedPackage
      );

      // Prepare WhatsApp message
      const coachWhatsapp =
        settings?.whatsapp || '967770870321';

      const msg =
        generateWhatsAppSubscriptionMessage({
          fullName,
          age,
          phone,
          packageName: selectedPackage.name,
          packagePrice: selectedPackage.price,
          durationValue:
            selectedPackage.duration_value,
          durationUnit:
            selectedPackage.duration_unit,
          goal: selectedGoal,
          notes
        });

      const waLink =
        buildWhatsAppUrl(
          coachWhatsapp,
          msg
        );

      setRegisteredCustomerName(fullName);
      setWhatsappUrl(waLink);
      setShowSuccessModal(true);

      // Try opening WhatsApp automatically after a brief pause
      setTimeout(() => {
        try {
          window.open(
            waLink,
            '_blank'
          );
        } catch {
          // If browser popup blocker intercepts,
          // the user has the clear button in the modal.
        }
      }, 800);

    } catch (err) {
      setFormError(
        err.message ||
          'حدث خطأ أثناء إرسال طلب الاشتراك. يرجى المحاولة مرة أخرى.'
      );

      // Turnstile token is single-use
      setTurnstileToken('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>

      {/* Page Title */}
      <section className="signup-title">
        <span className="eyebrow">
          خطوة واحدة تفصلك عن التغيير
        </span>

        <h1>
          ابدئي رحلتك الصحية
        </h1>

        <p>
          أكملي بياناتك للتسجيل في برامج كوتش شيخة
          والبدء بخطتك المخصصة فوراً.
        </p>
      </section>

      {/* Loading Registration Status */}
      {loadingSettings ? (

        <section
          className="section centered"
          style={{
            padding: '60px 0',
            textAlign: 'center'
          }}
        >
          <div className="custom-spinner" />

          <p
            style={{
              marginTop: '16px',
              color: '#666'
            }}
          >
            جاري التحقق من حالة التسجيل...
          </p>
        </section>

      ) : !isRegistrationOpen ? (

        /* Registration Closed */
        <section className="section centered">

          <div
            className="registration-closed-box"
            style={{
              maxWidth: '650px',
              margin: '30px auto 60px',
              padding: '40px 25px',
              background: '#fff5f5',
              border: '2px solid #e53e3e',
              borderRadius: '16px',
              color: '#c53030',
              boxShadow:
                '0 4px 15px rgba(229, 62, 62, 0.12)',
              textAlign: 'center'
            }}
          >

            <Lock
              size={48}
              style={{
                color: '#e53e3e',
                marginBottom: '16px'
              }}
            />

            <h2
              style={{
                fontSize: '24px',
                margin: '0 0 12px',
                color: '#9b2c2c'
              }}
            >
              التسجيل مغلق حالياً
            </h2>

            <p
              style={{
                fontSize: '18px',
                fontWeight: '600',
                lineHeight: '1.7',
                margin: 0,
                color: '#c53030'
              }}
            >
              {registrationStatusText}
            </p>

          </div>

        </section>

      ) : (

        /* Subscription Form */
        <form
          className="subscription reference-subscription section"
          onSubmit={handleSubmit}
        >

          {/* ========================= */}
          {/* Personal Details */}
          {/* ========================= */}

          <h2>
            المعلومات الشخصية
          </h2>

          <div className="fields ref-fields">

            {/* Full Name */}
            <label>
              الاسم الكامل{' '}
              <span className="req">*</span>

              <input
                name="full_name"
                required
                placeholder="مثال: سارة محمد"
                disabled={loading}
              />
            </label>

            {/* Phone */}
            <label>
              رقم الجوال (WhatsApp){' '}
              <span className="req">*</span>

              <input
                name="phone"
                type="tel"
                required
                inputMode="tel"
                placeholder="05xxxxxxxx أو +966..."
                disabled={loading}
              />
            </label>

            {/* Age */}
            <label>
              العمر{' '}
              <span className="req">*</span>

              <input
                type="number"
                name="age"
                required
                min="12"
                max="100"
                placeholder="25"
                disabled={loading}
              />
            </label>

            {/* Goal */}
            <label className="goal-field">
              هدفك من الاشتراك <span className="req">*</span>

              <select
                name="goal"
                required
                value={goal}
                onChange={e => setGoal(e.target.value)}
                disabled={loading}
              >
                <option value="">اختاري هدفك</option>
                <option value="خسارة الوزن">خسارة الوزن</option>
                <option value="التنشيف">التنشيف</option>
                <option value="التضخيم">التضخيم</option>
                <option value="المحافظة على الوزن">
                  المحافظة على الوزن
                </option>
                <option value="تحسين العادات الغذائية">
                  تحسين العادات الغذائية
                </option>
                <option value="تحسين الصحة واللياقة">
                  تحسين الصحة واللياقة
                </option>
                <option value="هدف آخر">هدف آخر</option>
              </select>
            </label>

          </div>

          {/* ========================= */}
          {/* Package Selector */}
          {/* ========================= */}

          <h2>
            الباقة المختارة
          </h2>

          <div className="package-pick">

            {packages.map(p => {

              const statusInfo =
                getPackageStatusInfo(p);

              const isClosed =
                !statusInfo.isAvailable;

              const isChosen =
                chosenPackageId === p.id;

              return (
                <button
                  type="button"
                  key={p.id}
                  className={`package-pick-btn ${
                    isChosen ? 'chosen' : ''
                  } ${
                    isClosed ? 'closed-pick' : ''
                  }`}
                  onClick={() => {
                    if (!isClosed) {
                      setChosenPackageId(p.id);
                    }
                  }}
                  disabled={
                    loading || isClosed
                  }
                  title={statusInfo.text}
                >

                  <b>
                    {p.name.replace(
                      'باقة ',
                      ''
                    )}
                  </b>

                  <span className="pick-price">
                    {p.price} ر.س
                  </span>

                  {p.duration_value && (
                    <small className="pick-duration">
                      <Clock size={12} />{' '}
                      {p.duration_value}{' '}
                      {p.duration_unit ||
                        'يوم'}
                    </small>
                  )}

                  {isClosed && (
                    <span className="pick-closed-label">
                      {statusInfo.text}
                    </span>
                  )}

                </button>
              );
            })}

          </div>

          {/* Closed Package Warning */}
          {isSelectedPackageClosed && (
            <div className="closed-package-warning">

              <Lock size={18} />

              <span>
                تنبيه: باقة (
                {selectedPackage.name}
                ) غير متوفرة حالياً.
                يرجى اختيار باقة أخرى متوفرة.
              </span>

            </div>
          )}

          {/* ========================= */}
          {/* Health Warning */}
          {/* ========================= */}

          <div className="health-warning">

            <div className="health-warning-title">

              <span className="health-warning-icon">
                <AlertCircle size={17} />
              </span>

              <strong>
                تنبيه
              </strong>

            </div>

            <p>
              لا يتم استقبال المشاكل الصحية التي
              تحتاج إشراف دكتور بشكل دوري مثل
              (السكري، الديدان، لخبطة الهرمونات،
              أمراض المعدة الحادة، مشاكل الغدة
              الدرقية، أمراض القلب، أمراض الكبد،
              الفشل الكلوي، سوء التغذية الحاد الذي
              يحتاج تغذية أنبوبية أو وريدية).
            </p>

          </div>

          {/* ========================= */}
          {/* Bank Accounts */}
          {/* ========================= */}

          <h2>
            بيانات الحسابات البنكية للتحويل
          </h2>

         <div className="bank-list">
  {banks.map(b => {
    const isCopied = copiedBankId === b.id;

    return (
      <article
        key={b.id}
        className="bank-card"
      >
        {b.image_url ? (
          <img
            src={b.image_url}
            alt={b.bank_name || 'شعار البنك'}
            className="bank-logo"
          />
        ) : (
          <Landmark
            className="bank-icon"
            size={24}
          />
        )}

        <div className="bank-info">
          <b>
            {b.bank_name}
          </b>

          {b.account_name && (
            <small className="bank-owner">
              صاحب الحساب:{' '}
              {b.account_name}
            </small>
          )}

          <span>
            رقم الحساب
          </span>

          <strong dir="ltr">
            {b.account_number}
          </strong>
        </div>

        <button
          type="button"
          className={`copy-btn ${
            isCopied
              ? 'copied'
              : ''
          }`}
          aria-label="نسخ رقم الحساب"
          onClick={() =>
            handleCopyAccount(
              b.id,
              b.account_number
            )
          }
          title="نسخ رقم الحساب"
        >
          {isCopied ? (
            <Check size={18} />
          ) : (
            <Copy size={18} />
          )}

          <span className="copy-tooltip">
            {isCopied
              ? 'تم النسخ!'
              : 'نسخ'}
          </span>
        </button>
      </article>
    );
  })}
</div>

          {/* Bank Transfer Notice */}
          <p className="notice">
            يرجى إتمام عملية التحويل البنكي أولاً
            لحساب الكوتش، ثم إرفاق صورة الإيصال
            أو سند التحويل أدناه لتأكيد حجزك
            ومطابقة الحوالة.
          </p>

          {/* ========================= */}
          {/* Payment Receipt */}
          {/* ========================= */}

          <h2>
            رفع سند الإيداع{' '}
            <span className="req">*</span>
          </h2>

          <label
            className={`upload ${
              file ? 'has-file' : ''
            } ${
              fileError ? 'has-error' : ''
            }`}
          >

            {file ? (
              <FileCheck
                size={36}
                color="#48863f"
              />
            ) : (
              <Upload size={36} />
            )}

            <b
              title={
                file
                  ? file.name
                  : undefined
              }
            >
              {file
                ? file.name
                : 'اضغطي لاختيار صورة السند أو اسحبي الملف هنا'}
            </b>

            <small>
              {file
                ? `الحجم: ${formatFileSize(
                    file.size
                  )} | جاهز للرفع`
                : 'صيغ مدعومة: JPG, PNG, WebP, PDF (الحد الأقصى 5 ميجابايت)'}
            </small>

            <input
              type="file"
              required
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={handleFileChange}
              disabled={loading}
            />

          </label>

          {fileError && (
            <p className="file-error-msg">
              <AlertCircle size={16} />{' '}
              {fileError}
            </p>
          )}

          {/* ========================= */}
          {/* Additional Notes */}
          {/* ========================= */}

          <h2>
            ملاحظات إضافية (اختياري)
          </h2>

          <label>
            <textarea
              name="notes"
              rows="3"
              placeholder="اكتبي أي معلومات إضافية أو وقت مفضل للتواصل ترغبين أن تعرفها الكوتش مسبقاً..."
              disabled={loading}
            />
          </label>

          {/* ========================= */}
          {/* Turnstile */}
          {/* ========================= */}

          <div
            className="turnstile-container"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '24px 0'
            }}
          >
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => {
                setTurnstileToken(token);
                setFormError('');
              }}
              onExpire={() => {
                setTurnstileToken('');
              }}
              onError={() => {
                setTurnstileToken('');
                setFormError(
                  'تعذر إتمام التحقق الأمني. يرجى المحاولة مرة أخرى.'
                );
              }}
            />
          </div>

          {/* ========================= */}
          {/* Form Error */}
          {/* ========================= */}

          {formError && (
            <div className="form-status error">

              <AlertCircle size={18} />

              <span>
                {formError}
              </span>

            </div>
          )}

          {/* ========================= */}
          {/* Submit */}
          {/* ========================= */}

          <button
            className="button submit"
            type="submit"
            disabled={
              loading ||
              isSelectedPackageClosed ||
              !turnstileToken
            }
          >
            {loading
              ? 'جاري رفع السند وتسجيل الطلب...'
              : 'تأكيد وإرسال الطلب'}
          </button>

          {/* Privacy */}
          <p className="privacy">
            جميع بياناتك وسنداتك محفوظة بسرية
            وأمان تام تحت إشراف الكوتش مباشرة.
          </p>

        </form>
      )}

      {/* ========================= */}
      {/* Success Modal */}
      {/* ========================= */}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() =>
          setShowSuccessModal(false)
        }
        whatsappUrl={whatsappUrl}
        customerName={
          registeredCustomerName
        }
      />

    </PublicLayout>
  );
}