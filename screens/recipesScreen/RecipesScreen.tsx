import React, { useEffect, useState } from 'react'
import { Button, FlatList, View, Text, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import { NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '../../type/navigation'

interface Recipe {
  id: number
  name: string
  description: string
}

type RecipesScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'Recipes'>
}

const RecipesScreen: React.FC<RecipesScreenProps> = ({ navigation }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabase.from('recipes').select('*')
      if (error) {
        console.error('Error fetching recipes:', error)
      } else {
        setRecipes(data || [])
      }
    }

    fetchRecipes()
  }, [])

  const handleViewDetails = (recipeId: number) => {
    navigation.navigate('RecipeDetails', { recipeId })
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.recipeItem}>
            <Text style={styles.recipeName}>{item.name}</Text>
            <Button
              title="Voir les détails"
              onPress={() => handleViewDetails(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune recette trouvée</Text>
        }
      />
      <Button
        title="Ajouter une recette"
        onPress={() => navigation.navigate('AddRecipe')}
        color="blue"
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
