import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Heart, Sparkles, Target, Compass, ArrowLeft } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { getSiteContent, getSiteSettings, getCertificates } from '../../services/api';

export default function AboutPage() {
  const [content, setContent] = useState(null);
  const [settings, setSettings] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([getSiteContent(), getSiteSettings(), getCertificates()])
      .then(([siteContent, siteSettings, certs]) => {
        if (siteContent) setContent(siteContent);
        if (siteSettings) setSettings(siteSettings);
        if (certs) setCertificates((certs || []).filter(c => c.is_published !== false));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const coachName = settings?.coach_name || 'كوتش شيخة';
  const expYears = settings?.experience_years || 7;

  const about = content?.about || {
    title: 'عن الكوتش',
    paragraph_1: 'بدأت رحلتي الصحية عام 2018 بوزن 68 كجم، وخلال سنة ونصف فقدت 28 كجم، حتى وصلت إلى نحافة شديدة جعلتني أدرك أن النحافة لا تعني دائماً الصحة.',
    paragraph_2: 'بعدها بدأت رحلة جديدة لاستعادة توازني وبناء جسمي بطريقة صحية، وتمكنت من تحقيق نتائج أفضل بنظرة محبة ومتزنة، لأن التوازن ورؤية الذات أهم من أي رقم على الميزان.',
    badge: 'رحلة ملهمة نحو التوازن'
  };

  const coachImage = content?.hero?.image_url || 'public/لوقو شيخه.jpeg';

  return (
    <PublicLayout>
      <div className="about-page-wrapper">
        {/* 1. Hero Section */}
        <section className="about-hero">
          <div className="about-hero-container">
            <span className="about-hero-eyebrow">
              <Sparkles size={16} />
              <span>تعرّفي على مدربتكِ</span>
            </span>
            <h1>من أنا</h1>
            <p>
              أهلاً بكِ في مساحتكِ الآمنة للتغيير الصحي المتوازن، حيث تبدأ رحلتكِ نحو صحة مستدامة بخطوات بسيطة وواثقة.
            </p>
          </div>
        </section>

        {/* 2. Story Section */}
        <section className="about-story-section">
          <div className="about-story-grid">
            <div className="about-story-content">
              <span className="about-badge">{about.badge || 'رحلة ملهمة نحو التوازن'}</span>
              <h2>قصتي مع التغيير والصحة</h2>
              <p className="about-lead-text">
                {about.paragraph_1}
              </p>
              <p>
                {about.paragraph_2}
              </p>
              <div className="about-quote-box">
                <Heart className="about-quote-icon" size={24} />
                <blockquote>
                  "التوازن ورؤية الذات وتقدير الجسد أهم من أي رقم عابر على الميزان. خطواتكِ الصغيرة اليوم تصنع نتائجكِ العظيمة غداً."
                </blockquote>
              </div>
            </div>

            <div className="about-story-art">
              <div className="about-image-card">
                <img src={coachImage} alt={coachName} className="about-coach-photo" />
                <div className="about-image-tag">
                  <b>{coachName}</b>
                  <small>أخصائية ومدربة لياقة وصحة معتمدة</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. My Experience & Field */}
        <section className="about-experience-section">
          <div className="about-section-header">
            <span className="about-badge">خبرتي ومجالي</span>
            <h2>المعرفة والخبرة في خدمتكِ</h2>
            <p>سنوات من التعلم والممارسة العملية لمساعدة مئات المشتركات على بلوغ أهدافهن بثقة ووعي.</p>
          </div>

          <div className="about-pillars-grid">
            <div className="about-pillar-card">
              <div className="pillar-icon-wrapper">
                <Target size={28} />
              </div>
              <h3>خبرة تفوق {expYears} سنوات</h3>
              <p>
                متابعة ميدانية مستمرة وتوجيه مباشر لمئات المشتركات مع مراعاة الفروق الفردية والاحتياجات الخاصة لكل جسم.
              </p>
            </div>

            <div className="about-pillar-card">
              <div className="pillar-icon-wrapper">
                <Compass size={28} />
              </div>
              <h3>تدريب وتغذية رياضية معتمدة</h3>
              <p>
                تصميم خطط غذائية وتدريبية قائمة على أسس علمية متخصصة ومصممة وفق أهدافكِ الشخصية ونمط حياتكِ اليومي.
              </p>
            </div>

            <div className="about-pillar-card">
              <div className="pillar-icon-wrapper">
                <Heart size={28} />
              </div>
              <h3>نمط حياة مستدام بلا حرمان</h3>
              <p>
                التوقف عن الأنظمة القاسية المؤقتة، وبناء علاقة متوازنة وصحية مع الطعام والحركة تستمر معكِ مدى الحياة.
              </p>
            </div>
          </div>
        </section>

        {/* 4. What I Offer */}
        <section className="about-offerings-section">
          <div className="about-section-header">
            <span className="about-badge">خدماتي</span>
            <h2>ماذا أقدم لكِ في برامجي؟</h2>
            <p>حلول شاملة ومتكاملة تجمع بين الدعم التغذوي والتدريبي والتوجيه المستمر.</p>
          </div>

          <div className="about-offerings-grid">
            <div className="offering-item">
              <CheckCircle2 size={22} className="offering-check" />
              <div>
                <h4>خطط وجداول غذائية مخصصة</h4>
                <p>جداول كميات واضحة ومبسطة محسوبة السعرات تناسب فئة وزنكِ وهدفكِ ونمط معيشتكِ.</p>
              </div>
            </div>

            <div className="offering-item">
              <CheckCircle2 size={22} className="offering-check" />
              <div>
                <h4>جداول تمارين رياضية متكاملة</h4>
                <p>تمارين مرفقة تناسب مستواكِ سواء كنتِ مبتدئة أو متقدمة لشد الجسم وبناء القوة.</p>
              </div>
            </div>

            <div className="offering-item">
              <CheckCircle2 size={22} className="offering-check" />
              <div>
                <h4>متابعة شخصية مستمرة</h4>
                <p>خيارات متابعة أسبوعية أو يومية للإجابة على استفساراتكِ ومتابعة تطوركِ أولاً بأول.</p>
              </div>
            </div>

            <div className="offering-item">
              <CheckCircle2 size={22} className="offering-check" />
              <div>
                <h4>توجيهات وبدائل غذائية مرنة</h4>
                <p>دليل تعليمات مفصل يعلمكِ كيفية حساب السعرات واختيار البدائل المتنوعة بسهولة.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Why Choose Me */}
        <section className="about-why-section">
          <div className="about-why-box">
            <h2>لماذا تبدئين رحلتكِ معي؟</h2>
            <div className="about-why-list">
              <div className="why-item">
                <span className="why-num">1</span>
                <div>
                  <h4>تجربة حقيقية مررت بها قبلك</h4>
                  <p>أفهم تماماً التحديات النفسية والجسدية التي تواجهينها، ولن أطلب منكِ شيئاً لم أختبره وأتقنه بنفسي.</p>
                </div>
              </div>

              <div className="why-item">
                <span className="why-num">2</span>
                <div>
                  <h4>مرونة وواقعية تناسب يومك</h4>
                  <p>البرامج مصممة لتندمج بسلاسة مع عملكِ وعائلتكِ، بدون تعقيدات أو تكاليف مبالغ فيها.</p>
                </div>
              </div>

              <div className="why-item">
                <span className="why-num">3</span>
                <div>
                  <h4>تركيز على الصحة والتوازن الداخلي</h4>
                  <p>الهدف ليس مجرد رقم ينقص على الميزان، بل طاقة أعلى، نوم أفضل، وعلاقة مريحة مع جسدكِ.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Certificates Section (If available) */}
        {certificates.length > 0 && (
          <section className="about-certificates-section">
            <div className="about-section-header">
              <span className="about-badge">الاعتمادات</span>
              <h2>الشهادات والاعتمادات</h2>
              <p>مؤهلات علمية موثقة لضمان حصولكِ على أفضل توجيه تدريبي وغذائي معتمد.</p>
            </div>

            <div className="about-certs-grid">
              {certificates.map((cert) => (
                <article className="about-cert-card" key={cert.id}>
                  <div className="about-cert-img-wrapper">
                    {cert.image_url ? (
                      <img src={cert.image_url} alt={cert.title} loading="lazy" />
                    ) : (
                      <Award size={48} className="cert-fallback-icon" />
                    )}
                  </div>
                  <div className="about-cert-info">
                    <h4>{cert.title}</h4>
                    {cert.description && <p>{cert.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 7. Final Call to Action */}
        <section className="about-cta-section">
          <div className="about-cta-box">
            <h2>هل أنتِ مستعدة لبدء رحلتكِ الصحية؟</h2>
            <p>
              اختاري الباقة التي تناسب احتياجاتكِ، ودعيني أرافقكِ خطوة بخطوة نحو تحقيق هدفكِ بثقة وتوازن.
            </p>
            <div className="about-cta-actions">
              <Link to="/packages" className="button about-cta-btn">
                <span>تصفحي الباقات المتاحة</span>
                <ArrowLeft size={18} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
