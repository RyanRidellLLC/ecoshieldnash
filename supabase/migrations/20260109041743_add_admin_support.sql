/*
  # Add Admin Support for Application Management

  1. Changes to RLS Policies
    - Update SELECT policy to only allow admin users to view applications
    - Update UPDATE policy to only allow admin users to modify applications
    - Keep INSERT policy for anonymous users (public applications)

  2. Security Notes
    - Admin status is determined by checking `auth.jwt()->>'is_admin'` metadata
    - Only users with `is_admin = true` in their JWT can access application data
    - This requires setting custom claims in user metadata via Supabase Dashboard or API
    
  3. Important
    - To make a user an admin, update their `raw_app_meta_data` in the auth.users table:
      UPDATE auth.users 
      SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb 
      WHERE email = 'your-admin-email@example.com';
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view applications" ON applications;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON applications;

-- Create new admin-only policies
CREATE POLICY "Admin users can view applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'is_admin')::boolean = true);

CREATE POLICY "Admin users can update applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt()->>'is_admin')::boolean = true);

CREATE POLICY "Admin users can delete applications"
  ON applications
  FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'is_admin')::boolean = true);