-- ==============================================================================
-- 002_indexes.sql: فهارس تحسين الأداء وتسريع الاستعلامات
-- مشروع: كوتش شيخة (Coach Sheikha Platform)
-- ==============================================================================

-- فهارس الاشتراكات
create index if not exists idx_subscriptions_created_at on subscriptions(created_at desc);
create index if not exists idx_subscriptions_status on subscriptions(status);
create index if not exists idx_subscriptions_package_id on subscriptions(package_id);
create index if not exists idx_subscriptions_phone on subscriptions(phone);
create index if not exists idx_subscriptions_dates on subscriptions(start_date, end_date);

-- فهارس الباقات
create index if not exists idx_packages_slug on packages(slug);
create index if not exists idx_packages_published_order on packages(is_published, display_order);
create index if not exists idx_packages_available on packages(is_available);

-- فهارس الوصفات
create index if not exists idx_recipes_slug on recipes(slug);
create index if not exists idx_recipes_published_order on recipes(is_published, display_order);

-- فهارس الشهادات
create index if not exists idx_certificates_published_order on certificates(is_published, display_order);

-- فهارس قصص النجاح
create index if not exists idx_testimonials_published_order on testimonials(is_published, display_order);

-- فهارس الحسابات البنكية
create index if not exists idx_bank_accounts_published_order on bank_accounts(is_published, display_order);

-- فهارس محتوى الموقع
create index if not exists idx_site_content_section on site_content(section);
