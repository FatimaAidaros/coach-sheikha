import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <div className="section centered" style={{ padding: '90px 20px' }}>
        <h1 style={{ fontSize: '72px', margin: 0, color: 'var(--brown)' }}>404</h1>
        <h2 style={{ fontSize: '26px', margin: '15px 0' }}>الصفحة غير موجودة</h2>
        <p style={{ color: '#745b48', maxWidth: '480px', margin: '0 auto 30px' }}>
          عذراً، الصفحة التي تبحثين عنها غير متوفرة أو تم نقلها إلى مسار آخر.
        </p>
        <Link className="button" to="/">
          <Home size={18} />
          <span>العودة إلى الصفحة الرئيسية</span>
        </Link>
      </div>
    </PublicLayout>
  );
}
