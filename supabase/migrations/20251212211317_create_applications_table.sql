/*
  # Create Applications Table

  1. New Tables
    - `applications`
      - `id` (uuid, primary key) - Unique identifier for each application
      - `name` (text, required) - Applicant's full name
      - `phone` (text, required) - Phone number
      - `email` (text, required) - Email address
      - `best_time` (text, required) - Best time to contact applicant
      - `status` (text, default 'new') - Application status (new, contacted, scheduled, etc.)
      - `notes` (text, optional) - Internal notes about the applicant
      - `created_at` (timestamptz, default now()) - When the application was submitted
      - `updated_at` (timestamptz, default now()) - When the application was last updated
  
  2. Security
    - Enable RLS on `applications` table
    - Add policy for public inserts (anyone can submit an application)
    - No public read access (only authenticated staff can view applications)
  
  3. Indexes
    - Index on email for quick lookups
    - Index on created_at for sorting by submission date
    - Index on status for filtering by application status
  
  4. Notes
    - This table stores recruiting applications from the website
    - Public can insert but cannot view (staff only)
    - Includes timestamptz for accurate time tracking
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  best_time text NOT NULL,
  status text DEFAULT 'new',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application"
  ON applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
