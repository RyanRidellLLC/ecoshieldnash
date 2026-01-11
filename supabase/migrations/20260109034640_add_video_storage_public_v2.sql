/*
  # Add Video Storage Support with Public Access

  1. Changes to Applications Table
    - Add `video_url` field (text, optional) - URL to the uploaded video file in storage
    - Add `video_filename` field (text, optional) - Original filename of the uploaded video
    - Add `video_size` field (bigint, optional) - Size of the video file in bytes
    - Add `video_uploaded_at` field (timestamptz, optional) - When the video was uploaded

  2. Storage Setup
    - Create 'application-videos' storage bucket for video uploads
    - Set max file size to 100MB
    - Allow public uploads AND public viewing (videos are publicly accessible)
    - Supported formats: mp4, mov, avi, webm

  3. Security
    - RLS policies for storage bucket
    - Anyone can upload videos (anon role)
    - Anyone can view videos (public access)
    - Only authenticated users can delete videos

  4. Notes
    - Videos are stored separately from database records
    - Database stores references to storage files
    - Videos are publicly viewable by anyone with the URL
*/

-- Add video-related columns to applications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE applications ADD COLUMN video_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'video_filename'
  ) THEN
    ALTER TABLE applications ADD COLUMN video_filename text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'video_size'
  ) THEN
    ALTER TABLE applications ADD COLUMN video_size bigint;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'video_uploaded_at'
  ) THEN
    ALTER TABLE applications ADD COLUMN video_uploaded_at timestamptz;
  END IF;
END $$;

-- Create storage bucket for application videos (public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-videos',
  'application-videos',
  true,
  104857600,
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload application videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view application videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view application videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete application videos" ON storage.objects;

-- Create RLS policies for storage bucket
-- Allow anonymous and authenticated users to upload videos
CREATE POLICY "Anyone can upload application videos"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'application-videos');

-- Allow anyone to view videos (public access)
CREATE POLICY "Anyone can view application videos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'application-videos');

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete application videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'application-videos');
