-- ==============================================================================
-- 006_subscription_columns_and_schema_cache.sql
-- ضمان وجود كافة أعمدة الاشتراكات والباقات وتحديث كاش المخطط لـ PostgREST
-- مشروع: كوتش شيخة (Coach Sheikha Platform)
-- ==============================================================================

-- 1. التأكد من وجود كافة أعمدة جدول الاشتراكات (subscriptions)
alter table subscriptions add column if not exists duration_unit text default 'يوم';
alter table subscriptions add column if not exists duration_value int default 30;
alter table subscriptions add column if not exists package_name_snapshot text not null default '';
alter table subscriptions add column if not exists package_price_snapshot numeric not null default 0;
alter table subscriptions add column if not exists payment_receipt_path text not null default '';
alter table subscriptions add column if not exists start_date date;
alter table subscriptions add column if not exists end_date date;
alter table subscriptions add column if not exists updated_at timestamptz not null default now();

-- 2. في حال وجود حقل قديم باسم receipt_path، نقل بياناته تلقائياً
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_name = 'subscriptions' and column_name = 'receipt_path'
  ) then
    execute 'update subscriptions set payment_receipt_path = coalesce(receipt_path, '''') where payment_receipt_path is null or payment_receipt_path = ''''';
  end if;
end $$;

-- 3. التأكد من وجود كافة أعمدة جدول الباقات (packages)
alter table packages add column if not exists duration_value int not null default 30;
alter table packages add column if not exists duration_unit text not null default 'يوم';
alter table packages add column if not exists is_available boolean not null default true;
alter table packages add column if not exists updated_at timestamptz not null default now();

-- 4. التأكد من وجود أعمدة الحسابات البنكية والمحتوى
alter table bank_accounts add column if not exists image_url text;
alter table bank_accounts add column if not exists updated_at timestamptz not null default now();

alter table site_content add column if not exists key text;
alter table site_content add column if not exists image_url text;

-- 5. فهارس التواريخ والمدد للاشتراكات في حال لم تكن موجودة
create index if not exists idx_subscriptions_dates on subscriptions(start_date, end_date);
create index if not exists idx_packages_available on packages(is_available);

-- 6. أمر إجباري لـ PostgREST لإعادة بناء ذاكرة التخزين المؤقت للمخطط فوراً
notify pgrst, 'reload schema';
