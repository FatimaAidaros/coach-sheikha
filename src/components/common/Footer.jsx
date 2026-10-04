import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSiteSettings } from '../../services/api';
import { MessageCircle, Instagram, Mail } from 'lucide-react';

const logo = '/لوقو شيخه.jpeg';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const coachName = settings?.coach_name || 'كوتش شيخة';
  const whatsapp = settings?.whatsapp || '967770870321';
  const instagram = settings?.instagram || 'coach_sheikha';
  const email = settings?.email || 'contact@coachsheikha.com';
  const copyright = settings?.copyright || '© 2026 كوتش شيخة. جميع الحقوق محفوظة.';

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <img className="footer-logo" src={logo} alt={coachName} />
        <h3>{coachName}</h3>
        <p className="footer-tagline">خطوتكِ الصغيرة اليوم ، نتائج كبيرة في الغد</p>

        <div className="footer-nav">
          <Link to="/">الرئيسية</Link>
          <Link to="/packages">الباقات</Link>
          <a href="/#about">عن الكوتش</a>
          {/* <a href="/#testimonials">آراء العميلات</a> */}
          <a href="/#about">من أنا</a>
        </div>

        <div className="footer-social">
          <a
            href={`https://wa.me/${cleanWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="social-icon"
          >
            <MessageCircle size={18} />
          </a>
          <a
            href={`https://instagram.com/${instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="social-icon"
          >
            <Instagram size={18} />
          </a>
          <a
            href={`mailto:${email}`}
            aria-label="Email"
            className="social-icon"
          >
            <Mail size={18} />
          </a>
        </div>

<small className="footer-copyright">
  {copyright}
  {' | '}
  تصميم وتطوير:{' '}
  <a
    href="https://wa.me/967770870321"
    target="_blank"
    rel="noopener noreferrer"
  >
    م. فاطمة العيدروس
  </a>
</small>      </div>
    </footer>
  );
}
