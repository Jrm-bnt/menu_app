-- Add meal_type column to menu_items table
ALTER TABLE menu_items ADD COLUMN meal_type TEXT;

-- Update existing records to have a default meal type (dinner)
UPDATE menu_items SET meal_type = 'dinner' WHERE meal_type IS NULL;

-- Add a comment to explain the purpose of the column
COMMENT ON COLUMN menu_items.meal_type IS 'The type of meal (lunch or dinner)';

-- Instructions for running this script:
-- 1. Log in to your Supabase dashboard
-- 2. Go to the SQL Editor
-- 3. Paste this script and run it
-- 4. Verify that the meal_type column has been added to the menu_items table
