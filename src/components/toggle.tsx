import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'
import { Toggle as TogglePrimitive, toggleVariants } from './ui/toggle'
import { CircleCheckIcon, CircleIcon } from 'lucide-react'

/** Row shape shared by the pressable toggle and its decorative twin. */
const rowClassName =
  'h-auto w-full justify-start rounded-md border p-3 text-left'

export function Toggle({
  pressed,
  id,
  label,
  onPressedChange,
  className,
  iconSlot,
  isDecorative
}: {
  pressed: boolean
  id: string
  onPressedChange?: (pressed: boolean) => void
  label: ReactNode
  className?: string
  /** Replaces the default checked/unchecked circle — e.g. one that ticks itself. */
  iconSlot?: ReactNode
  /**
   * For a row that only shows what a toggle looks like: it renders as plain
   * content instead of a button, so a marketing surface can reuse the real row
   * without offering a control that does nothing when pressed.
   */
  isDecorative?: boolean
}) {
  const content = (
    <div className='flex w-full items-center justify-between gap-2 font-normal'>
      <div className='text-sm leading-none font-medium'>{label}</div>
      {iconSlot ?? (pressed ? <CircleCheckIcon /> : <CircleIcon />)}
    </div>
  )

  if (isDecorative) {
    return (
      <div
        id={id}
        // The same `data-[state=on]` styling the primitive drives, so a
        // decorative row can't drift from a real one.
        data-state={pressed ? 'on' : 'off'}
        className={cn(
          toggleVariants(),
          rowClassName,
          'pointer-events-none',
          className
        )}
      >
        {content}
      </div>
    )
  }

  return (
    <TogglePrimitive
      id={id}
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn('hover:bg-accent/50', rowClassName, className)}
    >
      {content}
    </TogglePrimitive>
  )
}
