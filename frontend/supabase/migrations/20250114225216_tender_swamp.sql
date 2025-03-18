/*
  # Add no-show status to appointments table

  1. Changes
    - Update the valid_status constraint to include 'no-show' as a valid status
*/

ALTER TABLE appointments 
  DROP CONSTRAINT IF EXISTS valid_status,
  ADD CONSTRAINT valid_status 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show'));