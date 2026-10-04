import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const logo = '/لوقو شيخه.jpeg';

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  function handleAboutClick(e) {
    setOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('about');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <img src={logo} alt="شعار كوتش شيخة" />
        <b>كوتش شيخة</b>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label="القائمة"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <nav className={`site-nav ${open ? 'open' : ''}`}>
        <NavLink to="/" end onClick={() => setOpen(false)}>
          الرئيسية
        </NavLink>
        <NavLink to="/packages" onClick={() => setOpen(false)}>
          الباقات
        </NavLink>
        <NavLink to="/recipes" onClick={() => setOpen(false)}>
          وصفات صحية
        </NavLink>
        <Link to="/#about" onClick={handleAboutClick}>
          من أنا
        </Link>
        <Link
          className="button small cta-nav-btn"
          to="/subscription"
          onClick={() => setOpen(false)}
        >
          اشتركي الآن
        </Link>
      </nav>
    </header>
  );
}
