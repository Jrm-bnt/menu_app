import React, { useState } from 'react'
import { Button, FlatList, View, Text, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import { NavigationProp, useFocusEffect } from '@react-navigation/native'
import { RootStackParamList } from '../../type/navigation'
import { Recipe } from '../../type/recipes'

type RecipesScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'Recipes'>
}

const RecipesScreen = ({ navigation }: RecipesScreenProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([])

  const fetchRecipes = async () => {
    const { data, error } = await supabase.from('recipes').select('*')
    if (error) return console.error('Error fetching recipes:', error)
    else setRecipes(data || [])
  }

  const handleViewDetails = (recipe: Recipe) => {
    navigation.navigate('RecipeDetails', { recipe })
  }

  useFocusEffect(
    React.useCallback(() => {
      console.log('refresh on focus')
      fetchRecipes()
    }, [])
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.recipeItem}>
            <Text
              style={styles.recipeName}
              onPress={() => {
                handleViewDetails(item)
              }}
            >
              {item.name}{' '}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune recette trouvée</Text>
        }
      />
      <Button
        title="Ajouter une recette"
        onPress={() => navigation.navigate('AddRecipe')}
        color="green"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  recipeItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 16,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
    color: 'gray',
  },
})

export default RecipesScreen
