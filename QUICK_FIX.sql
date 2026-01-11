-- إصلاح سريع لمشكلة RLS في Supabase
-- انسخ هذا الكود والصقه في Supabase Dashboard → SQL Editor → اضغط Run

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Allow public read access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public insert access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public update access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public delete access to lessons" ON public.lessons;

-- إنشاء سياسات جديدة
CREATE POLICY "Allow public read access to lessons"
ON public.lessons FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to lessons"
ON public.lessons FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to lessons"
ON public.lessons FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access to lessons"
ON public.lessons FOR DELETE USING (true);

-- التأكد من تفعيل RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

