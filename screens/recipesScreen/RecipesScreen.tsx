import React, { useEffect, useState } from 'react'
import { View, Text, Button, FlatList, StyleSheet } from 'react-native'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'
import { RootStackParamList } from '../../type/navigation'

interface Recipe {
  id: number
  name: string
  description: string
}

const RecipesScreen = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useEffect(() => {
    fetchRecipes().then((r) => console.log('r', r))
  }, [])

  const fetchRecipes = async () => {
    const { data, error } = await supabase.from('recipes').select('*')
    if (error) {
      console.error('Error fetching recipes:', error)
    } else {
      console.log('Fetched recipes:', data)
      setRecipes(data)
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.recipeItem}>
            <Text style={styles.recipeName}>{item.name}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
      <Button
        title="Ajouter une nouvelle recette"
        onPress={() => navigation.navigate('AddRecipe')}
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
})

export default RecipesScreen
