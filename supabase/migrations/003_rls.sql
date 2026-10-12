-- ==============================================================================
-- 003_rls.sql: سياسات الأمان وحماية مستوى الصفوف (Row Level Security)
-- مشروع: كوتش شيخة (Coach Sheikha Platform)
-- ==============================================================================

-- 1. تفعيل RLS على جميع الجداول التسعة
alter table profiles enable row level security;
alter table site_settings enable row level security;
alter table site_content enable row level security;
alter table packages enable row level security;
alter table recipes enable row level security;
alter table certificates enable row level security;
alter table testimonials enable row level security;
alter table bank_accounts enable row level security;
alter table subscriptions enable row level security;

-- 2. دالة التحقق من صلاحية المدير (is_admin)
create or replace function is_admin() 
returns boolean 
language sql 
stable 
security definer 
set search_path = public 
as $$
  select exists (
    select 1 from profiles 
    where id = auth.uid() 
      and role = 'admin'
  );
$$;

-- 3. سياسات جدول المستخدمين الإداريين (Profiles)
create policy "users read own profile" 
on profiles for select 
using (auth.uid() = id or is_admin());

create policy "admin manages profiles" 
on profiles for all 
using (is_admin()) 
with check (is_admin());

-- 4. سياسات إعدادات ومحتوى الموقع (Site Settings & Content)
create policy "public read site settings" 
on site_settings for select 
using (true);

create policy "admin manages site settings" 
on site_settings for all 
using (is_admin()) 
with check (is_admin());

create policy "public read published site content" 
on site_content for select 
using (is_published = true or is_admin());

create policy "admin manages site content" 
on site_content for all 
using (is_admin()) 
with check (is_admin());

-- 5. سياسات الباقات (Packages)
create policy "public read published packages" 
on packages for select 
using (is_published = true or is_admin());

create policy "admin manages packages" 
on packages for all 
using (is_admin()) 
with check (is_admin());

-- 6. سياسات الوصفات (Recipes)
create policy "public read published recipes" 
on recipes for select 
using (is_published = true or is_admin());

create policy "admin manages recipes" 
on recipes for all 
using (is_admin()) 
with check (is_admin());

-- 7. سياسات الشهادات (Certificates)
create policy "public read published certificates" 
on certificates for select 
using (is_published = true or is_admin());

create policy "admin manages certificates" 
on certificates for all 
using (is_admin()) 
with check (is_admin());

-- 8. سياسات قصص النجاح (Testimonials)
create policy "public read published testimonials" 
on testimonials for select 
using (is_published = true or is_admin());

create policy "admin manages testimonials" 
on testimonials for all 
using (is_admin()) 
with check (is_admin());

-- 9. سياسات الحسابات البنكية (Bank Accounts)
create policy "public read published bank accounts" 
on bank_accounts for select 
using (is_published = true or is_admin());

create policy "admin manages bank accounts" 
on bank_accounts for all 
using (is_admin()) 
with check (is_admin());

-- 10. سياسات الاشتراكات (Subscriptions)
-- الزوار يمكنهم فقط إنشاء اشتراك جديد وتكون حالته 'new'
create policy "visitors insert subscription" 
on subscriptions for insert 
with check (status = 'new');

-- المدير المصرح له فقط يمكنه استعراض، تعديل، أو حذف الاشتراكات
create policy "admin select subscriptions" 
on subscriptions for select 
using (is_admin());

create policy "admin update subscriptions" 
on subscriptions for update 
using (is_admin()) 
with check (is_admin());

create policy "admin delete subscriptions" 
on subscriptions for delete 
using (is_admin());
