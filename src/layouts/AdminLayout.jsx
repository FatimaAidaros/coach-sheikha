import React, { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  ChefHat,
  Award,
  MessageSquareQuote,
  Landmark,
  FileEdit,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const logo = '/لوقو شيخه.jpeg';

export const adminNavigation = [
  { to: '/admin', label: 'الرئيسية', icon: LayoutDashboard, end: true },
  { to: '/admin/content', label: 'محتوى الموقع', icon: FileEdit },
  { to: '/admin/packages', label: 'الباقات', icon: Package },
  { to: '/admin/recipes', label: 'الوصفات', icon: ChefHat },
  { to: '/admin/certificates', label: 'الشهادات', icon: Award },
  { to: '/admin/testimonials', label: 'قصص النجاح', icon: MessageSquareQuote },
  { to: '/admin/subscriptions', label: 'الاشتراكات', icon: ClipboardList },
  { to: '/admin/bank-accounts', label: 'الحسابات البنكية', icon: Landmark },
  { to: '/admin/settings', label: 'الإعدادات', icon: Settings }
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut, hasSupabase } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If loading, show spinner
  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="custom-spinner" />
        <p>جاري التحقق من صلاحيات الدخول...</p>
      </div>
    );
  }

  // If not admin, redirect to login
  if (!isAdmin) {
    navigate('/admin/login', { replace: true });
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="admin-app-root">
      {/* Mobile Top Bar */}
      <header className="admin-mobile-topbar">
        <button
          type="button"
          className="admin-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="قائمة لوحة التحكم"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link className="admin-mobile-brand" to="/admin">
          <img src={logo} alt="Coach Sheikha" />
          <span>لوحة تحكم كوتش شيخة</span>
        </Link>
      </header>

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand-box">
          <Link className="brand" to="/">
            <img src={logo} alt="كوتش شيخة" />
            <div>
              <b>كوتش شيخة</b>
              <small>لوحة الإدارة</small>
            </div>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="view-site-link"
            title="زيارة الموقع العام"
          >
            <span>عرض الموقع</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <nav className="admin-sidebar-nav">
          {adminNavigation.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          {!hasSupabase && (
            <div className="admin-offline-notice">
              ⚠️ وضع المعاينة المحلي (يرجى ربط Supabase الجديد لاحقاً)
            </div>
          )}
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content-viewport">
        <main className="admin-page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
