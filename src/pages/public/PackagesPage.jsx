import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import {
  getPackages,
  getSiteContent,
  getPackageStatusInfo
} from '../../services/api';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  window.scrollTo(0, 0);

  async function loadPackagesPage() {
    try {
      const data = await getPackages();

      console.log('PACKAGES FROM SUPABASE:', data);

      const published = (data || []).filter(
        (p) => p.is_published !== false
      );

      console.log('PUBLISHED PACKAGES:', published);

      setPackages(published);
    } catch (error) {
      console.error('ERROR LOADING PACKAGES:', error);
      setPackages([]);
    }

    try {
      const content = await getSiteContent();

      if (content?.package_comparison) {
        setComparison(content.package_comparison);
      }
    } catch (error) {
      console.error('ERROR LOADING PACKAGE CONTENT:', error);
    } finally {
      setLoading(false);
    }
  }

  loadPackagesPage();
}, []);

  // =========================================
  // تقسيم الباقات حسب النوع القادم من Supabase
  // =========================================

  const basicList = packages.filter(
    (p) => p.package_type === 'basic'
  );

  const customList = packages.filter(
    (p) => p.package_type === 'custom'
  );

  const comprehensiveList = packages.filter(
    (p) => p.package_type === 'comprehensive'
  );

  // =========================================
  // ترتيب الباقات
  // =========================================

  const sortedBasic = [...basicList].sort(
  (a, b) =>
    (a.display_order || 0) -
    (b.display_order || 0)
);

