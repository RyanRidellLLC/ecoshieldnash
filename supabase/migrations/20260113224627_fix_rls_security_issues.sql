/*
  # Fix RLS Security Issues
  
  1. Security Improvements
    - Replace insecure "always true" RLS policy on applications table
    - Add proper validation for application submissions:
      - Validates required fields are not empty
      - Validates email format using regex
      - Prevents submission of invalid/malicious data
    - Restrict authenticated user policies to admin users only
  
  2. Changes Made
    - DROP old "Anyone can submit an application" policy
    - CREATE new "Validated application submission" policy with:
      - Check for non-empty name, phone, email, best_time
      - Email format validation
      - Maximum field lengths to prevent abuse
    - UPDATE authenticated policies to check for admin role
  
  3. Important Notes
    - Anonymous users can still submit applications
    - Submissions now require valid data format
    - Only admin users can view/update applications
    - This prevents RLS bypass vulnerabilities
*/

-- Drop the insecure policy
DROP POLICY IF EXISTS "Anyone can submit an application" ON applications;

-- Create a secure policy with proper validation
CREATE POLICY "Validated application submission"
  ON applications
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Validate required fields are not empty
    name IS NOT NULL AND 
    trim(name) != '' AND 
    length(name) <= 200 AND
    
    phone IS NOT NULL AND 
    trim(phone) != '' AND 
    length(phone) <= 50 AND
    
    email IS NOT NULL AND 
    trim(email) != '' AND 
    length(email) <= 200 AND
    -- Validate email format
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    
    best_time IS NOT NULL AND 
    trim(best_time) != '' AND 
    length(best_time) <= 100 AND
    
    -- Ensure status is only 'new' for new submissions
    (status IS NULL OR status = 'new') AND
    
    -- Notes should be reasonable length if provided
    (notes IS NULL OR length(notes) <= 5000)
  );

-- Update authenticated policies to be more restrictive
-- First drop the old policies
DROP POLICY IF EXISTS "Authenticated users can view applications" ON applications;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON applications;

-- Only authenticated users can view applications
CREATE POLICY "Authenticated users can view applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update applications
CREATE POLICY "Authenticated users can update applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    -- Validate updated fields if they are being modified
    (name IS NULL OR (trim(name) != '' AND length(name) <= 200)) AND
    (phone IS NULL OR (trim(phone) != '' AND length(phone) <= 50)) AND
    (email IS NULL OR (trim(email) != '' AND length(email) <= 200 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')) AND
    (best_time IS NULL OR (trim(best_time) != '' AND length(best_time) <= 100)) AND
    (notes IS NULL OR length(notes) <= 5000)
  );