-- ==============================================================================
-- 001_schema.sql: تعريف جداول المنصة والمفاتيح الأجنبية والقيود
-- مشروع: كوتش شيخة (Coach Sheikha Platform)
-- ملاحظة: هذا الملف يطبق فقط على مشروع Supabase الجديد المستقل.
-- ==============================================================================

-- 1. تفعيل الامتدادات الأساسية
create extension if not exists "uuid-ossp";

-- 2. جدول الحساب الشخصي للإدارة (Profiles)
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    role text not null default 'admin' check (role = 'admin'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. جدول إعدادات الموقع العامة (Site Settings)
create table if not exists site_settings (
    id uuid primary key default gen_random_uuid(),
    coach_name text not null default 'كوتش شيخة',
    whatsapp text not null default '967770870321',
    instagram text default 'coach_sheikha',
    email text default 'contact@coachsheikha.com',
    copyright text not null default '© 2026 كوتش شيخة. جميع الحقوق محفوظة.',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 4. جدول محتوى أقسام الموقع الديناميكي (Site Content)
create table if not exists site_content (
    id uuid primary key default gen_random_uuid(),
    section text not null unique,
    key text,
    content jsonb not null default '{}'::jsonb,
    image_url text,
    is_published boolean not null default true,
    updated_at timestamptz not null default now()
);

-- 5. جدول الباقات التدريبية (Packages)
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

-- 6. جدول الوصفات الصحية (Recipes)
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

-- 7. جدول الشهادات والاعتمادات (Certificates)
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

-- 8. جدول قصص النجاح والآراء (Testimonials)
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

-- 9. جدول الحسابات البنكية (Bank Accounts)
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

-- 10. جدول الاشتراكات وسندات الدفع (Subscriptions)
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
