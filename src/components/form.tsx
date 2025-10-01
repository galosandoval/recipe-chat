import {
  FormProvider,
  type UseFormReturn,
  useFormContext,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  type SubmitHandler
} from 'react-hook-form'
import {
  FormField as FormFieldUI,
  FormMessage,
  FormDescription
} from './ui/form'
import { FormItem } from './ui/form'
import { FormLabel } from './ui/form'
import { FormControl } from './ui/form'
import { Input } from './ui/input'
import { Togglebox } from './togglebox'
import { Textarea } from './ui/textarea'

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

// Specific input components for common field types
export function FormInput<T extends FieldValues>({
  name,
  label,
  description,
  labelClassName,
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
      {(field) => <Input {...inputProps} {...field} />}
    </FormField>
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
        <Textarea {...props} {...field} className={props.className} />
      )}
    </FormField>
  )
}

// Select component
export function FormSelect<T extends FieldValues>({
  name,
  label,
  description,
  options,
  labelClassName,
  selectProps
}: {
  name: Path<T>
  label: string
  description?: string
  options: { value: string; label: string }[]
  labelClassName?: string
  selectProps?: React.ComponentProps<'select'>
}) {
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      labelClassName={labelClassName}
    >
      {(field) => (
        <select
          {...selectProps}
          {...field}
          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  )
}

export function FormCheckbox<T extends FieldValues>({
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