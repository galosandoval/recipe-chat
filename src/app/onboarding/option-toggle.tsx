'use client'

import type { ReactNode } from 'react'
import { Toggle } from '~/components/ui/toggle'
import { cn } from '~/lib/utils'

const shapeClasses = {
  pill: 'rounded-full px-4 py-2 capitalize',
  block: 'rounded-lg px-4 py-3',
  card: 'flex-col items-start rounded-lg p-4 text-left'
} as const

/**
 * A selectable quiz option built on the shadcn `Toggle`. Radix exposes the
 * selected state to assistive tech via `aria-pressed`, and the styling here
 * reproduces the quiz's primary-colored selected look across every step.
 */
export function OptionToggle({
  pressed,
  onPressedChange,
  shape = 'pill',
  className,
  children
}: {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  shape?: keyof typeof shapeClasses
  className?: string
  children: ReactNode
}) {
  return (
    <Toggle
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn(
        'group h-auto border text-sm font-normal transition-colors',
        'data-[state=off]:bg-background data-[state=off]:text-foreground data-[state=off]:border-border data-[state=off]:hover:bg-muted',
        'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary data-[state=on]:hover:bg-primary',
        shapeClasses[shape],
        className
      )}
    >
      {children}
    </Toggle>
  )
}
