import React, { useState } from 'react'
import { View, TextInput, Button, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'

const AddRecipeScreen = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const navigation = useNavigation()

  const handleAddRecipe = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .insert([{ name, description }])

    if (error) {
      console.error(error)
    } else {
      navigation.goBack()
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
})

export default AddRecipeScreen
