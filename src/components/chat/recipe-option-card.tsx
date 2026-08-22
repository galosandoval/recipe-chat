import { Card } from '~/components/card'

/**
 * One Recipe Option as the assistant offers it: the name, a one-line pitch, and
 * whatever action belongs with it (in the chat, the Generate button; on the
 * landing page, an inert mock of it).
 *
 * Purely presentational and free of chat context, so the marketing landing can
 * render the same card the chat does and stay visually in sync with it.
 */
export function RecipeOptionCard({
  name,
  description,
  action
}: {
  name: string
  description?: string | null
  action?: React.ReactNode
}) {
  return (
    <Card className='bg-card' contentClassName='flex flex-col h-full'>
      <h3 className='text-secondary-foreground font-semibold'>{name}</h3>
      {description && <p className='text-xs'>{description}</p>}
      {action && (
        <div className='mt-auto flex justify-end self-end pt-2'>{action}</div>
      )}
    </Card>
  )
}
