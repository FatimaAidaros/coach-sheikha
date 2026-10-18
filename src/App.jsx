import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Public Pages
import HomePage from './pages/public/HomePage';
import PackagesPage from './pages/public/PackagesPage';
import RecipesPage from './pages/public/RecipesPage';
import RecipeDetailsPage from './pages/public/RecipeDetailsPage';
import SubscriptionPage from './pages/public/SubscriptionPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Admin Pages & Layout
import AdminLayout from './layouts/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminPackagesPage from './pages/admin/AdminPackagesPage';
import AdminRecipesPage from './pages/admin/AdminRecipesPage';
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage';
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage';
import AdminBankAccountsPage from './pages/admin/AdminBankAccountsPage';
import AdminContentPage from './pages/admin/AdminContentPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/:slug" element={<RecipeDetailsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="packages" element={<AdminPackagesPage />} />
          <Route path="recipes" element={<AdminRecipesPage />} />
          <Route path="certificates" element={<AdminCertificatesPage />} />
          <Route path="testimonials" element={<AdminTestimonialsPage />} />
          <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="bank-accounts" element={<AdminBankAccountsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
