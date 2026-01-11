-- Update bucket to be private
UPDATE storage.buckets SET public = false WHERE id = 'lesson-images';

-- Drop permissive policies
DROP POLICY IF EXISTS "Allow public read access to lesson images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to lesson images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from lesson images" ON storage.objects;

-- Authenticated users can upload with ownership tracking (folder = user_id)
CREATE POLICY "Authenticated users can upload lesson images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can read their own uploads
CREATE POLICY "Users can read own lesson images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own lesson images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);