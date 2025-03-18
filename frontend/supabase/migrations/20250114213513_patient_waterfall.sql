/*
  # Add color field to professionals table

  1. Changes
    - Add color column to professionals table with a default color
    - Add color validation check
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' AND column_name = 'color'
  ) THEN
    ALTER TABLE professionals ADD COLUMN color text DEFAULT '#4F46E5';
    ALTER TABLE professionals ADD CONSTRAINT valid_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
  END IF;
END $$;