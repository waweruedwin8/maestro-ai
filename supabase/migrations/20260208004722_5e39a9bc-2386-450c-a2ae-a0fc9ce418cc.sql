
-- Create storage bucket for music sheet uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('music-sheets', 'music-sheets', true);

-- Allow anyone to read music sheets (public bucket)
CREATE POLICY "Music sheets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'music-sheets');

-- Allow anyone to upload music sheets (no auth required for hackathon demo)
CREATE POLICY "Anyone can upload music sheets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'music-sheets');

-- Create table for uploaded sheet metadata and AI-extracted notation
CREATE TABLE public.uploaded_sheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image', 'midi')),
  storage_path TEXT NOT NULL,
  original_url TEXT,
  title TEXT,
  composer TEXT,
  key_signature TEXT,
  time_signature TEXT,
  tempo INTEGER,
  abc_notation TEXT,
  sol_fa TEXT,
  parts JSONB DEFAULT '{}'::jsonb,
  part_notes JSONB DEFAULT '{}'::jsonb,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (but allow public access for hackathon)
ALTER TABLE public.uploaded_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view uploaded sheets"
ON public.uploaded_sheets FOR SELECT USING (true);

CREATE POLICY "Anyone can insert uploaded sheets"
ON public.uploaded_sheets FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update uploaded sheets"
ON public.uploaded_sheets FOR UPDATE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_uploaded_sheets_updated_at
BEFORE UPDATE ON public.uploaded_sheets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
