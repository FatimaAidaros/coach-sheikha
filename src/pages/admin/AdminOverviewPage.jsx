import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle,
  Activity,
  AlertTriangle,
  Package,
  ChefHat,
  Award,
  Plus,
  Zap,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  Phone
} from 'lucide-react';
import {
  getSubscriptions,
  getPackages,
  getRecipes,
  getCertificates,
  deleteSubscription
} from '../../services/api';
import { supabase, hasSupabase } from '../../lib/supabase';
import { formatDateArabic, getRemainingDaysBadge } from '../../utils/dateUtils';
import { formatPrice } from '../../utils/formatters';

import SubscriptionDetailsModal from '../../components/admin/SubscriptionDetailsModal';
import SubscriptionFormModal from '../../components/admin/SubscriptionFormModal';
import QuickActionsModal from '../../components/admin/QuickActionsModal';
import ConfirmModal from '../../components/common/ConfirmModal';

const statusLabels = {
  new: 'جديد',
  under_review: 'قيد المراجعة',
  accepted: 'مقبول',
  completed: 'مكتمل',
  rejected: 'مرفوض'
};

export default function AdminOverviewPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedSubForDetails, setSelectedSubForDetails] = useState(null);
  const [selectedSubForEdit, setSelectedSubForEdit] = useState(null);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [subToDelete, setSubToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadAllData() {
    try {
      setLoading(true);
      const [subsData, packsData, recsData, certsData] = await Promise.all([
        getSubscriptions(),
        getPackages(),
        getRecipes(),
        getCertificates()
      ]);
      setSubscriptions(subsData || []);
      setPackages(packsData || []);
      setRecipes(recsData || []);
      setCertificates(certsData || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();

    // 35 - REALTIME SUBSCRIPTIONS
    if (hasSupabase) {
      const channel = supabase
        .channel('dashboard-subscriptions-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'subscriptions' },
          () => {
            getSubscriptions().then(data => setSubscriptions(data || []));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  async function confirmDeleteSubscription() {
    if (!subToDelete) return;
    try {
      setDeleting(true);
      await deleteSubscription(subToDelete.id);
      setSubscriptions(prev => prev.filter(s => s.id !== subToDelete.id));
      setSubToDelete(null);
    } catch (err) {
      console.error('فشل الحذف: ' + err.message);
    } finally {
      setDeleting(false);
    }
  }

  // Calculate Dashboard Metrics
  const totalSubs = subscriptions.length;
  const newSubs = subscriptions.filter(s => s.status === 'new').length;
  const underReviewSubs = subscriptions.filter(s => s.status === 'under_review').length;
  const acceptedSubs = subscriptions.filter(s => s.status === 'accepted' || s.status === 'completed').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeSubs = subscriptions.filter(s => {
    if (!s.end_date) return false;
    const end = new Date(s.end_date);
    end.setHours(0, 0, 0, 0);
    return end >= today;
  }).length;

  const expiredSubs = subscriptions.filter(s => {
    if (!s.end_date) return false;
    const end = new Date(s.end_date);
    end.setHours(0, 0, 0, 0);
    return end < today;
  }).length;

  const totalPackages = packages.length;
  const availablePackages = packages.filter(p => p.is_available !== false).length;
  const totalRecipes = recipes.length;
  const totalCerts = certificates.length;

  const latestSubs = subscriptions.slice(0, 10);

  return (
    <div className="admin-overview-page">
      {/* Top Banner */}
      <div className="admin-page-header-row">
        <div>
          <h1>أهلًا بكِ كوتش شيخة 👋</h1>
          <p>إليكِ ملخص شامل لأداء منصتك ونشاط المشتركات اليوم.</p>
        </div>
        <div className="admin-page-header-actions">
          <button
            type="button"
            className="button outline small"
            onClick={() => setShowQuickActions(true)}
          >
            <Zap size={16} />
            <span>إجراء سريع</span>
          </button>
          <button
            type="button"
            className="button small"
            onClick={() => setShowAddSubModal(true)}
          >
            <Plus size={16} />
            <span>إضافة اشتراك</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards Grid (Requirements 19) */}
      <div className="overview-stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">
            <Users size={22} />
          </div>
          <div className="stat-card-data">
            <span>إجمالي الاشتراكات</span>
            <strong>{totalSubs}</strong>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-card-icon">
            <Clock size={22} />
          </div>
          <div className="stat-card-data">
            <span>طلبات جديدة</span>
            <strong>{newSubs}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <Activity size={22} />
          </div>
          <div className="stat-card-data">
            <span>قيد المراجعة</span>
            <strong>{underReviewSubs}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <CheckCircle size={22} />
          </div>
          <div className="stat-card-data">
            <span>الاشتراكات المقبولة</span>
            <strong>{acceptedSubs}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <Activity size={22} />
          </div>
          <div className="stat-card-data">
            <span>الاشتراكات النشطة</span>
            <strong>{activeSubs}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-card-data">
            <span>الاشتراكات المنتهية</span>
            <strong>{expiredSubs}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <Package size={22} />
          </div>
          <div className="stat-card-data">
            <span>الباقات (المتاحة / الكل)</span>
            <strong>{availablePackages} / {totalPackages}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <ChefHat size={22} />
          </div>
          <div className="stat-card-data">
            <span>الوصفات الصحية</span>
            <strong>{totalRecipes}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">
            <Award size={22} />
          </div>
          <div className="stat-card-data">
            <span>الشهادات المعتمدة</span>
            <strong>{totalCerts}</strong>
          </div>
        </div>
      </div>

      {/* Latest Subscriptions Panel */}
      <section className="admin-panel" style={{ marginTop: '30px' }}>
        <div className="panel-header-row">
          <div>
            <h2>آخر طلبات الاشتراك</h2>
            <p>أحدث العمليات وسندات التحويل المسجلة</p>
          </div>
          <Link to="/admin/subscriptions" className="button outline small">
            <span>عرض كل الاشتراكات ({subscriptions.length})</span>
            <ExternalLink size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="custom-spinner" />
            <p style={{ marginTop: '12px' }}>جاري تحميل الاشتراكات...</p>
          </div>
        ) : latestSubs.length === 0 ? (
          <div className="empty-panel">
            <p>لا توجد أي اشتراكات مسجلة حتى الآن.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-custom-table">
              <thead>
                <tr>
                  <th>العميلة</th>
                  <th>الجوال</th>
                  <th>الباقة</th>
                  <th>السعر</th>
                  <th>تاريخ الاشتراك</th>
                  <th>البداية</th>
                  <th>النهاية</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {latestSubs.map(s => {
                  const remaining = getRemainingDaysBadge(s.start_date, s.end_date);
                  return (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.full_name}</strong>
                        <small style={{ display: 'block', color: '#888' }}>{s.age} سنة</small>
                      </td>
                      <td>
                        <a
                          href={`https://wa.me/${(s.phone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="table-phone-link"
                        >
                          <Phone size={12} />
                          <span dir="ltr">{s.phone}</span>
                        </a>
                      </td>
                      <td>{s.package_name_snapshot || 'باقة مخصصة'}</td>
                      <td>
                        <strong>{formatPrice(s.package_price_snapshot)}</strong>
                      </td>
                      <td>{formatDateArabic(s.created_at)}</td>
                      <td>{formatDateArabic(s.start_date)}</td>
                      <td>
                        <div>{formatDateArabic(s.end_date)}</div>
                        <small className={`table-sub-badge ${remaining.className}`}>
                          {remaining.text}
                        </small>
                      </td>
                      <td>
                        <span className={`status-pill status-${s.status}`}>
                          {statusLabels[s.status] || s.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            className="icon-btn"
                            title="عرض التفاصيل والسند"
                            onClick={() => setSelectedSubForDetails(s)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title="تعديل الاشتراك"
                            onClick={() => setSelectedSubForEdit(s)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="حذف"
                            onClick={() => setSubToDelete(s)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Subscription Details Modal */}
      <SubscriptionDetailsModal
        isOpen={Boolean(selectedSubForDetails)}
        onClose={() => setSelectedSubForDetails(null)}
        subscription={selectedSubForDetails}
        onStatusUpdated={loadAllData}
      />

      {/* Subscription Form Modal (Add / Edit) */}
      <SubscriptionFormModal
        isOpen={showAddSubModal || Boolean(selectedSubForEdit)}
        onClose={() => {
          setShowAddSubModal(false);
          setSelectedSubForEdit(null);
        }}
        subscription={selectedSubForEdit}
        packages={packages}
        onSaved={loadAllData}
      />

      {/* Quick Actions Modal */}
      <QuickActionsModal
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onOpenAddSubscription={() => setShowAddSubModal(true)}
        onOpenAddPackage={() => {}}
        onOpenAddRecipe={() => {}}
        onOpenAddCertificate={() => {}}
        onOpenAddTestimonial={() => {}}
        onOpenAddBank={() => {}}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={Boolean(subToDelete)}
        onClose={() => setSubToDelete(null)}
        onConfirm={confirmDeleteSubscription}
        loading={deleting}
        title="حذف الاشتراك"
        message={`هل أنت متأكدة من حذف اشتراك العميلة (${subToDelete?.full_name})؟ سيتم مسح بيانات الاشتراك نهائياً.`}
      />
    </div>
  );
}