const sortedCustom = [...customList].sort(
  (a, b) =>
    (a.display_order || 0) -
    (b.display_order || 0)
);   

  const sortedComprehensive = [...comprehensiveList].sort(
    (a, b) =>
      (a.display_order || 0) -
      (b.display_order || 0)
  );

  // =========================================
  // بيانات المقارنة
  // =========================================

  const compData = comparison || {
    title: 'ما الفرق بين الباقة الأساسية والباقة المخصصة؟',
    description:
      'اختاري البرنامج الذي يناسب احتياجاتك وأهدافك الصحية.',
    card1: {
      title: 'الباقة الأساسية',
      description:
        'برنامج منظم ومناسب لمن ترغب في البدء بخطة صحية واضحة ومتابعة مستمرة.',
      features: [
        'جدول كميات غذائية حسب فئة الوزن',
        'جدول تمارين مرفق',
        'دليل توجيهات وتعليمات',
        'خطة جاهزة ومبسطة',
        'مناسبة للمبتدئات',
        'المتابعة تختلف حسب الباقة المختارة (أسبوعية أو يومية)'
      ]
    },
    card2: {
      title: 'الباقة المخصصة',
      badge: 'الأكثر تفصيلاً',
      description:
        'برنامج متكامل مصمم خصيصاً وفق احتياجاتك وأهدافك الدقيقة.',
      features: [
        'جدول كميات مخصص حسب الوزن والهدف',
        'توجيهات وتعليمات مفصلة',
        'جدول رياضي متكامل و مرفق',
        'تعلم كيفية تنظيم وحساب السعرات اليومية',
        'خيارات وبدائل غذائية متنوعة',
        'المتابعة تختلف حسب الباقة المختارة (أسبوعية أو يومية)'
      ]
    }
  };

  // =========================================
  // تصميم بطاقة الباقة
  // =========================================

  const renderPackageCard = (p) => {
    const statusInfo = getPackageStatusInfo(p);
    const isAvailable = statusInfo.isAvailable;
    const packageSlug = p.slug || p.id;
    const badgeText = p.badge;

    return (
      <article
        className="pkg-card"
        key={p.id || p.slug}
      >
        {badgeText && (
          <span className="pkg-card-badge">
            {badgeText}
          </span>
        )}

        <h3>{p.name}</h3>

        <div className="pkg-card-price">
          {p.price} ريال
        </div>

        {/* حالة توفر الباقة */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '12.5px',
            fontWeight: '700',
            margin: '0 auto 18px',
            width: 'fit-content',
            background: isAvailable
              ? '#f0fdf4'
              : '#fff1f2',
            color: isAvailable
              ? '#15803d'
              : '#be123c',
            border: `1px solid ${
              isAvailable
                ? '#bbf7d0'
                : '#fecdd3'
            }`
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isAvailable
                ? '#22c55e'
                : '#e11d48'
            }}
          />

          <span>{statusInfo.text}</span>
        </div>

        <ul className="pkg-features-list">
          {(p.features || []).map((feat, idx) => (
            <li key={idx}>
              <CheckCircle2
                size={18}
                className="pkg-check-icon"
              />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {isAvailable ? (
          <Link
            className="pkg-card-btn"
            to={`/subscription?package=${packageSlug}`}
          >
            اختيار الباقة
          </Link>
        ) : (
          <button
            className="pkg-card-btn closed-btn"
            disabled
            title="غير متوفر"
          >
            غير متوفر
          </button>
        )}
      </article>
    );
  };

  return (
    <PublicLayout>
      <div className="packages-page-wrapper">

        {/* =========================================
            1. Hero Section
        ========================================= */}

        <section className="packages-hero">
          <div className="packages-hero-content-side">
            <h1>اختاري خطتك وابدئي رحلتك</h1>

            <p>
              باقات متابعة غذائية مصممة لتناسب أهدافك،
              من المتابعة الأساسية إلى الخطط المخصصة
              لاحتياجاتك.
            </p>

            <a
              href="#basic-packages"
              className="packages-hero-btn"
            >
              تصفحي الباقات
            </a>
          </div>

          <div className="packages-hero-img-side">
            <img
              src="/packages.JPG"
              alt="باقات كوتش شيخة"
            />
          </div>
        </section>

        {/* =========================================
            2. Main Sections
        ========================================= */}

        <main className="packages-page-main">

          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 0'
              }}
            >
              <div className="custom-spinner" />

              <p
                style={{
                  marginTop: '16px',
                  color: '#5A2D05'
                }}
              >
                جاري تحميل الباقات...
              </p>
            </div>
          ) : (
            <>

              {/* =====================================
                  Section 1: الباقات الأساسية
              ===================================== */}

              <section
                id="basic-packages"
                className="pkg-section"
              >
                <div className="pkg-section-header">
                  <h2>الباقات الأساسية</h2>

                  <p>
                    نقطة انطلاق ممتازة لمن ترغب في تنظيم
                    تغذيتها والحصول على توجيه مستمر.
                  </p>
                </div>

                <div className="pkg-cards-grid">
                  {sortedBasic.map((p) =>
                    renderPackageCard(p)
                  )}
                </div>
              </section>

              {/* =====================================
                  Section 2: الباقات المخصصة
              ===================================== */}

              <section className="pkg-section">
                <div className="pkg-section-header">
                  <h2>الباقات المخصصة</h2>

                  <p>
                    للحصول على أدق النتائج بخطة مرسومة
                    خصيصاً لجسمك واحتياجاتك الفردية.
                  </p>
                </div>

                <div className="pkg-cards-grid">
                  {sortedCustom.map((p) =>
                    renderPackageCard(p)
                  )}
                </div>
              </section>

              {/* =====================================
                  Section 3: الباقات الشاملة
              ===================================== */}

              {sortedComprehensive.length > 0 && (
                <section
                  id="comprehensive-packages"
                  className="pkg-section"
                >
                  <div className="pkg-section-header">
                    <h2>الباقات الشاملة</h2>

                    <p>
                      برامج متكاملة تجمع بين التغذية
                      والمتابعة لتحقيق أفضل استفادة من
                      رحلتك الصحية.
                    </p>
                  </div>

                  <div className="pkg-cards-grid">
                    {sortedComprehensive.map((p) =>
                      renderPackageCard(p)
                    )}
                  </div>
                </section>
              )}

              {/* =====================================
                  Section 4: المقارنة
              ===================================== */}

              <section className="pkg-section">
                <div className="pkg-section-header">
                  <h2>
                    {compData.title ||
                      'ما الفرق بين الباقة الأساسية والباقة المخصصة؟'}
                  </h2>

                  <p>
                    {compData.description ||
                      'اختاري البرنامج الذي يناسب احتياجاتك وأهدافك الصحية.'}
                  </p>
                </div>

                <div className="pkg-cards-grid">

                  {/* Card 1 */}
                  <div className="pkg-comparison-card">
                    <h3>
                      {compData.card1?.title ||
                        'الباقة الأساسية'}
                    </h3>

                    <p className="pkg-comp-desc">
                      {compData.card1?.description ||
                        'برنامج منظم ومناسب لمن ترغب في البدء بخطة غذائية واضحة ومتابعة مستمرة.'}
                    </p>

                    <hr className="pkg-comp-divider" />

                    <ul className="pkg-features-list">
                      {(
                        compData.card1?.features &&
                        compData.card1.features.length > 0
                          ? compData.card1.features
                          : [
                              'جدول كميات غذائية حسب فئة الوزن',
                              'جدول تمارين مرفق',
                              'دليل توجيهات وتعليمات',
                              'خطة جاهزة ومبسطة',
                              'مناسبة للمبتدئات',
                              'المتابعة تختلف حسب الباقة المختارة (أسبوعية أو يومية)'
                            ]
                      ).map((feat, idx) => (
                        <li key={idx}>
                          <CheckCircle2
                            size={18}
                            className="pkg-check-icon"
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card 2 */}
                  <div className="pkg-comparison-card">
                    <span className="pkg-comp-badge">
                      {compData.card2?.badge ||
                        'الأكثر تفصيلاً'}
                    </span>

                    <h3>
                      {compData.card2?.title ||
                        'الباقة المخصصة'}
                    </h3>

                    <p className="pkg-comp-desc">
                      {compData.card2?.description ||
                        'برنامج متكامل مصمم خصيصاً وفق احتياجاتك وأهدافك الدقيقة.'}
                    </p>

                    <hr className="pkg-comp-divider" />

                    <ul className="pkg-features-list">
                      {(
                        compData.card2?.features &&
                        compData.card2.features.length > 0
                          ? compData.card2.features
                          : [
                              'جدول كميات مخصص حسب الوزن والهدف',
                              'توجيهات وتعليمات مفصلة',
                              'جدول رياضي متكامل و مرفق',
                              'تعلم كيفية تنظيم وحساب السعرات اليومية',
                              'خيارات وبدائل غذائية متنوعة',
                              'المتابعة تختلف حسب الباقة المختارة (أسبوعية أو يومية)'
                            ]
                      ).map((feat, idx) => (
                        <li key={idx}>
                          <CheckCircle2
                            size={18}
                            className="pkg-check-icon"
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </section>

            </>
          )}

        </main>
      </div>
    </PublicLayout>
  );
}