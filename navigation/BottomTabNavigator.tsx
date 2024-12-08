import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { BottomNavigation } from 'react-native-paper'
import HomeScreen from '../screens/homeScreen/HomeScreen'
import SettingScreen from '../screens/settingsScreen/SettingScreen'
import ShoppingListScreen from '../screens/shoppingScreen/ShoppingListScreen'
import RecipeManagerScreen from '../screens/recipesScreen/RecipeManagerScreen'

export const BottomTabNavigator = ({ session }: { session: any }) => {
  const [index, setIndex] = useState(0)
  const [routes] = useState([
    {
      key: 'home',
      title: 'Home',
      focusedIcon: 'calendar-month',
      unfocusedIcon: 'calendar-month-outline',
    },
    {
      key: 'recipes',
      title: 'Recipes',
      focusedIcon: 'book',
      unfocusedIcon: 'book-outline',
    },
    {
      key: 'shopping',
      title: 'Shopping List',
      focusedIcon: 'cart',
      unfocusedIcon: 'cart-outline',
    },
    {
      key: 'settings',
      title: 'Settings',
      focusedIcon: 'cog',
      unfocusedIcon: 'cog-outline',
    },
  ])

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    recipes: RecipeManagerScreen,
    shopping: ShoppingListScreen,
    settings: (props) => <SettingScreen {...props} session={session} />,
  })

  return (
    <View style={styles.container}>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 20,
  },
})
