import { CheckCircleIcon, CircleIcon } from 'lucide-react'
import { Badge } from '~/components/badge'
import { cn } from '~/lib/utils'

/**
 * A single filter pill: its name and whether it's currently narrowing the chat's
 * suggestions. Lives in its own file because the landing page's kitchen-context
 * section renders the same pill (without an `onClick`) to show what filters look
 * like, so the two can't drift apart.
 */
export function FilterBadge({
  name,
  checked,
  onClick
}: {
  name: string
  checked: boolean
  onClick?: () => void
}) {
  const icon = checked ? (
    <CheckCircleIcon className='size-5' />
  ) : (
    <CircleIcon className='text-primary size-5' />
  )

  return (
    <Badge
      icon={icon}
      label={name}
      variant='outline'
      onClick={onClick}
      className={cn('select-none', checked && 'border-primary text-primary')}
    />
  )
}
