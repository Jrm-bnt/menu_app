import React, { useEffect, useState } from 'react'
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native'
import { supabase } from '../../lib/supabase'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../../type/navigation'

type RecipeDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'RecipeDetails'>
  navigation: any
}

const RecipeDetailsScreen = ({
  route,
  navigation,
}: RecipeDetailsScreenProps) => {
  const { recipeId } = route.params
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single()

      if (error) {
        console.error('Error fetching recipe details:', error)
      } else {
        setRecipe(data)
      }
      setLoading(false)
    }

    fetchRecipeDetails()
  }, [recipeId])

  const handleDelete = async () => {
    const { error } = await supabase.from('recipes').delete().eq('id', recipeId)
    if (error) {
      console.error('Error deleting recipe:', error)
    } else {
      navigation.navigate('Recipes')
    }
  }

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />
  }

  return (
    <View style={styles.container}>
      {recipe ? (
        <>
          <Text style={styles.title}>{recipe.name}</Text>
          <Text style={styles.description}>{recipe.description}</Text>
          <Button
            title="Modifier"
            onPress={() => navigation.navigate('AddRecipe', { recipe })}
          />
          <Button title="Supprimer" color="red" onPress={handleDelete} />
        </>
      ) : (
        <Text>Recette introuvable</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
})

export default RecipeDetailsScreen
