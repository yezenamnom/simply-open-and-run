-- Fix RLS policies for lessons table
-- This migration ensures that all users can read, insert, update, and delete lessons

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public insert access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public update access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public delete access to lessons" ON public.lessons;

-- Recreate policies with proper permissions
-- Allow anyone to read lessons
CREATE POLICY "Allow public read access to lessons"
ON public.lessons FOR SELECT
USING (true);

-- Allow anyone to insert lessons
CREATE POLICY "Allow public insert access to lessons"
ON public.lessons FOR INSERT
WITH CHECK (true);

-- Allow anyone to update lessons
CREATE POLICY "Allow public update access to lessons"
ON public.lessons FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete lessons
CREATE POLICY "Allow public delete access to lessons"
ON public.lessons FOR DELETE
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

