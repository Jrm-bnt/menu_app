import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native'
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native'
import { AddRecipeScreenProps } from '../../type/addRecipesScreenProps'
import { Ingredient } from '../../type/ingredient'
import { supabase } from '../../lib/supabase'
import { Recipe } from '../../type/recipes'

type Props = AddRecipeScreenProps & {
  recipe?: Recipe | null
  ingredientsProps: Ingredient[] | []
  onSave?: () => void
  onCancel?: () => void
}

const AddRecipesScreen = ({
  recipe,
  ingredientsProps,
  onSave,
  onCancel,
}: Props) => {
  const navigation = useNavigation()
  const route = useRoute()

  const [name, setName] = useState(recipe?.name || '')
  const [description, setDescription] = useState(recipe?.description || '')
  const [ingredientName, setIngredientName] = useState('')
  const [ingredientQuantity, setIngredientQuantity] = useState('')
  const [ingredientUnit, setIngredientUnit] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>(ingredientsProps)

  // useEffect(() => {
  //   if (recipe) {
  //     setIngredients(ingredientsEdit)
  //   }
  // }, [recipe, ingredientsEdit])
  useFocusEffect(
    useCallback(() => {
      return () => {}
    }, [])
  )

  const handleSaveRecipe = async () => {
    const recipeData = { name, description }
    let insertedRecipe: any

    try {
      if (recipe) {
        const { data, error } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', recipe.id)
          .select()

        if (error) throw error

        insertedRecipe = data[0]
      } else {
        const { data, error } = await supabase
          .from('recipes')
          .insert([recipeData])
          .select()

        if (error) throw error

        insertedRecipe = data[0]
      }

      if (insertedRecipe) {
        const recipeId = insertedRecipe.id
        const { data: existingIngredients, error: fetchError } = await supabase
          .from('ingredients')
          .select('id, name, quantity, unit')
          .eq('recipe_id', recipeId)

        if (fetchError) throw fetchError

        const currentIngredients = ingredients.map((ingredient) => ({
          recipe_id: recipeId,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        }))

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

        const ingredientsToDelete = existingIngredients?.filter(
          (existing) =>
            !currentIngredients.some(
              (current) => current.name === existing.name
            )
        )

        if (ingredientsToDelete?.length > 0) {
          const { error: deleteError } = await supabase
            .from('ingredients')
            .delete()
            .in(
              'id',
              ingredientsToDelete.map((ingredient) => ingredient.id)
            )

          if (deleteError) throw deleteError
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

          if (updateError) throw updateError
        }

        if (ingredientsToAdd.length > 0) {
          const { error: insertError } = await supabase
            .from('ingredients')
            .insert(ingredientsToAdd)

          if (insertError) throw insertError
        }

        onSave ? onSave() : onCancel()
      }
    } catch (error) {
      console.error('Erreur lors de la gestion de la recette:', error)
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
      <Text style={styles.ingredientsTitle}>Liste des ingrédients</Text>
      <View style={styles.ingredientContainer}>
        <TextInput
          style={styles.ingredientInput}
          placeholder="Nom"
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
      <View style={styles.buttonContainer}>
        <Button color="red" title="Annuler" onPress={onCancel} />
        <Button
          title={recipe ? 'Mettre à jour' : 'Ajouter'}
          onPress={handleSaveRecipe}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 16,
    padding: 8,
  },
  ingredientsTitle: {
    fontSize: 18,
    paddingTop: 15,
    paddingBottom: 10,
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
