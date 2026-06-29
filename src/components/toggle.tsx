import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'
import { Toggle as TogglePrimitive } from './ui/toggle'
import { CircleCheckIcon, CircleIcon } from 'lucide-react'

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
      className={cn(
        'hover:bg-accent/50 h-auto w-full justify-start rounded-md border p-3 text-left',
        className
      )}
    >
      <div className='flex w-full items-center justify-between gap-2 font-normal'>
        <div className='text-sm leading-none font-medium'>{label}</div>
        {pressed ? <CircleCheckIcon /> : <CircleIcon />}
      </div>
    </TogglePrimitive>
  )
}
