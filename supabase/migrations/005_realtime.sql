-- ==============================================================================
-- 005_realtime.sql: تفعيل البث اللحظي (Realtime) لجدول الاشتراكات
-- مشروع: كوتش شيخة (Coach Sheikha Platform)
-- ==============================================================================

-- تفعيل البث اللحظي لجدول subscriptions حتى تتحدث لوحة التحكم فور وصول اشتراك جديد
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
