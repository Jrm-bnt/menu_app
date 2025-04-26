import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Card, Title, Paragraph, Dialog, Portal, TextInput, FAB, Chip, IconButton } from 'react-native-paper';
import { WeekDay, MenuItem, WeeklyMenu, MealType, DayMeals } from '../../type/menu';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import AddRecipeToMenuScreen from '../recipesScreen/AddRecipeToMenuScreen';
import { format, addDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';

const DAYS_OF_WEEK: WeekDay[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

export default function HomeScreen() {
  // Initialize empty weekly menu with lunch and dinner arrays for each day
  const emptyWeeklyMenu = (): WeeklyMenu => {
    const menu: WeeklyMenu = {} as WeeklyMenu;
    DAYS_OF_WEEK.forEach(day => {
      menu[day] = {
        lunch: [],
        dinner: []
      };
    });
    return menu;
  };

  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>(emptyWeeklyMenu());
  const [selectedDay, setSelectedDay] = useState<WeekDay | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('dinner');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [showAddRecipeScreen, setShowAddRecipeScreen] = useState(false);

  // Current date for week navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Get start and end dates for the current week
  const getWeekDates = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Start on Monday
    const end = endOfWeek(date, { weekStartsOn: 1 }); // End on Sunday
    return { start, end };
  };

  // Format date for display
  const formatWeekRange = (date: Date) => {
    const { start, end } = getWeekDates(date);
    return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };

  // Fetch menu items from Supabase
  const fetchMenuItems = async () => {
    try {
      const { start, end } = getWeekDates(currentDate);

      // Format dates for Supabase query
      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .gte('menu_date', startDate)
        .lte('menu_date', endDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Initialize empty menu
      const menu = emptyWeeklyMenu();

      // Populate menu with data
      if (data) {
        data.forEach((item: MenuItem) => {
          if (item.day && menu[item.day] && item.meal_type) {
            menu[item.day][item.meal_type].push(item);
          }
        });
      }

      setWeeklyMenu(menu);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  // Add a new menu item
  const addMenuItem = async (day: WeekDay, recipeName: string, mealType: MealType) => {
    try {
      // Get the date for the selected day in the current week
      const { start } = getWeekDates(currentDate);
      const dayIndex = DAYS_OF_WEEK.indexOf(day);
      const menuDate = format(addDays(start, dayIndex), 'yyyy-MM-dd');

      const newItem: MenuItem = {
        day,
        recipe_name: recipeName,
        meal_type: mealType,
        menu_date: menuDate,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      const { data, error } = await supabase
        .from('menu_items')
        .insert(newItem)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Update local state
        setWeeklyMenu(prev => ({
          ...prev,
          [day]: {
            ...prev[day],
            [mealType]: [...prev[day][mealType], data[0]]
          }
        }));
      }

      setNewRecipeName('');
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  // Delete a menu item
  const deleteMenuItem = async (id: number, day: WeekDay, mealType: MealType) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setWeeklyMenu(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [mealType]: prev[day][mealType].filter(item => item.id !== id)
        }
      }));
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  // Fetch menu items when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchMenuItems();
    }, [])
  );

  const handleAddRecipe = (day: WeekDay, mealType: MealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setShowAddDialog(true);
  };

  const handleConfirmAdd = () => {
    if (selectedDay && newRecipeName.trim() && selectedMealType) {
      addMenuItem(selectedDay, newRecipeName.trim(), selectedMealType);
    }
  };

  const renderMealSection = (day: WeekDay, mealType: MealType) => {
    const items = weeklyMenu[day][mealType];
    const mealTitle = mealType === 'lunch' ? 'Déjeuner' : 'Dîner';

    return (
      <View style={styles.mealSection}>
        <Title style={styles.mealTitle}>{mealTitle}</Title>
        {items.length > 0 ? (
          items.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <Paragraph>{item.recipe_name}</Paragraph>
              <TouchableOpacity
                onPress={() => item.id && deleteMenuItem(item.id, day, mealType)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Paragraph style={styles.emptyText}>Aucune recette</Paragraph>
        )}
        <Button
          mode="text"
          onPress={() => handleAddRecipe(day, mealType)}
          style={styles.addButton}
        >
          Ajouter
        </Button>
      </View>
    );
  };

  const renderDayCard = (day: WeekDay) => {
    // Calculate the date for this day in the current week
    const { start } = getWeekDates(currentDate);
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    const dayDate = addDays(start, dayIndex);
    const formattedDate = format(dayDate, 'dd/MM');

    return (
      <Card style={styles.dayCard} key={day}>
        <Card.Content>
          <View style={styles.dayHeader}>
            <Title style={styles.dayTitle}>{DAY_LABELS[day]}</Title>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          {renderMealSection(day, 'lunch')}
          {renderMealSection(day, 'dinner')}
        </Card.Content>
      </Card>
    );
  };

  // Refetch menu items when current date changes
  useEffect(() => {
    fetchMenuItems();
  }, [currentDate]);

  return (
    <View style={styles.container}>
      {showAddRecipeScreen ? (
        <AddRecipeToMenuScreen onClose={() => setShowAddRecipeScreen(false)} />
      ) : (
        <>
          <View style={styles.header}>
            <Title style={styles.title}>Menu de la semaine</Title>
            <View style={styles.weekNavigation}>
              <IconButton
                icon="chevron-left"
                onPress={goToPreviousWeek}
                size={24}
              />
              <Text style={styles.weekRangeText}>{formatWeekRange(currentDate)}</Text>
              <IconButton
                icon="chevron-right"
                onPress={goToNextWeek}
                size={24}
              />
            </View>
          </View>

          <ScrollView>
            {DAYS_OF_WEEK.map(day => renderDayCard(day))}
          </ScrollView>

          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => setShowAddRecipeScreen(true)}
            label="Ajouter depuis les recettes"
          />

          <Portal>
            <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
              <Dialog.Title>Ajouter une recette</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  label="Nom de la recette"
                  value={newRecipeName}
                  onChangeText={text => setNewRecipeName(text)}
                  mode="outlined"
                  style={styles.textInput}
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowAddDialog(false)}>Annuler</Button>
                <Button onPress={handleConfirmAdd}>Ajouter</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  weekRangeText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  dayCard: {
    marginBottom: 16,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  mealSection: {
    marginVertical: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    marginTop: 8,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  textInput: {
    backgroundColor: 'white',
    marginVertical: 8,
  },
});
