import type { FieldValues, Path } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { FormField } from './form'

// Radix Select does not support value="" on SelectItem, so we use a sentinel
export const EMPTY_SELECT_VALUE = '__empty__'
export const toSelectValue = (v: string) => (v === '' ? EMPTY_SELECT_VALUE : v)
export const fromSelectValue = (v: string) =>
  v === EMPTY_SELECT_VALUE ? '' : v

export function FormSelect<T extends FieldValues>({
  name,
  label,
  description,
  options,
  labelClassName,
  placeholder
}: {
  name: Path<T>
  label: string
  description?: string
  options: { value: string; label: string }[]
  labelClassName?: string
  placeholder?: string
}) {
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      labelClassName={labelClassName}
    >
      {(field) => (
        <Select
          onValueChange={(v) => field.onChange(fromSelectValue(v))}
          value={toSelectValue(field.value ?? '')}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={toSelectValue(option.value)}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  )
}
