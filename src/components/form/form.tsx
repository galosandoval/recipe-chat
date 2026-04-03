import {
  FormProvider,
  type UseFormReturn,
  useFormContext,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  type SubmitHandler
} from 'react-hook-form'

export { useAppForm } from '~/hooks/use-app-form'
import {
  FormField as FormFieldUI,
  FormMessage,
  FormDescription
} from '../ui/form'
import { FormItem } from '../ui/form'
import { FormLabel } from '../ui/form'
import { FormControl } from '../ui/form'
import { Togglebox } from '../togglebox'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'

export function Form<T extends FieldValues>({
  children,
  className,
  onSubmit,
  formId,
  form
}: {
  children: React.ReactNode
  className?: string
  onSubmit: SubmitHandler<T>
  formId: string
  form: UseFormReturn<T>
}) {
  return (
    <FormProvider {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className={className}
      >
        {children}
      </form>
    </FormProvider>
  )
}

// Generic form field component that can be used for any input type
export function FormField<T extends FieldValues>({
  name,
  label,
  description,
  labelClassName,
  children
}: {
  name: Path<T>
  label?: string
  description?: string
  labelClassName?: string
  children:
    | ((field: ControllerRenderProps<T, Path<T>>) => React.ReactElement)
    | React.ReactNode
}) {
  const { control } = useFormContext<T>()
  return (
    <FormFieldUI
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='w-full'>
          {label && <FormLabel className={labelClassName}>{label}</FormLabel>}
          <FormControl>
            {typeof children === 'function' ? children(field) : children}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
// Textarea component
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

// Radix Select does not support value="" on SelectItem, so we use a sentinel
const EMPTY_SELECT_VALUE = '__empty__'
const toSelectValue = (v: string) => (v === '' ? EMPTY_SELECT_VALUE : v)
const fromSelectValue = (v: string) => (v === EMPTY_SELECT_VALUE ? '' : v)

// Select component
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

export function FormTogglebox<T extends FieldValues>({
  name,
  label,
  description,
  labelClassName,
  checkboxProps
}: {
  name: Path<T>
  label: string
  description?: string
  labelClassName?: string
  checkboxProps?: React.ComponentProps<typeof Togglebox>
}) {
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      labelClassName={labelClassName}
    >
      {(field) => (
        <Togglebox
          checked={field.value?.checked}
          onChange={(checked) =>
            field.onChange({ ...field.value, checked: checked })
          }
          label={label}
          id={name}
          {...checkboxProps}
        />
      )}
    </FormField>
  )
}
