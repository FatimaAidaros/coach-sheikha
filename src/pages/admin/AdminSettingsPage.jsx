import React, { useState, useEffect } from 'react';
import { getSiteSettings, saveSiteSettings } from '../../services/api';
import { Save, Check, AlertCircle, Phone, Instagram, Mail, ShieldCheck, Award } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [coachName, setCoachName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [copyright, setCopyright] = useState('');
  const [experienceYears, setExperienceYears] = useState('7');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  async function load() {
    try {
      setLoading(true);
      const data = await getSiteSettings();
      setSettings(data);
      setCoachName(data?.coach_name || 'كوتش شيخة');
      setWhatsapp(data?.whatsapp || '967770870321');
      setInstagram(data?.instagram || 'coach_sheikha');
      setEmail(data?.email || 'contact@coachsheikha.com');
      setCopyright(data?.copyright || '© 2026 كوتش شيخة. جميع الحقوق محفوظة.');
      setExperienceYears(String(data?.experience_years ?? 7));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const payload = {
        ...settings,
        coach_name: coachName.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim(),
        email: email.trim(),
        copyright: copyright.trim(),
        experience_years: Number(experienceYears) || 7
      };
      await saveSiteSettings(payload);
      const freshData = await getSiteSettings();
      setSettings(freshData);
      setStatusMsg({ text: 'تم حفظ إعدادات الموقع بنجاح!', type: 'success' });
    } catch (err) {
      setStatusMsg({ text: err.message || 'فشل حفظ الإعدادات.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-page-header-row">
        <div>
          <h1>إعدادات الموقع العامة</h1>
          <p>إدارة بيانات الكوتش ورقم الواتساب المعتمد وحسابات التواصل وحقوق النشر</p>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`form-status ${statusMsg.type}`} style={{ marginBottom: '20px' }}>
          {statusMsg.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <section className="admin-panel" style={{ maxWidth: '800px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="custom-spinner" />
            <p>جاري تحميل الإعدادات...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="admin-modal-form">
            <div className="admin-form-grid">
              <label className="span-2">
                <span>اسم الكوتش المعروض في الموقع *</span>
                <input
                  required
                  value={coachName}
                  onChange={e => setCoachName(e.target.value)}
                  placeholder="كوتش شيخة"
                />
              </label>

              <label className="span-2">
                <span>رقم WhatsApp لاستقبال طلبات الاشتراك *</span>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input
                    required
                    dir="ltr"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="967770870321 أو 9665xxxxxxxx"
                  />
                </div>
                <small style={{ color: '#777', marginTop: '4px' }}>
                  سيتم توجيه جميع رسائل الاشتراكات الجديدة تلقائياً لهذا الرقم. لا حاجة لتعديل الكود.
                </small>
              </label>

              <label>
                <span>حساب Instagram</span>
                <div className="input-with-icon">
                  <Instagram size={18} />
                  <input
                    dir="ltr"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    placeholder="coach_sheikha"
                  />
                </div>
              </label>

              <label>
                <span>البريد الإلكتروني للتواصل</span>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contact@coachsheikha.com"
                  />
                </div>
              </label>

              <label className="span-2">
                <span>سنوات الخبرة والمتابعة (تظهر في إحصائيات الصفحة الرئيسية: +7)</span>
                <div className="input-with-icon">
                  <Award size={18} />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={experienceYears}
                    onChange={e => setExperienceYears(e.target.value)}
                    placeholder="7"
                  />
                </div>
              </label>

              <label className="span-2">
                <span>نص حقوق النشر والملكية (Copyright)</span>
                <input
                  value={copyright}
                  onChange={e => setCopyright(e.target.value)}
                  placeholder="© 2026 كوتش شيخة. جميع الحقوق محفوظة."
                />
              </label>
            </div>

            <div className="admin-form-actions" style={{ marginTop: '24px' }}>
              <button type="submit" className="button small" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
