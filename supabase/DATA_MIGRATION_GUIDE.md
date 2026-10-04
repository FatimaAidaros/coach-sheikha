# دليل نقل البيانات الآمن من مشروع Supabase السابق إلى المشروع الجديد
## Safe Data Migration Guide (Coach Sheikha Platform)

> [!CAUTION]
> **قاعدة أمان قصوى:** يُمنع تمامًا تشغيل أوامر الحذف (`DROP TABLE` / `TRUNCATE` / `DELETE`) أو تنفيذ المايجريشن الجديد على مشروع Supabase القديم أو المشترك. نقل البيانات يتم بالقراءة والتصدير فقط (Read & Export).

---

### الخطوة 1: تصدير البيانات من المشروع القديم (Export)

إذا كانت هناك بيانات فعلية مخزنة في المشروع القديم ترغبين في نقلها:

1. ادخلي إلى **Supabase Dashboard** للمشروع القديم.
2. توجهي إلى **Table Editor**.
3. لكل جدول ترغبين بنقل بياناته (مثل `subscriptions`، `packages`، `recipes`):
   - اضغطي على زر **Export data as CSV** في أعلى الجدول.
   - احفظي الملفات محلياً على جهازك.

أو من خلال **SQL Editor** في المشروع القديم عبر استعلام القراءة فقط:
```sql
-- استعلام قراءة آمن لا يغير أي بيانات
SELECT json_agg(t) FROM packages t;
SELECT json_agg(t) FROM recipes t;
SELECT json_agg(t) FROM subscriptions t;
```

---

### الخطوة 2: تهيئة مشروع Supabase الجديد المستقل

1. أنشئي مشروعاً جديداً كلياً ومستقلاً في Supabase.
2. افتحي **SQL Editor** في المشروع الجديد.
3. قومي بتشغيل ملفات المايجريشن بالترتيب التالي:
   - `001_schema.sql` (إنشاء الجداول والقيود).
   - `002_indexes.sql` (إنشاء الفهارس).
   - `003_rls.sql` (تفعيل حماية RLS وصلاحيات الزوار والمدير).
   - `004_storage.sql` (إنشاء سلات التخزين وقواعد الحماية).
   - `005_realtime.sql` (تفعيل البث اللحظي لجدول الاشتراكات).
4. بعد تشغيل المايجريشن، شغلي ملف `seed.sql` لزرع البيانات التأسيسية.

---

### الخطوة 3: إنشاء حساب الكوتش الإداري (Admin User)

1. في مشروع Supabase الجديد، توجهي إلى **Authentication** -> **Users**.
2. اضغطي **Add User** وأدخلي البريد الإلكتروني الخاص بك وكلمة مرور قوية.
3. انسخي معرّف المستخدم (User UID).
4. افتحي **SQL Editor** وشغلي الأمر التالي لمنح الحساب صلاحية `admin`:
```sql
INSERT INTO profiles (id, full_name, role)
VALUES ('ضع_معرف_المستخدم_هنا', 'كوتش شيخة', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

### الخطوة 4: نقل ملفات سندات الدفع وصور التخزين (Storage Migration)

1. في المشروع القديم، ادخلي إلى **Storage** وحمّلي محتويات `payment-receipts` و `recipes` محلياً.
2. في المشروع الجديد، ارفعي الملفات إلى السلات المطابقة (`payment-receipts` كـ Private، وبقية السلات كـ Public).

---

### الخطوة 5: ربط التطبيق بالمشروع الجديد

1. افتحي ملف `.env` في هذا المشروع.
2. ضعي المتغيرات الجديدة الخاصة بمشروع Supabase الجديد:
```env
VITE_SUPABASE_URL=https://your-new-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key
```
3. لا تضعي أبداً مفتاح `service_role` أو كلمة مرور قاعدة البيانات في الواجهة الأمامية.
