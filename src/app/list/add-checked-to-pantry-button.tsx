import type { Ingredient } from '@prisma/client'
import { ArchiveIcon } from 'lucide-react'
import { Button } from '~/components/button'
import { toast } from '~/components/toast'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import { api } from '~/trpc/react'

export function AddCheckedToPantryButton({ data }: { data: Ingredient[] }) {
  const t = useTranslations()
  const noneChecked = data.every((c) => !c.checked)
  const userId = useUserId()
  const utils = api.useUtils()

  const { mutateAsync: bulkAdd, isPending: isAdding } =
    api.pantry.bulkAdd.useMutation()
  const { mutateAsync: clearItems, isPending: isClearing } =
    api.lists.clear.useMutation()

  const handleClick = async () => {
    const checked = data.filter((i) => i.checked)
    const rawLines = checked
      .map((i) => getIngredientDisplayText(i) || i.rawString || '')
      .filter(Boolean)

    if (rawLines.length === 0) return

    try {
      await bulkAdd({ rawLines })
      await utils.pantry.byUserId.invalidate({ userId })
      await clearItems(checked)
      await utils.lists.byUserId.invalidate({ userId })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add to pantry'
      )
    }
  }

  return (
    <Button
      disabled={noneChecked || isAdding || isClearing}
      className='mt-2 w-full'
      onClick={handleClick}
      variant='outline'
      icon={<ArchiveIcon />}
    >
      {t.list.addToPantry}
    </Button>
  )
}
