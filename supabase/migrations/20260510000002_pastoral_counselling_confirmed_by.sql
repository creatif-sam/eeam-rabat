-- Add confirmed_by_name to track who approved the pastoral counselling session
ALTER TABLE pastoral_counselling
  ADD COLUMN IF NOT EXISTS confirmed_by_name TEXT;
