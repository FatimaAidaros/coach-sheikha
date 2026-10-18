import React, { useState, useEffect } from 'react';
import { getRecipes, saveRecipe, deleteRecipe, uploadPublicImage } from '../../services/api';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [preparationText, setPreparationText] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [healthBenefits, setHealthBenefits] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  async function load() {
    try {
      setLoading(true);
      const data = await getRecipes();
      setRecipes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleOpenAdd() {
    setEditingRecipe(null);
    setName('');
    setSlug('');
    setShortDescription('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
    setIngredientsText('مكون 1\nمكون 2\nمكون 3');
    setPreparationText('الخطوة الأولى بالتفصيل\nالخطوة الثانية بالتفصيل');
    setCalories('350');
    setProtein('25');
    setCarbs('40');
    setFats('10');
    setHealthBenefits('');
    setNotes('');
    setIsPublished(true);
    setDisplayOrder(recipes.length + 1);
    setError('');
    setShowModal(true);
  }

  function handleOpenEdit(rec) {
    setEditingRecipe(rec);
    setName(rec.name || rec.title || '');
    setSlug(rec.slug || '');
    setShortDescription(rec.short_description || rec.excerpt || '');
    setDescription(rec.description || '');
    setImageUrl(rec.image_url || rec.image || '');
    setIngredientsText(Array.isArray(rec.ingredients) ? rec.ingredients.join('\n') : '');
    setPreparationText(Array.isArray(rec.preparation) ? rec.preparation.join('\n') : (Array.isArray(rec.steps) ? rec.steps.join('\n') : ''));
    setCalories(rec.calories ? String(rec.calories) : '');
    setProtein(rec.protein ? String(rec.protein) : '');
    setCarbs(rec.carbs ? String(rec.carbs) : '');
    setFats(rec.fats ? String(rec.fats) : (rec.fat ? String(rec.fat) : ''));
    setHealthBenefits(rec.health_benefits || rec.benefits || '');
    setNotes(rec.notes || '');
    setIsPublished(rec.is_published !== false);
    setDisplayOrder(rec.display_order || 0);
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('اسم الوصفة مطلوب.');

    setSubmitting(true);
    setError('');

    try {
      // 1. معالجة ورفع الصورة محلياً إلى Supabase Storage إذا تم اختيار ملف
      let finalImageUrl = imageUrl.trim() || null;

      if (selectedFile) {
        try {
          finalImageUrl = await uploadPublicImage('recipes-images', selectedFile);
        } catch (uploadErr) {
          throw new Error('فشل رفع صورة الوصفة: ' + uploadErr.message);
        }
      }

      const ingredients = ingredientsText
        .split('\n')
        .map(i => i.trim())
        .filter(Boolean);

      const preparation = preparationText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
        short_description: shortDescription.trim(),
        description: description.trim(),
        image_url: finalImageUrl,
        ingredients,
        preparation,
        calories: calories ? Number(calories) : null,
        protein: protein ? Number(protein) : null,
        carbs: carbs ? Number(carbs) : null,
        fats: fats ? Number(fats) : null,
        health_benefits: healthBenefits.trim() || null,
        notes: notes.trim() || null,
        is_published: isPublished,
        display_order: Number(displayOrder) || 0
      };

      if (editingRecipe) {
        payload.id = editingRecipe.id;
      }

      await saveRecipe(payload);
      await load();
      setSelectedFile(null); // إعادة تعيين الملف المختار
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'فشل حفظ الوصفة.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(rec) {
    try {
      await saveRecipe({
        ...rec,
        is_published: !rec.is_published
      });
      load();
    } catch (err) {
      console.error(err.message);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    try {
      await deleteRecipe(deletingId);
      setRecipes(prev => prev.filter(r => r.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div className="admin-recipes-page">
      <div className="admin-page-header-row">
        <div>
          <h1>إدارة الوصفات الصحية</h1>
          <p>إضافة وتعديل وحذف الوصفات والمكونات والقيم الغذائية</p>
        </div>
        <div className="admin-page-header-actions">
          <button type="button" className="button small" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>إضافة وصفة جديدة</span>
          </button>
        </div>
      </div>

      <section className="admin-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="custom-spinner" />
            <p style={{ marginTop: '12px' }}>جاري تحميل الوصفات...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="empty-panel">
            <p>لا توجد وصفات مضافة حتى الآن.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-custom-table">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>اسم الوصفة</th>
                  <th>السعرات والماكروز</th>
                  <th>الحالة</th>
                  <th>الترتيب</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map(r => {
                  const isPub = r.is_published !== false;
                  return (
                    <tr key={r.id}>
                      <td style={{ width: '60px' }}>
                        <img
                          src={r.image_url || r.image}
                          alt={r.name}
                          className="table-thumbnail"
                        />
                      </td>
                      <td>
                        <strong>{r.name}</strong>
                        <small style={{ display: 'block', color: '#888' }}>
                          الرمز: <code>{r.slug}</code>
                        </small>
                      </td>
                      <td>
                        <div className="macros-chip-group">
                          {r.calories && <span>🔥 {r.calories} كالوري</span>}
                          {r.protein && <span>🥩 {r.protein}غ بروتين</span>}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${isPub ? 'published' : 'draft'}`}
                          onClick={() => handleTogglePublish(r)}
                        >
                          {isPub ? <Eye size={14} /> : <EyeOff size={14} />}
                          <span>{isPub ? 'منشورة' : 'مسودة'}</span>
                        </button>
                      </td>
                      <td>#{r.display_order || 0}</td>
                      <td>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            className="icon-btn"
                            title="تعديل"
                            onClick={() => handleOpenEdit(r)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="حذف"
                            onClick={() => setDeletingId(r.id)}
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

      {/* Recipe Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRecipe ? 'تعديل الوصفة' : 'إضافة وصفة جديدة'}
        maxWidth="750px"
      >
        <form onSubmit={handleSubmit} className="admin-modal-form">
          {error && (
            <div className="form-status error" style={{ marginBottom: '14px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-form-grid">
            <label className="span-2">
              <span>اسم الوصفة *</span>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="طبق الشوفان الصحي"
              />
            </label>

            <label>
              <span>الرمز اللطيف (Slug)</span>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="oats-bowl"
              />
            </label>
            
           <label>
              <span>صورة الوصفة (رفع من الجهاز)</span>
              <input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={e => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }}
/>
              {(selectedFile || imageUrl) && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl}
                    alt="معاينة الصورة"
                    style={{
                      width: '90px',
                      height: '65px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#666' }}>
                    {selectedFile ? 'تم اختيار صورة جديدة' : 'الصورة الحالية'}
                  </span>
                </div>
              )}
            </label>


            <label className="span-2">
              <span>وصف مختصر (يظهر في كرت الوصفة)</span>
              <input
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="فطور مشبع وغني بالألياف..."
              />
            </label>

            <div className="macros-inputs-row span-2">
              <label>
                <span>السعرات</span>
                <input
                  type="number"
                  value={calories}
                  onChange={e => setCalories(e.target.value)}
                  placeholder="340"
                />
              </label>
              <label>
                <span>بروتين (غ)</span>
                <input
                  type="number"
                  value={protein}
                  onChange={e => setProtein(e.target.value)}
                  placeholder="14"
                />
              </label>
              <label>
                <span>كارب (غ)</span>
                <input
                  type="number"
                  value={carbs}
                  onChange={e => setCarbs(e.target.value)}
                  placeholder="52"
                />
              </label>
              <label>
                <span>دهون (غ)</span>
                <input
                  type="number"
                  value={fats}
                  onChange={e => setFats(e.target.value)}
                  placeholder="9"
                />
              </label>
            </div>

            <label className="span-2">
              <span>المكونات (كل مكون في سطر)</span>
              <textarea
                rows="4"
                value={ingredientsText}
                onChange={e => setIngredientsText(e.target.value)}
                placeholder="½ كوب شوفان&#10;كوب حليب&#10;موز وتوت"
              />
            </label>

            <label className="span-2">
              <span>طريقة التحضير (كل خطوة في سطر)</span>
              <textarea
                rows="4"
                value={preparationText}
                onChange={e => setPreparationText(e.target.value)}
                placeholder="اخلطي المكونات&#10;اتركيها خمس دقائق&#10;قدميها باردة"
              />
            </label>

            <label className="span-2">
              <span>الفوائد الصحية (اختياري)</span>
              <textarea
                rows="2"
                value={healthBenefits}
                onChange={e => setHealthBenefits(e.target.value)}
                placeholder="يدعم صحة الجهاز الهضمي..."
              />
            </label>

            <label className="span-2">
              <span>ملاحظات وتوجيهات الكوتش (اختياري)</span>
              <textarea
                rows="2"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="يمكن استبدال الحليب بالماء..."
              />
            </label>

            <div className="admin-checkbox-row span-2">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                />
                <span>منشورة في الموقع (Published)</span>
              </label>
            </div>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="button outline small"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              إلغاء
            </button>
            <button type="submit" className="button small" disabled={submitting}>
              {submitting ? 'جاري الحفظ...' : editingRecipe ? 'حفظ التعديلات' : 'إضافة الوصفة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="حذف الوصفة"
        message="هل أنت متأكدة من حذف هذه الوصفة؟"
      />
    </div>
  );
}
