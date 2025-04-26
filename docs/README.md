# Menu App Documentation

This directory contains documentation for the Menu App project.

## Recent Fixes

### 1. Expo Updates Error

Fixed the error "checkForUpdateAsync() is not supported in Expo Go" by modifying `App.tsx` to conditionally check for updates only in production builds, not in Expo Go. The fix uses `Updates.isEmbeddedLaunch` to determine if the app is running in a production build.

### 2. React Key Prop Warning

Fixed the warning "A props object containing a 'key' prop is being spread into JSX" by creating a custom wrapper component for BottomNavigation in `components/CustomBottomNavigation.tsx`. This component extracts the key prop and passes it directly to the component, avoiding the warning.

### 3. Database Error - menu_date

Fixed the error "column menu_items.menu_date does not exist" by creating a SQL script in `docs/database_updates.sql` that adds the missing column to the menu_items table. This script needs to be executed in the Supabase dashboard to apply the changes to the database.

### 4. Database Error - meal_type

Fixed the error "Could not find the 'meal_type' column of 'menu_items' in the schema cache" by creating a SQL script in `docs/add_meal_type_column.sql` that adds the missing column to the menu_items table. This script needs to be executed in the Supabase dashboard to apply the changes to the database.

### 5. Bottom Navigation Error

Fixed the error "Cannot read properties of undefined (reading 'renderBar')" by simplifying the CustomBottomNavigation component. The previous implementation was trying to modify the prototype of the BottomNavigation component from react-native-paper, but this approach no longer works with the current version of the library. The new implementation simply passes the props to the BottomNavigation component without trying to modify its internal behavior.

## How to Apply the Database Fixes

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Open the appropriate SQL file in this repository (`docs/database_updates.sql` for menu_date or `docs/add_meal_type_column.sql` for meal_type)
4. Copy the SQL code and paste it into the SQL Editor
5. Run the script
6. Verify that the column has been added to the menu_items table

## Project Structure

The Menu App is organized into the following directories:

- `components`: Reusable UI components
- `config`: Configuration files
- `docs`: Documentation and database scripts
- `lib`: Library code, including Supabase client
- `navigation`: Navigation components and configuration
- `screens`: Screen components organized by feature
- `type`: TypeScript type definitions
