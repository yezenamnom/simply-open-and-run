-- Drop the public read policy
DROP POLICY IF EXISTS "Anyone can read lessons" ON public.lessons;

-- Create new policy: users can only read their own lessons
-- Also allow reading legacy lessons (user_id IS NULL) for backward compatibility
CREATE POLICY "Users can read own lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);