import { cn } from '~/lib/utils'
import { Checkbox as CheckboxUI } from './ui/checkbox'
import { Label } from './ui/label'

export const Togglebox = ({
  checked,
  id,
  label,
  onChange,
  className
}: {
  checked: boolean
  id: string
  onChange?: (checked: boolean) => void
  label: string
  className?: string
}) => {
  return (
    <Label
      className={cn(
        'hover:bg-accent/50 flex items-start gap-3 rounded-md border p-3 has-[[aria-checked=true]]:line-through has-[[aria-checked=true]]:opacity-60',
        className
      )}
    >
      <CheckboxUI hidden id={id} checked={checked} onCheckedChange={onChange} />
      <div className='grid gap-1.5 font-normal'>
        <p className='text-sm leading-none font-medium'>{label}</p>
      </div>
    </Label>
  )
}
