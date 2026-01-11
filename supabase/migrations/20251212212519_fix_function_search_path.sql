/*
  # Fix Function Search Path Security Issue

  1. Changes
    - Update `update_updated_at_column` function to have an immutable search_path
    - This prevents potential search_path injection attacks
  
  2. Security
    - Sets search_path explicitly to prevent malicious schema manipulation
    - Function now uses a fixed search_path for better security
*/

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
