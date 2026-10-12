import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Flame, Dumbbell, Wheat, Droplet, Heart, AlertCircle, ChefHat } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { getRecipe } from '../../services/api';

export default function RecipeDetailsPage() {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    async function load() {
      try {
        setLoading(true);
        setError('');
        const item = await getRecipe(slug);
        if (!item) {
          setError('لم نتمكن من العثور على الوصفة المطلوبة.');
        } else {
          setRecipe(item);
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل بيانات الوصفة.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="section centered" style={{ padding: '80px 20px' }}>
          <div className="custom-spinner" />
          <p style={{ marginTop: '20px', color: 'var(--brown2)' }}>جاري تحميل الوصفة...</p>
        </div>
      </PublicLayout>
    );
  }

  if (error || !recipe) {
    return (
      <PublicLayout>
        <div className="section centered" style={{ padding: '80px 20px' }}>
          <AlertCircle size={48} color="var(--brown)" />
          <h2 style={{ margin: '16px 0' }}>{error || 'الوصفة غير موجودة'}</h2>
          <p style={{ color: '#745b48', marginBottom: '24px' }}>
            ربما تم نقل الوصفة أو أن الرابط غير صحيح.
          </p>
          <Link to="/recipes" className="button">
            <ArrowRight size={18} />
            <span>العودة لجميع الوصفات</span>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const imgUrl = recipe.image_url || recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85';
  const hasNutrition = recipe.calories || recipe.protein || recipe.carbs || recipe.fats;
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.filter(Boolean) : [];
  const preparation = Array.isArray(recipe.preparation) ? recipe.preparation.filter(Boolean) : [];

  return (
    <PublicLayout>
      <div className="recipe-details-header">
        <div className="section">
          <Link to="/recipes" className="back-link">
            <ArrowRight size={18} />
            <span>العودة لقائمة الوصفات</span>
          </Link>
        </div>
      </div>

      <article className="section recipe-details-container">
        {/* Main Header / Hero */}
        <div className="recipe-details-hero">
          <div className="recipe-hero-image-box">
            <img src={imgUrl} alt={recipe.name} />
          </div>

          <div className="recipe-hero-info">
            <span className="eyebrow">وصفة صحية معتمدة</span>
            <h1>{recipe.name}</h1>
            {recipe.short_description && (
              <p className="recipe-short-desc">{recipe.short_description}</p>
            )}
            {recipe.description && (
              <p className="recipe-full-desc">{recipe.description}</p>
            )}

            {/* Nutrition Facts - only shown if values exist */}
            {hasNutrition && (
              <div className="recipe-nutrition-grid">
                {recipe.calories && (
                  <div className="nutrition-item">
                    <Flame size={18} />
                    <strong>{recipe.calories}</strong>
                    <span>سعرة حرارية</span>
                  </div>
                )}
                {recipe.protein && (
                  <div className="nutrition-item">
                    <Dumbbell size={18} />
                    <strong>{recipe.protein} غ</strong>
                    <span>بروتين</span>
                  </div>
                )}
                {recipe.carbs && (
                  <div className="nutrition-item">
                    <Wheat size={18} />
                    <strong>{recipe.carbs} غ</strong>
                    <span>كربوهيدرات</span>
                  </div>
                )}
                {recipe.fats && (
                  <div className="nutrition-item">
                    <Droplet size={18} />
                    <strong>{recipe.fats} غ</strong>
                    <span>دهون صحية</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content sections */}
        <div className="recipe-content-grid">
          {/* Ingredients */}
          {ingredients.length > 0 && (
            <section className="recipe-block ingredients-block">
              <h2>
                <ChefHat size={22} />
                <span>المكونات والمقادير</span>
              </h2>
              <ul className="recipe-list ingredients-list">
                {ingredients.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Preparation */}
          {preparation.length > 0 && (
            <section className="recipe-block preparation-block">
              <h2>طريقة التحضير</h2>
              <ol className="recipe-list preparation-list">
                {preparation.map((step, idx) => (
                  <li key={idx}>
                    <span className="step-number">{idx + 1}</span>
                    <span className="step-text">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Health Benefits - only if present */}
          {recipe.health_benefits && recipe.health_benefits.trim() && (
            <section className="recipe-block benefits-block">
              <h2>
                <Heart size={20} />
                <span>الفوائد الصحية</span>
              </h2>
              <p>{recipe.health_benefits}</p>
            </section>
          )}

          {/* Notes - only if present */}
          {recipe.notes && recipe.notes.trim() && (
            <section className="recipe-block notes-block">
              <h2>ملاحظات وتوجيهات الكوتش</h2>
              <p>{recipe.notes}</p>
            </section>
          )}
        </div>
      </article>
    </PublicLayout>
  );
}
