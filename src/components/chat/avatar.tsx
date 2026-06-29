import { cn } from '~/lib/utils'

export function Avatar({
  isUserMessage,
  icon
}: {
  isUserMessage?: boolean
  icon: React.ReactNode
}) {
  return (
    <div>
      <span className='relative grid size-8 place-items-center'>
        <span
          className={cn(
            'bg-accent absolute inset-0 z-0 size-8 rounded-full',
            isUserMessage && 'bg-primary/20'
          )}
        />
        <span className='relative z-10 grid size-6 place-items-center'>
          {icon}
        </span>
      </span>
    </div>
  )
}
