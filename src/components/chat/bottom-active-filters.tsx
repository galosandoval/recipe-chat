import { useChatStore } from '~/stores/chat-store'
import { useActiveFiltersByUserId } from '~/hooks/use-filters-by-user-id'
import { useTranslations } from '~/hooks/use-translations'

export function BottomActiveFilters() {
  const { data: activeFilters, status } = useActiveFiltersByUserId()
  const t = useTranslations()
  const messages = useChatStore((state) => state.messages)

  if (status === 'error') {
    return <div>{t.error.somethingWentWrong}</div>
  }

  if (
    activeFilters?.length === 0 ||
    messages.length === 0 ||
    status === 'pending'
  ) {
    return null
  }

  return (
    <div className='w-full'>
      <div className='glass-background mx-auto flex max-w-2xl items-center gap-2 overflow-x-auto px-3 py-1 sm:rounded'>
        <h3 className='mt-0 mb-0 text-xs font-semibold'>{t.filters.title}:</h3>
        {activeFilters?.map((f) => (
          <div
            className='bg-secondary text-foreground rounded p-2 py-1 text-xs whitespace-nowrap'
            key={f.id}
          >
            {f.name}
          </div>
        ))}
      </div>
    </div>
  )
}
