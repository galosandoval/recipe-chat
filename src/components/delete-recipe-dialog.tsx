import { useTranslations } from '~/hooks/use-translations'
import { Dialog } from './dialog'
import { useRecipe, useDeleteRecipe } from '~/hooks/use-recipe'

export function DeleteRecipeDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations()
  const { mutate: deleteRecipe, status: deleteStatus } = useDeleteRecipe()
  const { data: recipe } = useRecipe()

  if (!recipe) return null

  const handleDelete = (id: string) => {
    deleteRecipe({ id })
  }
  return (
    <Dialog
      formId='delete-recipe-form'
      buttonType='button'
      isLoading={deleteStatus === 'pending'}
      onClickConfirm={() => handleDelete(recipe.id)}
      cancelText={t.common.cancel}
      submitText={t.common.delete}
      title={t.recipes.byId.delete.title}
      description={t.recipes.byId.delete.message}
      open={open}
      onOpenChange={onOpenChange}
    >
      {null}
    </Dialog>
  )
}
