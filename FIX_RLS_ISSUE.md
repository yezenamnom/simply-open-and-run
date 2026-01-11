# إصلاح مشكلة RLS (Row Level Security) في Supabase

## المشكلة
خطأ `42501`: "new row violates row-level security policy for table 'lessons'"

## الحل السريع

### الخطوة 1: افتح Supabase Dashboard
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجّل الدخول إلى حسابك
3. اختر المشروع الخاص بك

### الخطوة 2: افتح SQL Editor
1. من القائمة الجانبية، اضغط على **SQL Editor**
2. اضغط على **New Query**

### الخطوة 3: نفّذ هذا الكود

انسخ والصق الكود التالي واضغط **Run**:

```sql
-- إصلاح RLS policies لجدول lessons
-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Allow public read access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public insert access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public update access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public delete access to lessons" ON public.lessons;

-- إنشاء سياسات جديدة تسمح للجميع بالوصول
-- السماح بالقراءة
CREATE POLICY "Allow public read access to lessons"
ON public.lessons FOR SELECT
USING (true);

-- السماح بالإدراج
CREATE POLICY "Allow public insert access to lessons"
ON public.lessons FOR INSERT
WITH CHECK (true);

-- السماح بالتحديث
CREATE POLICY "Allow public update access to lessons"
ON public.lessons FOR UPDATE
USING (true)
WITH CHECK (true);

-- السماح بالحذف
CREATE POLICY "Allow public delete access to lessons"
ON public.lessons FOR DELETE
USING (true);

-- التأكد من تفعيل RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
```

### الخطوة 4: التحقق من النجاح
بعد تنفيذ الكود، يجب أن ترى رسالة "Success" في الأسفل.

### الخطوة 5: إعادة تحميل التطبيق
1. أعد تحميل الصفحة (F5)
2. جرّب حفظ درس مرة أخرى

## التحقق من الإعدادات

### التحقق من RLS Policies
1. في Supabase Dashboard، اذهب إلى **Authentication** → **Policies**
2. أو اذهب إلى **Table Editor** → **lessons** → **Policies**
3. تأكد من وجود 4 policies:
   - Allow public read access to lessons
   - Allow public insert access to lessons
   - Allow public update access to lessons
   - Allow public delete access to lessons

### التحقق من RLS Status
1. في **Table Editor** → **lessons**
2. تأكد من أن **RLS Enabled** مفعّل (يجب أن يكون أخضر)

## إذا استمرت المشكلة

### 1. تحقق من ملف .env
تأكد من وجود هذه المتغيرات:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 2. تحقق من API Keys
1. في Supabase Dashboard، اذهب إلى **Settings** → **API**
2. انسخ **Project URL** و **anon public** key
3. تأكد من أنها مطابقة لملف `.env`

### 3. أعد تشغيل السيرفر
بعد تعديل ملف `.env`:
```bash
# أوقف السيرفر (Ctrl+C)
# ثم أعد تشغيله
npm run dev
```

## ملاحظات أمنية

⚠️ **تحذير**: هذه السياسات تسمح للجميع بالوصول إلى جدول `lessons`. 
للاستخدام في الإنتاج، يجب:
- إضافة نظام مصادقة (Authentication)
- تعديل السياسات لتكون مبنية على المستخدم المسجل دخوله
- استخدام `auth.uid()` في السياسات

## الدعم

إذا استمرت المشكلة بعد تطبيق هذه الخطوات، تحقق من:
- Console في المتصفح (F12) للأخطاء الإضافية
- Network tab في Developer Tools للتحقق من طلبات Supabase
- Supabase Dashboard → Logs للأخطاء من جانب الخادم

