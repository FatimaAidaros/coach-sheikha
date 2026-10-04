-- ==============================================================================
-- 007_registration_settings.sql
-- إضافة دعم إعادة الفتح التلقائي للتسجيل وحماية الاشتراكات على مستوى قاعدة البيانات
-- ==============================================================================

-- 1. إضافة أعمدة إعادة الفتح التلقائي إلى جدول site_settings
alter table site_settings 
  add column if not exists registration_auto_reopen boolean not null default false,
  add column if not exists registration_reopen_at timestamptz default null;

-- 2. تحديث سياسة الحماية (RLS) لجدول subscriptions لمنع التسجيل المباشر أثناء الإغلاق
drop policy if exists "visitors insert subscription" on subscriptions;

create policy "visitors insert subscription" on subscriptions 
for insert 
with check (
  status = 'new'
  and exists (
    select 1 from site_settings
    where registration_open = true
       or (
         registration_auto_reopen = true 
         and registration_reopen_at is not null 
         and now() >= registration_reopen_at
       )
  )
);

-- 3. تحديث ذاكرة التخزين المؤقت لـ PostgREST فوراً
notify pgrst, 'reload schema';
