import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'
import { Toggle as TogglePrimitive, toggleVariants } from './ui/toggle'
import { CircleCheckIcon, CircleIcon } from 'lucide-react'

/** Row shape shared by the pressable toggle and its decorative twin. */
const ROW_CLASS_NAME =
  'h-auto w-full justify-start rounded-md border p-3 text-left'

export function Toggle({
  pressed,
  id,
  label,
  onPressedChange,
  className
}: {
  pressed: boolean
  id: string
  onPressedChange?: (pressed: boolean) => void
  label: ReactNode
  className?: string
}) {
  return (
    <TogglePrimitive
      id={id}
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn('hover:bg-accent/50', ROW_CLASS_NAME, className)}
    >
      <ToggleRow label={label} icon={<StateIcon pressed={pressed} />} />
    </TogglePrimitive>
  )
}

/**
 * A row that only shows what a {@link Toggle} looks like: same shape and same
 * `data-[state]` styling, but plain content rather than a button, so a marketing
 * surface can reuse the real row without offering a control that does nothing
 * when pressed. It carries no `id` for the same reason — there is no form value
 * here for a label to point at.
 */
export function DecorativeToggle({
  pressed,
  label,
  icon,
  className
}: {
  pressed: boolean
  label: ReactNode
  /** Replaces the default checked/unchecked circle — e.g. one that ticks itself. */
  icon?: ReactNode
  className?: string
}) {
  return (
    <div
      // The same `data-[state=on]` styling the primitive drives, so a decorative
      // row can't drift from a real one.
      data-state={pressed ? 'on' : 'off'}
      className={cn(
        toggleVariants(),
        ROW_CLASS_NAME,
        'pointer-events-none',
        className
      )}
    >
      <ToggleRow label={label} icon={icon ?? <StateIcon pressed={pressed} />} />
    </div>
  )
}

function ToggleRow({ label, icon }: { label: ReactNode; icon: ReactNode }) {
  return (
    <div className='flex w-full items-center justify-between gap-2 font-normal'>
      <div className='text-sm leading-none font-medium'>{label}</div>
      {icon}
    </div>
  )
}

function StateIcon({ pressed }: { pressed: boolean }) {
  return pressed ? <CircleCheckIcon /> : <CircleIcon />
}
