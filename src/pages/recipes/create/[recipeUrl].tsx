import { CreateRecipeForm } from 'components/CreateRecipeForm'
import { MyHead } from 'components/Head'
import { useCreateRecipe } from 'hooks/recipeHooks'
import { useRouter } from 'next/router'
import { FormValues } from 'pages/_generate'
import { useForm } from 'react-hook-form'
import { api } from 'utils/api'

export default function CreateRecipeView() {
  return (
    <>
      <MyHead title='Listy - Create' />
      <CreateRecipe />
    </>
  )
}

function CreateRecipe() {
  const { query } = useRouter()
  const utils = api.useContext()
  const parsedRecipe = utils.recipe.parseRecipeUrl.getData(
    query.recipeUrl as string
  )

  const createRecipe = useCreateRecipe()
  const form = useForm<FormValues>({
    defaultValues: {
      cookTime: parsedRecipe?.cookTime,
      description: parsedRecipe?.description,
      ingredients: parsedRecipe?.recipeIngredient?.join('\n'),
      instructions: parsedRecipe?.recipeInstructions?.join('\n\n'),
      name: parsedRecipe?.name
    }
  })

  const handleSubmit = (values: FormValues) => {
    const ingredients = values.ingredients.split('\n')
    const instructions = values.instructions.split('\n\n')
    createRecipe.mutate({ ...values, ingredients, instructions })
  }

  return (
    <CreateRecipeForm
      form={form}
      onSubmit={handleSubmit}
      slot={<p>Create form</p>}
    />
  )
}
