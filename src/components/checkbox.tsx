import { type ChangeEvent } from 'react'
import { cn } from '~/lib/utils'

export const Checkbox = ({
  checked,
  id,
  label,
  onChange
}: {
  checked: boolean
  id: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  label: string
}) => {
  return (
    <div>
      <label
        className={cn(
          'label bg-background flex cursor-pointer flex-row-reverse gap-2 rounded p-3 transition-all duration-200 ease-in-out active:scale-95',
          checked && 'bg-secondary'
        )}
        htmlFor={id}
      >
        <span
          className={cn(
            'label-text text-foreground mr-auto whitespace-normal transition-all duration-75',
            checked && 'text-foreground/40'
          )}
        >
          {label}
        </span>
        <input
          className='hidden'
          type='checkbox'
          name={id}
          id={id}
          checked={checked}
          onChange={onChange}
        />
      </label>
    </div>
  )
}
