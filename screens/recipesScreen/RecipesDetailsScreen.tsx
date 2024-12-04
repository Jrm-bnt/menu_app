import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { supabase } from '../../lib/supabase'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../../type/navigation'
import { Ingredient } from '../../type/ingredient'

type RecipeDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'RecipeDetails'>
  navigation: any
}

const RecipeDetailsScreen = ({
  route,
  navigation,
}: RecipeDetailsScreenProps) => {
  const [recipe, setRecipe] = useState(route.params.recipe)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const fetchIngredients = useCallback(async () => {
    try {
      const { data: ingredientsData, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('recipe_id', recipe.id)

      if (error) throw error
      setIngredients(ingredientsData || [])
    } catch (error) {
      console.error('Error fetching ingredients:', error)
    } finally {
      setLoading(false)
    }
  }, [recipe.id])

  const refreshRecipe = useCallback(async () => {
    try {
      const { data: updatedRecipe, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipe.id)
        .single()

      if (error) throw error
      setRecipe(updatedRecipe)
    } catch (error) {
      console.error('Error fetching updated recipe:', error)
    }
  }, [recipe.id])

  useEffect(() => {
    fetchIngredients()
  }, [fetchIngredients])

  const handleEdit = () => {
    navigation.navigate('AddRecipe', { recipe, ingredients })
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipe.id)
    if (error) {
      console.error('Error deleting recipe:', error)
    } else {
      navigation.navigate('Recipes')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {recipe.name}
        </Text>
        <TouchableOpacity onPress={refreshRecipe}>
          <Icon
            name="refresh"
            size={24}
            color="blue"
            style={styles.refreshIcon}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.description}>{recipe.description}</Text>
      <Text style={styles.subtitle}>Ingrédients :</Text>
      <FlatList
        data={ingredients}
        keyExtractor={(item) =>
          item.id ? item.id.toString() : `${Math.random()}`
        }
        renderItem={({ item }) => (
          <Text style={styles.ingredient}>
            {item.name} - {item.quantity} - {item.unit}
          </Text>
        )}
        ListEmptyComponent={<Text>Aucun ingrédient trouvé.</Text>}
      />
      <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
        <Text style={styles.editButtonText}>Modifier</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  refreshIcon: {
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
})

export default RecipeDetailsScreen
