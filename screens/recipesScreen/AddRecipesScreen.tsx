import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'
import { RootStackParamList } from '../../type/navigation'
import { AddRecipeScreenProps } from '../../type/addRecipesScreenProps'
import { Ingredient } from '../../type/ingredient'

const AddRecipesScreen = ({ route }: AddRecipeScreenProps) => {
  const recipe = route.params?.recipe
  const ingredientsEdit = route.params?.ingredients || []

  const [name, setName] = useState(recipe?.name || '')
  const [description, setDescription] = useState(recipe?.description || '')
  const [ingredientName, setIngredientName] = useState('')
  const [ingredientQuantity, setIngredientQuantity] = useState('')
  const [ingredientUnit, setIngredientUnit] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>(ingredientsEdit)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useEffect(() => {
    if (recipe) {
      setIngredients(ingredientsEdit)
    }
  }, [recipe, ingredientsEdit])

  const handleSaveRecipe = async () => {
    const recipeData = { name, description }

    let insertedRecipe: any

    if (recipe) {
      const { data, error } = await supabase
        .from('recipes')
        .update(recipeData)
        .eq('id', recipe.id)
        .select()

      if (error) {
        console.error('Erreur lors de la mise à jour de la recette:', error)
        return
      } else {
        insertedRecipe = data[0]
      }
    } else {
      const { data, error } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select()

      if (error) {
        console.error('Erreur lors de la création de la recette:', error)
        return
      } else {
        insertedRecipe = data[0]
      }
    }

    if (insertedRecipe) {
      const recipeId = insertedRecipe.id

      // Récupérer les ingrédients existants pour cette recette
      const { data: existingIngredients, error: fetchError } = await supabase
        .from('ingredients')
        .select('id, name, quantity, unit')
        .eq('recipe_id', recipeId)

      if (fetchError) {
        console.error(
          'Erreur lors de la récupération des ingrédients:',
          fetchError
        )
        return
      }

      // Création des listes à utiliser pour la synchronisation
      const currentIngredients = ingredients.map((ingredient) => ({
        recipe_id: recipeId,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }))

      // Identifie les ingrédients à mettre à jour ou ajouter
      const ingredientsToUpsert: Ingredient[] = currentIngredients.map(
        (ingredient: Ingredient) => {
          const matchingIngredient: Ingredient | undefined =
            existingIngredients?.find(
              (existing: Ingredient) => existing.name === ingredient.name
            )
          if (matchingIngredient?.id) ingredient.id = matchingIngredient?.id
          return ingredient
        }
      )

      // Identifie les ingrédients à supprimer
      const ingredientsToDelete = existingIngredients?.filter(
        (existing) =>
          !currentIngredients.some((current) => current.name === existing.name)
      )

      // Supprimer les ingrédients non présents
      if (ingredientsToDelete?.length > 0) {
        const { error: deleteError } = await supabase
          .from('ingredients')
          .delete()
          .in(
            'id',
            ingredientsToDelete.map((ingredient) => ingredient.id)
          )

        if (deleteError) {
          console.error(
            'Erreur lors de la suppression des ingrédients:',
            deleteError
          )
          return
        }
      }
      let ingredientsToAdd: Ingredient[] = []
      let ingredientsToUpdate: Ingredient[] = []
      ingredientsToUpsert.forEach((e) => {
        if (e.id) return ingredientsToUpdate.push(e)
        else return ingredientsToAdd.push(e)
      })

      if (ingredientsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('ingredients')
          .upsert(ingredientsToUpdate, { onConflict: 'id' })

        if (updateError) {
          console.error(
            'Erreur lors de la mise à jour des ingrédients:',
            updateError
          )
          return
        }
      }

      // Traitement des ingrédients à ajouter
      if (ingredientsToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('ingredients')
          .insert(ingredientsToAdd)

        if (insertError) {
          console.error("Erreur lors de l'ajout des ingrédients:", insertError)
          return
        }
      }

      navigation.navigate('Recipes')
    }
  }

  const handleAddIngredient = () => {
    if (ingredientName && ingredientQuantity && ingredientUnit) {
      setIngredients([
        ...ingredients,
        {
          name: ingredientName,
          quantity: ingredientQuantity,
          unit: ingredientUnit,
        },
      ])
      setIngredientName('')
      setIngredientQuantity('')
      setIngredientUnit('')
    }
  }

  const handleDeleteIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nom de la recette"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.ingredientContainer}>
        <TextInput
          style={styles.ingredientInput}
          placeholder="Nom de l'ingrédient"
          value={ingredientName}
          onChangeText={setIngredientName}
        />
        <TextInput
          style={styles.ingredientInput}
          placeholder="Quantité"
          value={ingredientQuantity}
          onChangeText={setIngredientQuantity}
        />
        <TextInput
          style={styles.ingredientInput}
          placeholder="Unité"
          value={ingredientUnit}
          onChangeText={setIngredientUnit}
        />
        <Button title="+" onPress={handleAddIngredient} />
      </View>
      <FlatList
        data={ingredients}
        keyExtractor={(_item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.ingredientItem}>
            <Text>{item.name}</Text>
            <Text>
              {item.quantity} {item.unit}
            </Text>
            <TouchableOpacity onPress={() => handleDeleteIngredient(index)}>
              <Text style={styles.deleteText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button
        title={recipe ? 'Mettre à jour la recette' : 'Ajouter la recette'}
        onPress={handleSaveRecipe}
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
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 16,
    padding: 8,
  },
  ingredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 16,
    padding: 8,
    marginRight: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  deleteText: {
    color: 'red',
    textDecorationLine: 'underline',
  },
})

export default AddRecipesScreen
