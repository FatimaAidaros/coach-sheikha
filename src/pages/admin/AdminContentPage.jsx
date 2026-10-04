import React, { useState, useEffect } from 'react';
import { getSiteContent, saveSiteContent } from '../../services/api';
import { Check, AlertCircle, Save } from 'lucide-react';

export default function AdminContentPage() {
  const [content, setContent] = useState(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  // Hero Fields
  const [heroEyebrow, setHeroEyebrow] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDesc, setHeroDesc] = useState('');
  const [heroBtnPrimary, setHeroBtnPrimary] = useState('');
  const [heroBtnSecondary, setHeroBtnSecondary] = useState('');

  // Stats Fields
  const [statsItems, setStatsItems] = useState([]);

  // Package Comparison Fields
  const [compTitle, setCompTitle] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compCard1Title, setCompCard1Title] = useState('');
  const [compCard1Desc, setCompCard1Desc] = useState('');
  const [compCard1Features, setCompCard1Features] = useState('');
  const [compCard2Title, setCompCard2Title] = useState('');
  const [compCard2Desc, setCompCard2Desc] = useState('');
  const [compCard2Features, setCompCard2Features] = useState('');

  // About Fields
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutP1, setAboutP1] = useState('');
  const [aboutP2, setAboutP2] = useState('');

  // Journey Steps
  const [journeyTitle, setJourneyTitle] = useState('');
  const [journeySteps, setJourneySteps] = useState([]);

  // CTA Fields
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaDesc, setCtaDesc] = useState('');
  const [ctaBtn, setCtaBtn] = useState('');

  async function load() {
    try {
      setLoading(true);

      const data = await getSiteContent();
      setContent(data);

      // Hero
      setHeroEyebrow(data?.hero?.eyebrow || '');
      setHeroTitle(data?.hero?.title || '');
      setHeroDesc(data?.hero?.description || '');
      setHeroBtnPrimary(data?.hero?.primary_button_text || '');
      setHeroBtnSecondary(data?.hero?.secondary_button_text || '');

      // Stats
  // Stats
const dbStats = Array.isArray(data?.stats?.items)
  ? data.stats.items.slice(0, 3)
  : [];

while (dbStats.length < 3) {
  dbStats.push({
    value: '',
    label: ''
  });
}

setStatsItems(dbStats);

      // Package Comparison
      const comp = data?.package_comparison || {};

      setCompTitle(
        comp.title || 'الفرق بين الباقات'
      );

      setCompDesc(
        comp.description ||
          'نوضح لكِ الفرق بين برامج المتابعة لاختيار الباقة التي تلبي احتياجاتك وأهدافك بدقة'
      );

      setCompCard1Title(
        comp.card1?.title ||
          'باقات المتابعة العامة / الشهرية'
      );

      setCompCard1Desc(
        comp.card1?.description ||
          'مناسبة لمن ترغب بخطة غذائية واضحة وقوائم متنوعة مع متابعة دورية'
      );

      setCompCard1Features(
        Array.isArray(comp.card1?.features)
          ? comp.card1.features.join('\n')
          : ''
      );

      setCompCard2Title(
        comp.card2?.title ||
          'باقات المتابعة المخصصة والمكثفة (VIP)'
      );

      setCompCard2Desc(
        comp.card2?.description ||
          'مناسبة لمن تحتاج دعماً مستمراً وتعديلات فورية وتواصلاً يومياً ومباشراً'
      );

      setCompCard2Features(
        Array.isArray(comp.card2?.features)
          ? comp.card2.features.join('\n')
          : ''
      );

      // About
      setAboutTitle(data?.about?.title || '');
      setAboutP1(data?.about?.paragraph_1 || '');
      setAboutP2(data?.about?.paragraph_2 || '');

      // Journey
      // Journey
setJourneyTitle(data?.journey?.title || '');

const dbJourneySteps = Array.isArray(data?.journey?.steps)
  ? data.journey.steps.slice(0, 3)
  : [];

while (dbJourneySteps.length < 3) {
  dbJourneySteps.push({
    number: String(dbJourneySteps.length + 1),
    title: '',
    description: ''
  });
}

setJourneySteps(dbJourneySteps);

      // CTA
      setCtaTitle(data?.cta?.title || '');
      setCtaDesc(data?.cta?.description || '');
      setCtaBtn(data?.cta?.button_text || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSaveHero(e) {
    e.preventDefault();

    setSaving(true);
    setStatusMsg({ text: '', type: '' });

    try {
      await saveSiteContent('hero', {
        eyebrow: heroEyebrow,
        title: heroTitle,
        description: heroDesc,
        primary_button_text: heroBtnPrimary,
        secondary_button_text: heroBtnSecondary
      });

      setStatusMsg({
        text: 'تم حفظ محتوى قسم البداية بنجاح!',
        type: 'success'
      });
    } catch (err) {
      setStatusMsg({
        text: err.message,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveStats(e) {
    e.preventDefault();

    setSaving(true);
    setStatusMsg({ text: '', type: '' });

    try {
      await saveSiteContent('stats', {
        items: statsItems
      });

      setStatusMsg({
        text: 'تم حفظ شريط الإحصائيات بنجاح!',
        type: 'success'
      });
    } catch (err) {
      setStatusMsg({
        text: err.message,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePackageComparison(e) {
    e.preventDefault();

    setSaving(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const card1FeaturesList = compCard1Features
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const card2FeaturesList = compCard2Features
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      await saveSiteContent('package_comparison', {
        title: compTitle.trim(),
        description: compDesc.trim(),

        card1: {
          title: compCard1Title.trim(),
          description: compCard1Desc.trim(),
          features: card1FeaturesList
        },

        card2: {
          title: compCard2Title.trim(),
          description: compCard2Desc.trim(),
          features: card2FeaturesList
        }
      });

      setStatusMsg({
        text: 'تم حفظ قسم الفرق بين الباقات بنجاح!',
        type: 'success'
      });
    } catch (err) {
      setStatusMsg({
        text: err.message,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAbout(e) {
    e.preventDefault();

    setSaving(true);
    setStatusMsg({ text: '', type: '' });

    try {
      await saveSiteContent('about', {
        title: aboutTitle,
        paragraph_1: aboutP1,
        paragraph_2: aboutP2
      });

      setStatusMsg({
        text: 'تم حفظ محتوى عن الكوتش بنجاح!',
        type: 'success'
      });
    } catch (err) {
      setStatusMsg({
        text: err.message,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveJourney(e) {
    e.preventDefault();

    setSaving(true);
    setStatusMsg({ text: '', type: '' });

    try {
      await saveSiteContent('journey', {
        title: journeyTitle,
        steps: journeySteps
      });

      setStatusMsg({
        text: 'تم حفظ خطوات البدء بنجاح!',
        type: 'success'
      });
    } catch (err) {
      setStatusMsg({
        text: err.message,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCta(e) {
    e.preventDefault();

    setSaving(true);
    setStatusMsg({ text: '', type: '' });

    try {
      await saveSiteContent('cta', {
        title: ctaTitle,
        description: ctaDesc,
        button_text: ctaBtn
      });

      setStatusMsg({
        text: 'تم حفظ قسم الدعوة للاشتراك بنجاح!',
        type: 'success'
      });
    } catch (err) {
      setStatusMsg({
        text: err.message,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-content-page">

      <div className="admin-page-header-row">
        <div>
          <h1>إدارة محتوى الموقع</h1>

          <p>
            تعديل النصوص والعناوين في أقسام الصفحة الرئيسية مباشرة
          </p>
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={`form-status ${statusMsg.type}`}
          style={{ marginBottom: '20px' }}
        >
          {statusMsg.type === 'success' ? (
            <Check size={18} />
          ) : (
            <AlertCircle size={18} />
          )}

          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs Row */}

      <div className="admin-tabs-nav">

        <button
          type="button"
          className={`tab-btn ${
            activeTab === 'hero' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('hero')}
        >
          قسم البداية (Hero)
        </button>

        <button
          type="button"
          className={`tab-btn ${
            activeTab === 'stats' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('stats')}
        >
          الإحصائيات (Stats)
        </button>

        <button
          type="button"
          className={`tab-btn ${
            activeTab === 'about' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('about')}
        >
          عن الكوتش (About)
        </button>

        <button
          type="button"
          className={`tab-btn ${
            activeTab === 'journey' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('journey')}
        >
          خطوات البدء (Journey)
        </button>

        <button
          type="button"
          className={`tab-btn ${
            activeTab === 'cta' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('cta')}
        >
          دعوة الاشتراك (CTA)
        </button>

        <button
          type="button"
          className={`tab-btn ${
            activeTab === 'package_comparison'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setActiveTab('package_comparison')
          }
        >
          الفرق بين الباقات (Comparison)
        </button>

      </div>

      <section
        className="admin-panel"
        style={{ marginTop: '20px' }}
      >

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px'
            }}
          >
            <div className="custom-spinner" />

            <p>
              جاري تحميل المحتوى...
            </p>
          </div>
        ) : (
          <>

            {/* =====================================================
                HERO TAB
            ===================================================== */}

            {activeTab === 'hero' && (
              <form
                onSubmit={handleSaveHero}
                className="admin-modal-form"
              >

                <div className="admin-form-grid">

                  <label>
                    <span>
                      الشارة الترحيبية (Eyebrow)
                    </span>

                    <input
                      value={heroEyebrow}
                      onChange={e =>
                        setHeroEyebrow(e.target.value)
                      }
                    />
                  </label>

                  <label>
                    <span>
                      العنوان الرئيسي الكبير (Title)
                    </span>

                    <input
                      value={heroTitle}
                      onChange={e =>
                        setHeroTitle(e.target.value)
                      }
                    />
                  </label>

                  <label className="span-2">
                    <span>
                      الوصف الترحيبي
                    </span>

                    <textarea
                      rows="3"
                      value={heroDesc}
                      onChange={e =>
                        setHeroDesc(e.target.value)
                      }
                    />
                  </label>

                  <label>
                    <span>
                      نص الزر الرئيسي
                    </span>

                    <input
                      value={heroBtnPrimary}
                      onChange={e =>
                        setHeroBtnPrimary(e.target.value)
                      }
                    />
                  </label>

                  <label>
                    <span>
                      نص الزر الثانوي
                    </span>

                    <input
                      value={heroBtnSecondary}
                      onChange={e =>
                        setHeroBtnSecondary(e.target.value)
                      }
                    />
                  </label>

                </div>

                <div className="admin-form-actions">

                  <button
                    type="submit"
                    className="button small"
                    disabled={saving}
                  >
                    <Save size={16} />

                    <span>
                      {saving
                        ? 'جاري الحفظ...'
                        : 'حفظ قسم البداية'}
                    </span>
                  </button>

                </div>

              </form>
            )}

            {/* =====================================================
                STATS TAB
            ===================================================== */}

           {activeTab === 'stats' && (
  <form onSubmit={handleSaveStats} className="admin-modal-form">
    <div className="stats-editor-list">

      {/* 1 — عدد الباقات */}
      <div className="stat-editor-row">
        <label>
          <span>عدد الباقات</span>
          <input
            type="text"
            value={statsItems[0]?.value || ''}
            onChange={(e) => {
              const copy = [...statsItems];

              copy[0] = {
                ...(copy[0] || {}),
                value: e.target.value
              };

              setStatsItems(copy);
            }}
            placeholder="مثال: 6"
          />
        </label>

        <label style={{ flex: 2 }}>
          <span>النص الظاهر تحت الرقم</span>
          <input
            type="text"
            value={statsItems[0]?.label || ''}
            onChange={(e) => {
              const copy = [...statsItems];

              copy[0] = {
                ...(copy[0] || {}),
                label: e.target.value
              };

              setStatsItems(copy);
            }}
            placeholder="عدد الباقات"
          />
        </label>
      </div>

      {/* 2 — عدد المشتركات */}
      <div className="stat-editor-row">
        <label>
          <span>عدد المشتركات</span>
          <input
            type="text"
            value={statsItems[1]?.value || ''}
            onChange={(e) => {
              const copy = [...statsItems];

              copy[1] = {
                ...(copy[1] || {}),
                value: e.target.value
              };

              setStatsItems(copy);
            }}
            placeholder="مثال: +100"
          />
        </label>

        <label style={{ flex: 2 }}>
          <span>النص الظاهر تحت الرقم</span>
          <input
            type="text"
            value={statsItems[1]?.label || ''}
            onChange={(e) => {
              const copy = [...statsItems];

              copy[1] = {
                ...(copy[1] || {}),
                label: e.target.value
              };

              setStatsItems(copy);
            }}
            placeholder="عدد المشتركات"
          />
        </label>
      </div>

      {/* 3 — سنوات الخبرة */}
      <div className="stat-editor-row">
        <label>
          <span>سنوات الخبرة</span>
          <input
            type="text"
            value={statsItems[2]?.value || ''}
            onChange={(e) => {
              const copy = [...statsItems];

              copy[2] = {
                ...(copy[2] || {}),
                value: e.target.value
              };

              setStatsItems(copy);
            }}
            placeholder="مثال: +7"
          />
        </label>

        <label style={{ flex: 2 }}>
          <span>النص الظاهر تحت الرقم</span>
          <input
            type="text"
            value={statsItems[2]?.label || ''}
            onChange={(e) => {
              const copy = [...statsItems];

              copy[2] = {
                ...(copy[2] || {}),
                label: e.target.value
              };

              setStatsItems(copy);
            }}
            placeholder="سنوات الخبرة"
          />
        </label>
      </div>

    </div>

    <div className="admin-form-actions">
      <button
        type="submit"
        className="admin-save-btn"
        disabled={saving}
      >
        <Save size={16} />

        <span>
          {saving ? 'جاري الحفظ...' : 'حفظ الإحصائيات'}
        </span>
      </button>
    </div>
  </form>
)}

            {/* =====================================================
                ABOUT TAB
            ===================================================== */}

            {activeTab === 'about' && (
              <form
                onSubmit={handleSaveAbout}
                className="admin-modal-form"
              >

                <div className="admin-form-grid">

                  <label className="span-2">
                    <span>
                      عنوان قسم عن الكوتش
                    </span>

                    <input
                      value={aboutTitle}
                      onChange={e =>
                        setAboutTitle(e.target.value)
                      }
                    />
                  </label>

                  <label className="span-2">
                    <span>
                      الفقرة الأولى (بداية الرحلة والقصة)
                    </span>

                    <textarea
                      rows="3"
                      value={aboutP1}
                      onChange={e =>
                        setAboutP1(e.target.value)
                      }
                    />
                  </label>

                  <label className="span-2">
                    <span>
                      الفقرة الثانية (التوازن والرسالة)
                    </span>

                    <textarea
                      rows="3"
                      value={aboutP2}
                      onChange={e =>
                        setAboutP2(e.target.value)
                      }
                    />
                  </label>

                </div>

                <div className="admin-form-actions">

                  <button
                    type="submit"
                    className="button small"
                    disabled={saving}
                  >
                    <Save size={16} />

                    <span>
                      {saving
                        ? 'جاري الحفظ...'
                        : 'حفظ قصة الكوتش'}
                    </span>
                  </button>

                </div>

              </form>
            )}

            {/* =====================================================
                JOURNEY TAB
            ===================================================== */}

            {activeTab === 'journey' && (
              <form
                onSubmit={handleSaveJourney}
                className="admin-modal-form"
              >

                <div className="admin-form-grid">

                  <label className="span-2">
                    <span>
                      عنوان القسم
                    </span>

                    <input
                      value={journeyTitle}
                      onChange={e =>
                        setJourneyTitle(e.target.value)
                      }
                    />
                  </label>
                  </div>
            <div
  className="steps-editor-list"
  style={{ marginTop: '16px' }}
>
  {[0, 1, 2].map((idx) => {
    const step = journeySteps[idx] || {
      number: String(idx + 1),
      title: '',
      description: ''
    };

    return (
      <div
        key={idx}
        className="step-editor-box"
      >

        <strong>
          الخطوة {idx + 1}
        </strong>

        <label>
          <span>
            رقم الخطوة
          </span>

          <input
            type="text"
            value={step.number || ''}
            onChange={e => {
              const copy = [...journeySteps];

              copy[idx] = {
                ...(copy[idx] || {}),
                number: e.target.value
              };

              setJourneySteps(copy);
            }}
          />
        </label>

        <label>
          <span>
            عنوان الخطوة
          </span>

          <input
            type="text"
            value={step.title || ''}
            onChange={e => {
              const copy = [...journeySteps];

              copy[idx] = {
                ...(copy[idx] || {}),
                title: e.target.value
              };

              setJourneySteps(copy);
            }}
          />
        </label>

        <label>
          <span>
            شرح الخطوة
          </span>

          <textarea
            rows="3"
            value={step.description || ''}
            onChange={e => {
              const copy = [...journeySteps];

              copy[idx] = {
                ...(copy[idx] || {}),
                description: e.target.value
              };

              setJourneySteps(copy);
            }}
          />
        </label>

      </div>
    );
  })}
</div>

                <div className="admin-form-actions">

                  <button
                    type="submit"
                    className="button small"
                    disabled={saving}
                  >
                    <Save size={16} />

                    <span>
                      {saving
                        ? 'جاري الحفظ...'
                        : 'حفظ خطوات الرحلة'}
                    </span>
                  </button>

                </div>

              </form>
            )}

            {/* =====================================================
                CTA TAB
            ===================================================== */}

            {activeTab === 'cta' && (
              <form
                onSubmit={handleSaveCta}
                className="admin-modal-form"
              >

                <div className="admin-form-grid">

                  <label className="span-2">
                    <span>
                      عنوان الدعوة للاشتراك
                    </span>

                    <input
                      value={ctaTitle}
                      onChange={e =>
                        setCtaTitle(e.target.value)
                      }
                    />
                  </label>

                  <label className="span-2">
                    <span>
                      نص الشرح المحفز
                    </span>

                    <textarea
                      rows="3"
                      value={ctaDesc}
                      onChange={e =>
                        setCtaDesc(e.target.value)
                      }
                    />
                  </label>

                  <label>
                    <span>
                      نص الزر
                    </span>

                    <input
                      value={ctaBtn}
                      onChange={e =>
                        setCtaBtn(e.target.value)
                      }
                    />
                  </label>

                </div>

                <div className="admin-form-actions">

                  <button
                    type="submit"
                    className="button small"
                    disabled={saving}
                  >
                    <Save size={16} />

                    <span>
                      {saving
                        ? 'جاري الحفظ...'
                        : 'حفظ قسم الدعوة'}
                    </span>
                  </button>

                </div>

              </form>
            )}

            {/* =====================================================
                PACKAGE COMPARISON TAB
            ===================================================== */}

            {activeTab === 'package_comparison' && (
              <form
                onSubmit={handleSavePackageComparison}
                className="admin-modal-form"
              >

                <div className="admin-form-grid">

                  <label className="span-2">
                    <span>
                      عنوان قسم المقارنة
                    </span>

                    <input
                      value={compTitle}
                      onChange={e =>
                        setCompTitle(e.target.value)
                      }
                      placeholder="الفرق بين الباقات"
                    />
                  </label>

                  <label className="span-2">
                    <span>
                      وصف القسم
                    </span>

                    <textarea
                      rows="2"
                      value={compDesc}
                      onChange={e =>
                        setCompDesc(e.target.value)
                      }
                      placeholder="نوضح لكِ الفرق بين برامج المتابعة..."
                    />
                  </label>

                  {/* Card 1 */}

                  <div
                    className="span-2"
                    style={{
                      border: '1px solid #decabb',
                      borderRadius: '10px',
                      padding: '16px',
                      background: '#fdfaf8'
                    }}
                  >

                    <h3
                      style={{
                        margin: '0 0 12px',
                        color: '#633200',
                        fontSize: '16px'
                      }}
                    >
                      الكارد الأول (مثال: الباقات العامة)
                    </h3>

                    <div className="admin-form-grid">

                      <label className="span-2">
                        <span>
                          عنوان الكارد الأول
                        </span>

                        <input
                          value={compCard1Title}
                          onChange={e =>
                            setCompCard1Title(e.target.value)
                          }
                        />
                      </label>

                      <label className="span-2">
                        <span>
                          وصف الكارد الأول
                        </span>

                        <input
                          value={compCard1Desc}
                          onChange={e =>
                            setCompCard1Desc(e.target.value)
                          }
                        />
                      </label>

                      <label className="span-2">
                        <span>
                          مميزات الكارد الأول
                          (اكتبي كل ميزة في سطر منفصل)
                        </span>

                        <textarea
                          rows="4"
                          value={compCard1Features}
                          onChange={e =>
                            setCompCard1Features(
                              e.target.value
                            )
                          }
                          placeholder={
                            'خطة غذائية متكاملة\nخيارات وبدائل متنوعة\nمتابعة أسبوعية'
                          }
                        />
                      </label>

                    </div>

                  </div>

                  {/* Card 2 */}

                  <div
                    className="span-2"
                    style={{
                      border: '1px solid #decabb',
                      borderRadius: '10px',
                      padding: '16px',
                      background: '#fdfaf8'
                    }}
                  >

                    <h3
                      style={{
                        margin: '0 0 12px',
                        color: '#633200',
                        fontSize: '16px'
                      }}
                    >
                      الكارد الثاني (مثال: الباقات المخصصة VIP)
                    </h3>

                    <div className="admin-form-grid">

                      <label className="span-2">
                        <span>
                          عنوان الكارد الثاني
                        </span>

                        <input
                          value={compCard2Title}
                          onChange={e =>
                            setCompCard2Title(e.target.value)
                          }
                        />
                      </label>

                      <label className="span-2">
                        <span>
                          وصف الكارد الثاني
                        </span>

                        <input
                          value={compCard2Desc}
                          onChange={e =>
                            setCompCard2Desc(e.target.value)
                          }
                        />
                      </label>

                      <label className="span-2">
                        <span>
                          مميزات الكارد الثاني
                          (اكتبي كل ميزة في سطر منفصل)
                        </span>

                        <textarea
                          rows="4"
                          value={compCard2Features}
                          onChange={e =>
                            setCompCard2Features(
                              e.target.value
                            )
                          }
                          placeholder={
                            'خطة غذائية مفصلة 100%\nتعديل دوري مستمر\nمتابعة يومية دقيقة\nتواصل واستشارات مباشرة'
                          }
                        />
                      </label>

                    </div>

                  </div>

                </div>

                <div
                  className="admin-form-actions"
                  style={{ marginTop: '20px' }}
                >

                  <button
                    type="submit"
                    className="button small"
                    disabled={saving}
                  >
                    <Save size={16} />

                    <span>
                      {saving
                        ? 'جاري الحفظ...'
                        : 'حفظ مقارنة الباقات'}
                    </span>
                  </button>

                </div>

              </form>
            )}

          </>
        )}

      </section>
    </div>
  );
}