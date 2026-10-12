import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const logo = '/لوقو شيخه.jpeg';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { signIn, isAdmin, loading, hasSupabase } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error.message || 'فشل تسجيل الدخول. تأكدي من صحة البريد وكلمة المرور.');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-screen-wrapper">
      <div className="login-card">
        <Link to="/" className="login-back-home" title="العودة للموقع">
          <ArrowRight size={18} />
          <span>الرئيسية</span>
        </Link>

        <div className="login-brand-header">
          <img src={logo} alt="Coach Sheikha" />
          <h1>تسجيل دخول الإدارة</h1>
          <p>لوحة تحكم كوتش شيخة لإدارة الموقع والاشتراكات</p>
        </div>

        {!hasSupabase && (
          <div className="login-offline-banner">
            <AlertCircle size={18} />
            <span>
              تنبيه: متغيرات Supabase غير مفعلة حالياً في .env. يمكنك كتابة أي بريد للدخول في وضع المعاينة المحلي.
            </span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <label>
            <span>البريد الإلكتروني</span>
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                type="email"
                required
                placeholder="admin@coachsheikha.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
          </label>

          <label>
            <span>كلمة المرور</span>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
          </label>

          {error && (
            <div className="login-error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="button submit" disabled={submitting}>
            {submitting ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        <footer className="login-footer-notice">
          <small>© 2026 كوتش شيخة — الوصول مخصص للإدارة فقط</small>
        </footer>
      </div>
    </div>
  );
}
