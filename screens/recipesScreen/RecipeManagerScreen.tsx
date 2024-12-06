import React, { useState } from 'react'
import { View } from 'react-native'
import { Recipe } from '../../type/recipes'
import RecipesScreen from './RecipesScreen'
import AddRecipesScreen from './AddRecipesScreen'
import { Ingredient } from '../../type/ingredient'
import RecipeDetailsScreen from './RecipesDetailsScreen'
import { supabase } from '../../lib/supabase'

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
    <View style={{ flex: 1 }}>
      {!selectedRecipe && !isEditing && (
        <RecipesScreen
          onSelect={handleRecipeSelect}
          onAddNew={handleAddNewRecipe}
        />
      )}
      {selectedRecipe && !isEditing && (
        <RecipeDetailsScreen
          recipe={selectedRecipe}
          ingredients={ingredientsSelectedRecipe}
          onEdit={handleEdit}
          onBack={handleBackToList}
        />
      )}
      {isEditing && (
        <AddRecipesScreen
          recipe={selectedRecipe}
          ingredientsProps={selectedRecipe ? ingredientsSelectedRecipe : []}
          onSave={handleBackToList}
          onCancel={handleBackRecipe}
        />
      )}
    </View>
  )
}

export default RecipeManagerScreen
