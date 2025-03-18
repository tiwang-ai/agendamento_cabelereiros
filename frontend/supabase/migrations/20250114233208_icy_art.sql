/*
  # Add salon details

  1. New Columns
    - `business_hours` (jsonb): Store business hours and days
    - `address` (text): Store salon address
    - `phones` (text[]): Store multiple phone numbers
    - `general_info` (text): Store general information about the salon

  2. Changes
    - Add new columns to salons table
    - All columns are nullable to maintain compatibility with existing data
*/

ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS business_hours jsonb,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS phones text[],
  ADD COLUMN IF NOT EXISTS general_info text;