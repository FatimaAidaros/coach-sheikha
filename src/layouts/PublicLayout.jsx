import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="public-layout-root">
      <Header />
      <main className="public-main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
