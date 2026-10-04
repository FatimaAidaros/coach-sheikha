import React, { useState, useEffect, useRef } from 'react';

import { Link, useLocation } from 'react-router-dom';
import { Award, ClipboardList, FileEdit, Receipt } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import Slider from '../../components/common/Slider';
import {
  getSiteContent,
  getCertificates,
  getTestimonials,
 
} from '../../services/api';

function AnimatedCounter({ end, duration = 800 }) {
  const target = Number(end) || 0;
  const [count, setCount] = useState(target);
  const elementRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          let startTime = null;

          const step = timestamp => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(ease * target));

            if (progress < 1) {
              animFrameRef.current = requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };

          animFrameRef.current = requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [target, duration]);

  return <span ref={elementRef}>{count}</span>;
}

function AnimatedStat({ rawValue, duration = 800 }) {
  const str = String(rawValue ?? '').trim();
  const match = str.match(/^([^\d]*)(\d+)([^\d]*)$/);
  if (!match) {
    return <span className="stat-number">{str}</span>;
  }
  const prefix = match[1];
  const num = parseInt(match[2], 10);
  const suffix = match[3];

  return (
    <span className="stat-number" dir="ltr">
      {prefix}
      <AnimatedCounter key={rawValue} end={num} duration={duration} />
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const location = useLocation();
const [content, setContent] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);


  async function loadData() {
  try {
    const results = await Promise.allSettled([
      getSiteContent(),
      getCertificates(),
      getTestimonials()
    ]);

    // 1. محتوى الصفحة
    const siteContentResult = results[0];

    if (siteContentResult.status === 'fulfilled') {
  console.log('🔥 SITE CONTENT FROM SUPABASE:', siteContentResult.value);
  setContent(siteContentResult.value || {});
} else {
  console.error(
    '🔥 SITE CONTENT ERROR:',
    siteContentResult.reason
  );
}

    // 2. الشهادات
    const certificatesResult = results[1];

    if (certificatesResult.status === 'fulfilled') {
      const certs = certificatesResult.value || [];
      console.log('CERTIFICATES FROM SUPABASE:', certs);

      setCertificates(
        certs.filter(
          c => c.is_published !== false
        )
      );
    } else {
      console.error(
        'Error loading certificates:',
        certificatesResult.reason
      );
    }

    // 3. قصص النجاح
    const testimonialsResult = results[2];

    if (testimonialsResult.status === 'fulfilled') {
      const tests = testimonialsResult.value || [];
        console.log('TESTIMONIALS FROM SUPABASE:', tests);
      setTestimonials(
        tests.filter(
          t => t.is_published !== false
        )
      );
    } else {
      console.error(
        'Error loading testimonials:',
        testimonialsResult.reason
      );
    }

  } catch (err) {
    console.error(
      'Error loading homepage data:',
      err
    );
  }
}

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    loadData();

    // Auto-update when returning to tab or navigating back
    function handleSync() {
      loadData();
    }
    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const hero = content?.hero || {};

const heroEyebrow = hero.eyebrow || '';
const heroTitle = hero.title || '';
const heroDesc = hero.description || '';
const heroPrimaryBtn = hero.primary_button_text || '';
const heroSecondaryBtn = hero.secondary_button_text || '';

// صورة الموقع ثابتة
const heroImg = '/hero.JPG';

  const about = content?.about || {};

const aboutTitle = about.title || '';
const aboutParagraph1 = about.paragraph_1 || '';
const aboutParagraph2 = about.paragraph_2 || '';

  const journey = content?.journey || {};

const journeySteps = Array.isArray(journey.steps)
  ? journey.steps.slice(0, 3)
  : [];

  const cta = content?.cta || {};

const ctaTitle = cta.title || '';
const ctaDescription = cta.description || '';
const ctaButton = cta.button_text || '';

  return (
    <PublicLayout>
      {/* 1. Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">{heroEyebrow}</span>
          <h1>{heroTitle}</h1>
          <p>{heroDesc}</p>
          <div className="actions">
            <a className="button hero-btn-primary" href="#about">
              {heroPrimaryBtn}
            </a>
            <Link className="button hero-btn-secondary" to="/packages">
              {heroSecondaryBtn}
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-art-frame">
            <img src={heroImg} alt="كوتش شيخة" />
          </div>
        </div>
      </section>

      {/* 2. Statistics Section */}
      <section className="stats">
{(content?.stats?.items || []).slice(0, 3).map((item, idx) => (          <div key={idx} className="stat-col">
            <AnimatedStat rawValue={item.value} />
            <span className="stat-label">{item.label}</span>
          </div>
        ))}
      </section>

      {/* 3. About Section */}
      <section id="about" className="about section">
        <div className="about-art">
          <img src="/about.jfif" alt="عن الكوتش" className="about-wreath-img" />
        </div>
        <div className="about-content">
          <h2>{aboutTitle}</h2>
            <p>{aboutParagraph1}</p>
            <p>{aboutParagraph2}</p>
        </div>
      </section>

      {/* 4. Certificates Section with Slider */}
      <section className="certificates section">
        <h2>الشهادات المعتمدة</h2>
        <Slider
           items={certificates}
  desktopItems={2}
  tabletItems={2}
  mobileItems={1}
  renderItem={(c) => (
            <article className="certificate-card" key={c.id}>
              <div className="certificate-img-wrapper">
                {c.image_url ? (
                 <img
  src={c.image_url}
  alt={c.title}
  loading="lazy"
  className="certificate-actual-image"
  onClick={() => setSelectedCertificate(c)}
/>
                ) : (
                  <div className="certificate-fallback-icon">
                    <Award size={48} />
                  </div>
                )}
              </div>
            </article>
          )}
        />
      </section>
            {selectedCertificate && (
  <div
    className="certificate-lightbox"
    onClick={() => setSelectedCertificate(null)}
  >
    <div
      className="certificate-lightbox-content"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="certificate-lightbox-close"
        onClick={() => setSelectedCertificate(null)}
        aria-label="إغلاق"
      >
        ×
      </button>

      <img
        src={selectedCertificate.image_url}
        alt={selectedCertificate.title}
        className="certificate-lightbox-image"
      />
    </div>
  </div>
)}
      {/* 5. How to Start Journey */}
      <section className="journey-section section centered">
          <h2>{journey.title || ''}</h2>        <div className="journey-timeline-wrapper">
          <div className="journey-timeline-bar">
            <span className="step-circle-badge">1</span>
            <span className="step-circle-badge">2</span>
            <span className="step-circle-badge">3</span>
          </div>

          <div className="steps">
            {journeySteps.map((step, idx) => (
              <article key={step.number} className="step-card">
                <div className="step-icon-badge">
                  {idx === 0 && <ClipboardList size={30} />}
                  {idx === 1 && <FileEdit size={30} />}
                  {idx === 2 && <Receipt size={30} />}
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Success Stories / Testimonials with Slider */}
      <section className="testimonials-section">
<div className="testimonials-heading">
            <h2>قصص نجاح ملهمة</h2>
          <p>
      تجارب حقيقية لمشتركات بدأن رحلتهن نحو حياة صحية أكثر توازنًا، وحققن نتائج نفتخر بها.
    </p>
          <Slider
            items={testimonials}
  desktopItems={3}
  tabletItems={2}
  mobileItems={1}
  renderItem={(t) => (
              <article className="testimonial-card" key={t.id}>
                <p className="testimonial-quote">{t.content}</p>
                <hr className="testimonial-divider" />
                <div className="testimonial-footer-row">
                  <div className="testimonial-avatar">
                    {t.image_url ? (
                      <img src={t.image_url} alt={t.name} />
                    ) : (
                      <span>{t.name ? t.name.charAt(0) : 'م'}</span>
                    )}
                  </div>
                  <div className="testimonial-info">
                    <b>{t.name}</b>
                    {/* <small>{t.tag || 'مشتركة نشيطة'}</small> */}
                    <div className="testimonial-stars">{t.rating || '★★★★★'}</div>
                  </div>
                </div>
              </article>
            )}
          />
        </div>
      </section>

      {/* 7. CTA Section */}
     <section className="cta-wrapper">
  <div className="cta-card">
    <h2>{ctaTitle}</h2>
    <p>{ctaDescription}</p>

    <Link className="button cta-btn" to="/subscription">
      {ctaButton}
    </Link>
  </div>
</section>
    </PublicLayout>
  );
}
