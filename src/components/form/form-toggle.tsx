import type { FieldValues, Path } from 'react-hook-form'
import { Toggle } from '../toggle'
import { FormField } from './form'

export function FormToggle<T extends FieldValues>({
  name,
  label,
  description,
  labelClassName,
  toggleProps
}: {
  name: Path<T>
  label: string
  description?: string
  labelClassName?: string
  toggleProps?: React.ComponentProps<typeof Toggle>
}) {
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      labelClassName={labelClassName}
    >
      {(field) => (
        <Toggle
          pressed={field.value?.checked}
          onPressedChange={(pressed) =>
            field.onChange({ ...field.value, checked: pressed })
          }
          label={label}
          id={name}
          {...toggleProps}
        />
      )}
    </FormField>
  )
}
