import { Fragment } from 'react'

export function ChatMessage({
  icon,
  content,
  bubbleContent,
  reverse
}: {
  content: string
  icon: React.ReactNode
  bubbleContent: React.ReactNode
  reverse?: boolean
}) {
  const iconEl = <div>{icon}</div>
  const bubbleEl = (
    <div className='bg-base-300 flex w-3/4 flex-col rounded p-3 pb-4 sm:w-2/3'>
      <p className='text-sm whitespace-pre-line'>{content}</p>
      {bubbleContent}
    </div>
  )
  let layout = [iconEl, bubbleEl]

  if (reverse) {
    layout = layout.reverse()
  }

  return (
    <div className='flex w-full justify-start gap-2 self-center'>
      {layout.map((el, i) => (
        <Fragment key={i}>{el}</Fragment>
      ))}
    </div>
  )
}
