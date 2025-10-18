import type { FieldValues, Path } from 'react-hook-form'
import { Input } from '../ui/input'
import { FormField } from './form'

// Specific input components for common field types
export function FormInput<T extends FieldValues>({
  name,
  label,
  description,
  labelClassName,
  type,
  ...inputProps
}: {
  name: Path<T>
  label?: string
  description?: string
  labelClassName?: string
} & React.ComponentProps<typeof Input>) {
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      labelClassName={labelClassName}
    >
      {(field) => (
        <Input
          {...inputProps}
          {...field}
          type={type}
          onChange={(e) => {
            // Convert string to number for number inputs
            if (type === 'number') {
              const value = e.target.value
              field.onChange(value === '' ? undefined : Number(value))
            } else {
              field.onChange(e)
            }
          }}
        />
      )}
    </FormField>
  )
}
