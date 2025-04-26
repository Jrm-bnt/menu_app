export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type MealType = 'lunch' | 'dinner';

export type MenuItem = {
  id?: number;
  day: WeekDay;
  recipe_id?: number;
  recipe_name: string;
  meal_type: MealType;
  menu_date: string; // ISO date string format
  user_id?: string;
  created_at?: string;
};

export type DayMeals = {
  lunch: MenuItem[];
  dinner: MenuItem[];
};

export type WeeklyMenu = {
  [key in WeekDay]: DayMeals;
};
