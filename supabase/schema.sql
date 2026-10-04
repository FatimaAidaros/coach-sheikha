-- ==============================================================================
-- schema.sql: المخطط الموحد الكامل لقاعدة بيانات منصة كوتش شيخة
-- Coach Sheikha Platform — Complete PostgreSQL & Supabase Database Schema
-- ملاحظة: هذا الملف يُنفذ فقط على مشروع Supabase الجديد المستقل.
-- ==============================================================================

-- 1. تفعيل الامتدادات الأساسية
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 2. إنشاء الجداول (Tables Definition)
-- ==============================================================================

-- جدول الحساب الشخصي للإدارة (Profiles)
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    role text not null default 'admin' check (role = 'admin'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- جدول إعدادات الموقع العامة (Site Settings)
create table if not exists site_settings (
    id uuid primary key default gen_random_uuid(),
    coach_name text not null default 'كوتش شيخة',
    whatsapp text not null default '967770870321',
    instagram text default 'coach_sheikha',
    email text default 'contact@coachsheikha.com',
    copyright text not null default '© 2026 كوتش شيخة. جميع الحقوق محفوظة.',
    registration_open boolean not null default true,
    registration_closed_message text default 'التسجيل مغلق حالياً، سيتم فتح باب الاشتراك قريباً.',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- جدول محتوى أقسام الموقع الديناميكي (Site Content)
create table if not exists site_content (
    id uuid primary key default gen_random_uuid(),
    section text not null unique,
    key text,
    content jsonb not null default '{}'::jsonb,
    image_url text,
    is_published boolean not null default true,
    updated_at timestamptz not null default now()
);

-- جدول الباقات التدريبية (Packages)
create table if not exists packages (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    price numeric not null check (price >= 0),
    description text,
    features jsonb not null default '[]'::jsonb,
    image_url text,
    badge text,
    is_published boolean not null default true,
    is_available boolean not null default true,
    duration_value int not null default 30,
    duration_unit text not null default 'يوم',
    display_order int not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- جدول الوصفات الصحية (Recipes)
create table if not exists recipes (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    short_description text,
    description text,
    image_url text,
    ingredients jsonb not null default '[]'::jsonb,
    preparation jsonb not null default '[]'::jsonb,
    calories int,
    protein numeric,
    carbs numeric,
    fats numeric,
    health_benefits text,
    notes text,
    is_published boolean not null default true,
    display_order int not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- جدول الشهادات والاعتمادات (Certificates)
create table if not exists certificates (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    image_url text,
    is_published boolean not null default true,
    display_order int not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- جدول قصص النجاح والآراء (Testimonials)
create table if not exists testimonials (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    content text not null,
    image_url text,
    is_published boolean not null default true,
    display_order int not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- جدول الحسابات البنكية (Bank Accounts)
create table if not exists bank_accounts (
    id uuid primary key default gen_random_uuid(),
    bank_name text not null,
    account_name text,
    account_number text not null,
    image_url text,
    is_published boolean not null default true,
    display_order int not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- جدول الاشتراكات وسندات الدفع (Subscriptions)
create table if not exists subscriptions (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    age int not null check (age between 12 and 100),
    phone text not null,
    package_id uuid references packages(id) on delete set null,
    package_name_snapshot text not null default '',
    package_price_snapshot numeric not null default 0,
    payment_receipt_path text not null default '',
    notes text,
    status text not null default 'new' check (status in ('new', 'under_review', 'accepted', 'completed', 'rejected')),
    start_date date,
    end_date date,
    duration_value int default 30,
    duration_unit text default 'يوم',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ضمان وجود الأعمدة في حال كان الجدول منشأ مسبقاً (Self-healing Schema)
alter table subscriptions add column if not exists duration_unit text default 'يوم';
alter table subscriptions add column if not exists duration_value int default 30;
alter table subscriptions add column if not exists package_name_snapshot text not null default '';
alter table subscriptions add column if not exists package_price_snapshot numeric not null default 0;
alter table subscriptions add column if not exists payment_receipt_path text not null default '';
alter table subscriptions add column if not exists start_date date;
alter table subscriptions add column if not exists end_date date;
alter table subscriptions add column if not exists updated_at timestamptz not null default now();

alter table packages add column if not exists duration_value int not null default 30;
alter table packages add column if not exists duration_unit text not null default 'يوم';
alter table packages add column if not exists is_available boolean not null default true;
alter table packages add column if not exists updated_at timestamptz not null default now();

alter table site_settings add column if not exists registration_open boolean default true;
alter table site_settings add column if not exists registration_closed_message text default 'التسجيل مغلق حالياً، سيتم فتح باب الاشتراك قريباً.';
alter table site_settings add column if not exists updated_at timestamptz not null default now();

-- ==============================================================================
-- 3. الفهارس (Indexes)
-- ==============================================================================
create index if not exists idx_subscriptions_created_at on subscriptions(created_at desc);
create index if not exists idx_subscriptions_status on subscriptions(status);
create index if not exists idx_subscriptions_package_id on subscriptions(package_id);
create index if not exists idx_subscriptions_phone on subscriptions(phone);
create index if not exists idx_subscriptions_dates on subscriptions(start_date, end_date);

create index if not exists idx_packages_slug on packages(slug);
create index if not exists idx_packages_published_order on packages(is_published, display_order);
create index if not exists idx_packages_available on packages(is_available);

create index if not exists idx_recipes_slug on recipes(slug);
create index if not exists idx_recipes_published_order on recipes(is_published, display_order);

create index if not exists idx_certificates_published_order on certificates(is_published, display_order);
create index if not exists idx_testimonials_published_order on testimonials(is_published, display_order);
create index if not exists idx_bank_accounts_published_order on bank_accounts(is_published, display_order);
create index if not exists idx_site_content_section on site_content(section);

-- ==============================================================================
-- 4. سياسات حماية مستوى الصفوف (Row Level Security - RLS)
-- ==============================================================================
alter table profiles enable row level security;
alter table site_settings enable row level security;
alter table site_content enable row level security;
alter table packages enable row level security;
alter table recipes enable row level security;
alter table certificates enable row level security;
alter table testimonials enable row level security;
alter table bank_accounts enable row level security;
alter table subscriptions enable row level security;

-- دالة التحقق من صلاحية المدير
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

-- سياسات profiles
create policy "users read own profile" on profiles for select using (auth.uid() = id or is_admin());
create policy "admin manages profiles" on profiles for all using (is_admin()) with check (is_admin());

-- سياسات site_settings & site_content
create policy "public read site settings" on site_settings for select using (true);
create policy "admin manages site settings" on site_settings for all using (is_admin()) with check (is_admin());
create policy "public read published site content" on site_content for select using (is_published = true or is_admin());
create policy "admin manages site content" on site_content for all using (is_admin()) with check (is_admin());

-- سياسات packages, recipes, certificates, testimonials, bank_accounts
create policy "public read published packages" on packages for select using (is_published = true or is_admin());
create policy "admin manages packages" on packages for all using (is_admin()) with check (is_admin());

create policy "public read published recipes" on recipes for select using (is_published = true or is_admin());
create policy "admin manages recipes" on recipes for all using (is_admin()) with check (is_admin());

create policy "public read published certificates" on certificates for select using (is_published = true or is_admin());
create policy "admin manages certificates" on certificates for all using (is_admin()) with check (is_admin());

create policy "public read published testimonials" on testimonials for select using (is_published = true or is_admin());
create policy "admin manages testimonials" on testimonials for all using (is_admin()) with check (is_admin());

create policy "public read published bank accounts" on bank_accounts for select using (is_published = true or is_admin());
create policy "admin manages bank accounts" on bank_accounts for all using (is_admin()) with check (is_admin());

-- سياسات subscriptions
create policy "visitors insert subscription" on subscriptions for insert with check (status = 'new');
create policy "admin select subscriptions" on subscriptions for select using (is_admin());
create policy "admin update subscriptions" on subscriptions for update using (is_admin()) with check (is_admin());
create policy "admin delete subscriptions" on subscriptions for delete using (is_admin());

-- ==============================================================================
-- 5. إعداد سلات التخزين (Storage Buckets)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values 
  ('recipes', 'recipes', true),
  ('certificates', 'certificates', true),
  ('site-images', 'site-images', true),
  ('payment-receipts', 'payment-receipts', false)
on conflict (id) do update set public = excluded.public;

create policy "public read recipes images" on storage.objects for select using (bucket_id = 'recipes');
create policy "public read certificates images" on storage.objects for select using (bucket_id = 'certificates');
create policy "public read site images" on storage.objects for select using (bucket_id = 'site-images');
create policy "anyone upload payment receipt" on storage.objects for insert with check (bucket_id = 'payment-receipts');
create policy "admin read payment receipts" on storage.objects for select using (bucket_id = 'payment-receipts' and is_admin());
create policy "admin manage all storage objects" on storage.objects for all using (is_admin()) with check (is_admin());

-- ==============================================================================
-- 6. تفعيل الاستماع اللحظي (Realtime)
-- ==============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
      and schemaname = 'public' 
      and tablename = 'subscriptions'
  ) then
    alter publication supabase_realtime add table subscriptions;
  end if;
end
$$;

-- 7. إعادة تحميل ذاكرة التخزين المؤقت لـ PostgREST فوراً
notify pgrst, 'reload schema';
