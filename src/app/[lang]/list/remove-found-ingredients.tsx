import type { Ingredient } from '@prisma/client'
import { TrashIcon } from 'lucide-react'
import { Button } from '~/components/button'
import { toast } from '~/components/toast'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'

export function RemoveCheckedButton({ data }: { data: Ingredient[] }) {
  const t = useTranslations()
  const noneChecked = data.every((c) => !c.checked)

  const { mutate: deleteListItem } = useClearList()
  const handleRemoveChecked = () => {
    const checkedIngredients = data.filter((i) => i.checked)

    deleteListItem(checkedIngredients)
  }

  return (
    <Button
      disabled={noneChecked}
      className='w-full'
      onClick={handleRemoveChecked}
      variant='outline'
      icon={<TrashIcon />}
    >
      {t.list.removeChecked}
    </Button>
  )
}

function useClearList() {
  const userId = useUserId()
  const utils = api.useUtils()

  return api.lists.clear.useMutation({
    async onMutate(input) {
      await utils.lists.byUserId.cancel({ userId })

      const idDict = input.reduce(
        (dict, i) => {
          dict[i.id] = true
          return dict
        },
        {} as Record<string, boolean>
      )

      const prevList = utils.lists.byUserId.getData({ userId })

      let ingredients: Ingredient[] = []
      if (prevList) {
        ingredients = prevList.ingredients.filter((i) => !(i.id in idDict))
      }

      utils.lists.byUserId.setData({ userId }, () => ({ ingredients }))
      return { prevList }
    },
    onSuccess: async () => {
      await utils.lists.byUserId.invalidate({ userId })
    },
    onError: (error, _, ctx) => {
      const prevList = ctx?.prevList
      if (prevList) {
        utils.lists.byUserId.setData({ userId }, prevList)
      }
      toast.error(error.message)
    }
  })
}
