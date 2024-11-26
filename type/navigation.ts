export type RootStackParamList = {
  Home: undefined
  AllRecipes: { refresh: boolean }
  AddRecipe: undefined
  Recipes: undefined
  ShoppingList: undefined
  Settings: { session: any }
  RecipeDetails: { recipeId: number }
}

export type RootTabParamList = {
  Home: undefined
  Recipes: undefined
  'Shopping List': undefined
  Settings: { session: any }
}
