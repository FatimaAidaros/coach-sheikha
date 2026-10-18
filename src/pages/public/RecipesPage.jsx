import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, UtensilsCrossed, AlertCircle } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { getRecipes } from '../../services/api';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadRecipes();
  }, []);

  async function loadRecipes() {
    try {
      setLoading(true);
      setError('');
      const data = await getRecipes();
      // Only show published recipes on public page
      const published = (data || []).filter(r => r.is_published !== false);
      setRecipes(published);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل الوصفات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = recipes.filter(r => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const nameMatch = (r.name || '').toLowerCase().includes(term);
    const descMatch = (r.short_description || r.description || '').toLowerCase().includes(term);
    const ingMatch = (r.ingredients || []).some(ing => String(ing).toLowerCase().includes(term));
    return nameMatch || descMatch || ingMatch;
  });

  return (
    <PublicLayout>
      <div className="recipes-page-wrapper">
        {/* 1. Hero Section: Same structure as PackagesPage Hero (Brown block on the right, Image on the left) */}
        <section className="packages-hero">
          <div className="packages-hero-content-side">
            <h1>وصفات كوتش شيخة الصحية</h1>
            <p>أفكار غذائية متوازنة ولذيذة وسهلة التحضير تدعم رحلتك وتساعدك على الاستمرار بنمط حياة صحي ممتع.</p>
            <a href="#recipes-grid-section" className="packages-hero-btn">
              تصفحي الوصفات
            </a>
          </div>
          <div className="packages-hero-img-side">
            <img
              src="/cook.PNG"
              alt="وصفات كوتش شيخة الصحية"
            />
          </div>
        </section>

        {/* 2. Main Section: Search & Recipes Grid */}
        <main className="recipes-page-main" id="recipes-grid-section">
          {/* Search Bar */}
          <div className="recipes-search-wrapper">
            <div className="recipes-search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="ابحثي عن وصفة أو مكون (مثل: شوفان، دجاج، سلطة...)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="بحث في الوصفات"
              />
              {search && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearch('')}
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="recipe-grid">
              {[1, 2, 3].map(n => (
                <div key={n} className="recipe-skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-content">
                    <div className="skeleton-line title" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="error-state-card">
              <AlertCircle size={36} />
              <h3>تعذر تحميل الوصفات</h3>
              <p>{error}</p>
              <button className="button small" onClick={loadRecipes}>
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state-card">
              <UtensilsCrossed size={48} />
              <h3>لا توجد وصفات مطابقة</h3>
              <p>
                {search
                  ? `لم نعثر على أي وصفة تطابق "${search}". جربي البحث بكلمات أخرى.`
                  : 'لا توجد وصفات منشورة حالياً، تابعينا قريباً لإضافة أشهى الوصفات!'}
              </p>
              {search && (
                <button className="button outline small" onClick={() => setSearch('')}>
                  عرض جميع الوصفات
                </button>
              )}
            </div>
          )}

          {/* Recipes Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="recipe-grid">
              {filtered.map(r => {
                const linkSlug = r.slug || r.id;
                const imgUrl = r.image_url || r.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                return (
                  <article className="recipe-card" key={r.id || r.slug}>
                    <div className="recipe-card-media">
                      <img src={imgUrl} alt={r.name} loading="lazy" />
                      {r.calories && (
                        <span className="recipe-badge">{r.calories} سعرة</span>
                      )}
                    </div>
                    <div className="recipe-card-body">
                      <h2>{r.name}</h2>
                      <p>{r.short_description || r.description}</p>
                      <Link to={`/recipes/${linkSlug}`} className="view-recipe-link">
                        <span>عرض تفاصيل الوصفة</span>
                        <ArrowLeft size={16} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </PublicLayout>
  );
}
