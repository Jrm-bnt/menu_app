import { NavigationProp, RouteProp } from '@react-navigation/native'
import { RootStackParamList } from './navigation'

export type AddRecipeScreenProps = {
  route: RouteProp<RootStackParamList, 'AddRecipe'>
  navigation: NavigationProp<RootStackParamList>
}
