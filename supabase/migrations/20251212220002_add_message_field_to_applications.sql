/*
  # Add Message Field to Applications Table

  1. Changes
    - Add `message` field (text, required) - Applicant's description of what they'll bring to the team
    - This replaces the `best_time` field which is no longer needed
  
  2. Notes
    - Keeping `best_time` field for backward compatibility with existing data
    - New applications will use the `message` field instead
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'message'
  ) THEN
    ALTER TABLE applications ADD COLUMN message text;
  END IF;
END $$;
