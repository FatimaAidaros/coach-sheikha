-- ==============================================================================
-- 004_storage.sql: إعداد سلات التخزين (Storage Buckets) وسياسات الأمان
-- مشروع: كوتش شيخة (Coach Sheikha Platform)
-- ==============================================================================

-- 1. إنشاء سلات التخزين في جدول storage.buckets
insert into storage.buckets (id, name, public)
values 
  ('recipes', 'recipes', true),
  ('certificates', 'certificates', true),
  ('site-images', 'site-images', true),
  ('payment-receipts', 'payment-receipts', false)
on conflict (id) do update set public = excluded.public;

-- 2. سياسات السلات العامة: القراءة متاحة للجميع
create policy "public read recipes images" 
on storage.objects for select 
using (bucket_id = 'recipes');

create policy "public read certificates images" 
on storage.objects for select 
using (bucket_id = 'certificates');

create policy "public read site images" 
on storage.objects for select 
using (bucket_id = 'site-images');

-- 3. سلة سندات الدفع الخاصة (payment-receipts):
-- السماح للزوار برفع السند فقط دون إمكانية القراءة المباشرة
create policy "anyone upload payment receipt" 
on storage.objects for insert 
with check (bucket_id = 'payment-receipts');

-- القراءة للمدير فقط عبر الروابط الموقعة (Signed URLs)
create policy "admin read payment receipts" 
on storage.objects for select 
using (bucket_id = 'payment-receipts' and is_admin());

-- 4. صلاحيات الإدارة الكاملة للمدير على كافة السلات
create policy "admin manage all storage objects" 
on storage.objects for all 
using (is_admin()) 
with check (is_admin());
