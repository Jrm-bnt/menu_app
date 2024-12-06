import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { supabase } from '../../lib/supabase'
import { Ingredient } from '../../type/ingredient'
import { Recipe } from '../../type/recipes'

type RecipeDetailsScreenProps = {
  recipe: Recipe
  ingredients: Ingredient[] | []
  onEdit: (recipe: Recipe, ingredients: Ingredient[]) => void
  onBack: () => void
}

const RecipeDetailsScreen = ({
  recipe,
  ingredients,
  onEdit,
  onBack,
}: RecipeDetailsScreenProps) => {
  const handleDeleteRecipe = async () => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe.id)

      if (error) throw error

      // Call the onDelete action to navigate back or update the UI
      onBack()
    } catch (error) {
      console.error('Error deleting recipe:', error)
    }
  }

  const confirmDelete = () => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette recette?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: handleDeleteRecipe,
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {recipe.name}
          </Text>
        </View>
        <View style={styles.icons}>
          <TouchableOpacity onPress={() => onEdit(recipe, ingredients)}>
            <Icon name="pencil" size={24} color="blue" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete}>
            <Icon name="trash" size={24} color="red" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onBack}>
            <Icon
              name="arrow-back"
              size={24}
              color="black"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
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
            {item.name} - {item.quantity} {item.unit}
          </Text>
        )}
        ListEmptyComponent={<Text>Aucun ingrédient trouvé.</Text>}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  icon: {
    marginLeft: 8,
    paddingLeft: 10,
  },
  icons: {
    flexDirection: 'row',
  },
  description: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ingredient: {
    paddingVertical: 4,
  },
})

export default RecipeDetailsScreen
