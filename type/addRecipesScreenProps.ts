import { Recipe } from './recipes'

export type AddRecipeScreenProps = {
  recipe: Recipe | null
  onSave: () => void
  onCancel: () => void
}
