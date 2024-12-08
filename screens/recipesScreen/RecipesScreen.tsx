import React, { useState } from 'react'
import { FlatList, View, Text, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useFocusEffect } from '@react-navigation/native'
import { Recipe } from '../../type/recipes'
import { Button } from 'react-native-paper'

type RecipesScreenProps = {
  onSelect: (recipe: Recipe) => void
  onAddNew: () => void
}

const RecipesScreen = ({ onSelect, onAddNew }: RecipesScreenProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([])

  const fetchRecipes = async () => {
    const { data, error } = await supabase.from('recipes').select('*')
    if (error) return console.error('Error fetching recipes:', error)
    else setRecipes(data || [])
  }

  useFocusEffect(
    React.useCallback(() => {
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
                onSelect(item)
              }}
            >
              {item.name}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune recette trouvée</Text>
        }
      />
      <Button icon="plus" mode="contained" onPress={onAddNew}>
        Ajouter une recette
      </Button>
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
