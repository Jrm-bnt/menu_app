import React, { useState } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { View } from 'react-native'
import { Recipe } from '../../type/recipes'
import RecipesScreen from './RecipesScreen'
import AddRecipesScreen from './AddRecipesScreen'
import { Ingredient } from '../../type/ingredient'
import RecipeDetailsScreen from './RecipesDetailsScreen'
import { supabase } from '../../lib/supabase'

const Stack = createStackNavigator()

const RecipeManagerScreen = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [ingredientsSelectedRecipe, setIngredientsSelectedRecipe] = useState<
    Ingredient[]
  >([])

  const fetchIngredients = async (recipeId: number) => {
    try {
      const { data: ingredientsData, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('recipe_id', recipeId)

      if (error) throw error
      setIngredientsSelectedRecipe(ingredientsData || [])
    } catch (error) {
      console.error('Error fetching ingredients:', error)
    }
  }

  const handleRecipeSelect = async (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    await fetchIngredients(recipe.id)
    setIsEditing(false)
  }

  const handleEdit = async (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    await fetchIngredients(recipe.id)
    setIsEditing(true)
  }

  const handleAddNewRecipe = () => {
    setSelectedRecipe(null)
    setIsEditing(true)
  }

  const handleBackToList = () => {
    setSelectedRecipe(null)
    setIsEditing(false)
  }

  const handleBackRecipe = () => {
    setSelectedRecipe(selectedRecipe)
    setIsEditing(false)
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="RecipesList" options={{ headerShown: false }}>
        {(props) => (
          <View style={{ flex: 1 }}>
            {!selectedRecipe && !isEditing && (
              <RecipesScreen
                {...props}
                onSelect={handleRecipeSelect}
                onAddNew={handleAddNewRecipe}
              />
            )}
            {selectedRecipe && !isEditing && (
              <RecipeDetailsScreen
                {...props}
                recipe={selectedRecipe}
                ingredients={ingredientsSelectedRecipe}
                onEdit={handleEdit}
                onBack={handleBackToList}
              />
            )}
            {isEditing && (
              <AddRecipesScreen
                {...props}
                recipe={selectedRecipe}
                ingredientsProps={
                  selectedRecipe ? ingredientsSelectedRecipe : []
                }
                onSave={handleBackToList}
                onCancel={handleBackRecipe}
              />
            )}
          </View>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

export default RecipeManagerScreen
