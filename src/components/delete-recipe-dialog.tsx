import { useTranslations } from '~/hooks/use-translations'
import { Dialog } from './dialog'
import { useParams } from 'next/navigation'
import { useDeleteRecipe } from '~/hooks/use-recipe'

export function DeleteRecipeDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations()
  const { mutate: deleteRecipe, status: deleteStatus } = useDeleteRecipe()
  const { id } = useParams<{ id: string | undefined }>()

  if (!id) throw new Error('No id found')

  const handleDelete = (id: string) => {
    deleteRecipe({ id })
  }
  return (
    <Dialog
      form='delete-recipe-form'
      type='button'
      isLoading={deleteStatus === 'pending'}
      onClickConfirm={() => handleDelete(id)}
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
