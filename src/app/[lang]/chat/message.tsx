import { cn } from '~/utils/cn'

export function ChatMessage({
  icon,
  content,
  children,
  reverse
}: {
  content: string
  icon: React.ReactNode
  children: React.ReactNode
  reverse?: boolean
}) {
  const iconEl = <div key='icon'>{icon}</div>
  const bubbleEl = (
    <Bubble key='bubble' content={content} reverse={reverse}>
      {children}
    </Bubble>
  )
  let layout = [iconEl, bubbleEl]

  if (reverse) {
    layout = layout.reverse()
  }

  return (
    <div
      className={cn(
        'flex w-full justify-start gap-2 self-center',
        reverse && 'justify-end'
      )}
    >
      {layout}
    </div>
  )
}

function Bubble({
  content,
  reverse,
  children
}: {
  content: string
  reverse?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'bg-base-300 flex w-4/5 flex-col rounded p-3 pb-4 sm:w-3/4',
        reverse && 'bg-primary'
      )}
    >
      <p
        className={cn(
          'text-sm whitespace-pre-line',
          reverse && 'text-primary-content'
        )}
      >
        {content}
      </p>
      {children}
    </div>
  )
}
