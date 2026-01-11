-- Create updated_at function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  query TEXT NOT NULL,
  citations TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (no auth required)
CREATE POLICY "Allow public read access to lessons"
ON public.lessons FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to lessons"
ON public.lessons FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to lessons"
ON public.lessons FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to lessons"
ON public.lessons FOR DELETE USING (true);

-- Create storage bucket for lesson images
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-images', 'lesson-images', true);

-- Storage policies for lesson images
CREATE POLICY "Allow public read access to lesson images"
ON storage.objects FOR SELECT USING (bucket_id = 'lesson-images');

CREATE POLICY "Allow public upload to lesson images"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lesson-images');

CREATE POLICY "Allow public delete from lesson images"
ON storage.objects FOR DELETE USING (bucket_id = 'lesson-images');

-- Create updated_at trigger
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();