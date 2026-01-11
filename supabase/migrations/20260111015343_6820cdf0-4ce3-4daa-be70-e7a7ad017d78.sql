-- Add user_id column to lessons table (nullable for existing data)
ALTER TABLE public.lessons 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_lessons_user_id ON public.lessons(user_id);

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public delete access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public insert access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public update access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow public read access to lessons" ON public.lessons;

-- Create new secure RLS policies
-- Anyone can read lessons (educational content should be public)
CREATE POLICY "Anyone can read lessons"
ON public.lessons
FOR SELECT
USING (true);

-- Only authenticated users can create lessons (and must own them)
CREATE POLICY "Authenticated users can create lessons"
ON public.lessons
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own lessons
CREATE POLICY "Users can update own lessons"
ON public.lessons
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own lessons
CREATE POLICY "Users can delete own lessons"
ON public.lessons
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);