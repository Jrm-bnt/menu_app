import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, Title, Searchbar, Chip, Dialog, Portal, RadioButton, IconButton } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { Recipe } from '../../type/recipes';
import { WeekDay, MenuItem, MealType } from '../../type/menu';
import { useFocusEffect } from '@react-navigation/native';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

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

type AddRecipeToMenuScreenProps = {
  onClose: () => void;
};

const AddRecipeToMenuScreen = ({ onClose }: AddRecipeToMenuScreenProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WeekDay | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('dinner');
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

  // Fetch recipes from Supabase
  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setRecipes(data || []);
      setFilteredRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRecipes();
    }, [])
  );

  // Filter recipes based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowDayDialog(true);
  };

  // Get the date for the selected day in the current week
  const getDateForDay = (day: WeekDay): string => {
    const { start } = getWeekDates(currentDate);
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    return format(addDays(start, dayIndex), 'yyyy-MM-dd');
  };

  const handleDaySelect = async (day: WeekDay) => {
    if (!selectedRecipe) return;

    try {
      const menuDate = getDateForDay(day);

      const newItem: MenuItem = {
        day,
        recipe_id: selectedRecipe.id,
        recipe_name: selectedRecipe.name,
        meal_type: selectedMealType,
        menu_date: menuDate,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      const { error } = await supabase
        .from('menu_items')
        .insert(newItem);

      if (error) throw error;

      setShowDayDialog(false);
      setSelectedRecipe(null);
      // Show success message or feedback
    } catch (error) {
      console.error('Error adding recipe to menu:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Ajouter une recette au menu</Title>

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

      <Searchbar
        placeholder="Rechercher une recette"
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recipeItem}
            onPress={() => handleRecipeSelect(item)}
          >
            <Text style={styles.recipeName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune recette trouvée</Text>
        }
      />

      <Button
        mode="outlined"
        onPress={onClose}
        style={styles.closeButton}
      >
        Retour
      </Button>

      <Portal>
        <Dialog visible={showDayDialog} onDismiss={() => setShowDayDialog(false)}>
          <Dialog.Title>Ajouter au menu</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogSubtitle}>Type de repas:</Text>
            <RadioButton.Group
              onValueChange={value => setSelectedMealType(value as MealType)}
              value={selectedMealType}
            >
              <View style={styles.radioButtonRow}>
                <RadioButton value="lunch" />
                <Text>Déjeuner</Text>
              </View>
              <View style={styles.radioButtonRow}>
                <RadioButton value="dinner" />
                <Text>Dîner</Text>
              </View>
            </RadioButton.Group>

            <Text style={styles.dialogSubtitle}>Jour:</Text>
            <View style={styles.daysContainer}>
              {Object.entries(DAY_LABELS).map(([day, label]) => (
                <Chip
                  key={day}
                  style={styles.dayChip}
                  onPress={() => handleDaySelect(day as WeekDay)}
                >
                  {label}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDayDialog(false)}>Annuler</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekRangeText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  searchBar: {
    marginBottom: 16,
  },
  recipeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipeName: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  closeButton: {
    marginTop: 16,
  },
  dialogSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  radioButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  dayChip: {
    margin: 4,
  },
});

export default AddRecipeToMenuScreen;
