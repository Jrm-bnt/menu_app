import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Icon from 'react-native-vector-icons/Ionicons'
import HomeScreen from '../screens/homeScreen/HomeScreen'
import SettingScreen from '../screens/settingsScreen/SettingScreen'
import RecipesScreen from '../screens/recipesScreen/RecipesScreen'
import AddRecipesScreen from '../screens/recipesScreen/AddRecipesScreen'
import ShoppingListScreen from '../screens/shoppingScreen/ShoppingListScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function RecipesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Recipes" component={RecipesScreen} />
      <Stack.Screen name="AddRecipe" component={AddRecipesScreen} />
    </Stack.Navigator>
  )
}

export default function BottomTabNavigator({ session }: { session: any }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="home-outline" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Recipes"
          component={RecipesStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="book-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Shopping List"
          component={ShoppingListScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="cart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          children={(props) => <SettingScreen {...props} session={session} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
