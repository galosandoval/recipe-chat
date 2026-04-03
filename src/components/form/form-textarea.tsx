import type { FieldValues, Path } from 'react-hook-form'
import { Textarea } from '../ui/textarea'
import { FormField } from './form'

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  description,
  labelClassName,
  ...props
}: {
  name: Path<T>
  label: string
  description?: string
  labelClassName?: string
} & React.ComponentProps<typeof Textarea>) {
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      labelClassName={labelClassName}
    >
      {(field: any) => (
        <Textarea {...props} {...field} value={field.value ?? ''} />
      )}
    </FormField>
  )
}
