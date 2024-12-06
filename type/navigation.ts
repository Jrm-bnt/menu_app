import { Recipe } from './recipes'
import { Ingredient } from './ingredient'

export type RootStackParamList = {
  Home: undefined
  AddRecipe: { recipe?: Recipe; ingredients?: Ingredient[] } | undefined
  Recipes: undefined
  ShoppingList: undefined
  Settings: { session: any }
  RecipeDetails: { recipe: Recipe }
}

export type RootTabParamList = {
  Home: undefined
  Recipes: undefined
  'Shopping List': undefined
  Settings: { session: any }
}
