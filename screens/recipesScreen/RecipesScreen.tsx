import React, { useEffect, useState } from 'react'
import { View, Text, Button, FlatList, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'

const RecipesScreen = () => {
  const [recipes, setRecipes] = useState([])
  const navigation = useNavigation()

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    const { data, error } = await supabase.from('recipes').select('*')
    if (error) {
      console.error(error)
    } else {
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
