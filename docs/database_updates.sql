-- Add menu_date column to menu_items table
ALTER TABLE menu_items ADD COLUMN menu_date DATE;

-- Update existing records to have a default date (current date)
UPDATE menu_items SET menu_date = CURRENT_DATE WHERE menu_date IS NULL;

-- Add a comment to explain the purpose of the column
COMMENT ON COLUMN menu_items.menu_date IS 'The date for which this menu item is scheduled';

-- Instructions for running this script:
-- 1. Log in to your Supabase dashboard
-- 2. Go to the SQL Editor
-- 3. Paste this script and run it
-- 4. Verify that the menu_date column has been added to the menu_items table
