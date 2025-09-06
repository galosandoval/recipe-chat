import { Checkbox as CheckboxUI } from './ui/checkbox'
import { Label } from './ui/label'
import type { CheckedState } from '@radix-ui/react-checkbox'

export const Togglebox = ({
  checked,
  id,
  label,
  onChange
}: {
  checked: boolean
  id: string
  onChange?: (checked: CheckedState) => void
  label: string
}) => {
  return (
    <Label className='hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:line-through has-[[aria-checked=true]]:opacity-60'>
      <CheckboxUI id={id} checked={checked} onCheckedChange={onChange} />
      <div className='grid gap-1.5 font-normal'>
        <p className='text-sm leading-none font-medium'>{label}</p>
      </div>
    </Label>
  )
}
