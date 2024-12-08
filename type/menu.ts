export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type MenuItem = {
  id?: number;
  day: WeekDay;
  recipe_id?: number;
  recipe_name: string;
  user_id?: string;
  created_at?: string;
};

export type WeeklyMenu = {
  [key in WeekDay]: MenuItem[];
};
