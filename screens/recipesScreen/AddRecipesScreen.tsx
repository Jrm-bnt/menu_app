import React, { useState } from 'react'
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Text,
} from 'react-native'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'
import { RootStackParamList } from '../../type/navigation'

interface Ingredient {
  name: string
  quantity: string
  unit: string
}

const AddRecipesScreen = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ingredientName, setIngredientName] = useState('')
  const [ingredientQuantity, setIngredientQuantity] = useState('')
  const [ingredientUnit, setIngredientUnit] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const handleAddRecipe = async () => {
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert([{ name, description }])
      .select()

    if (recipeError) {
      console.error(recipeError)
    } else {
      const recipeId = recipeData[0].id
      const ingredientsToInsert = ingredients.map((ingredient) => ({
        recipe_id: recipeId,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }))
      const { data: ingredientsData, error: ingredientError } = await supabase
        .from('ingredients')
        .insert(ingredientsToInsert)
        .select()

      if (ingredientError) {
        console.error(ingredientError)
      } else {
        console.log('Ingredients inserted: ', ingredientsData)

        navigation.navigate('AllRecipes', { refresh: true })
      }
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
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.ingredientItem}>
            <Text>{item.name}</Text>
            <Text>
              {item.quantity} {item.unit}
            </Text>
          </View>
        )}
      />
      <Button title="Ajouter la recette" onPress={handleAddRecipe} />
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
})

export default AddRecipesScreen
