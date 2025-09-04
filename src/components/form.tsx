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
  children
}: {
  name: Path<T>
  label?: string
  description?: string
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
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
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
  inputProps
}: {
  name: Path<T>
  label?: string
  description?: string
  inputProps?: React.ComponentProps<typeof Input>
}) {
  return (
    <FormField name={name} label={label} description={description}>
      {(field) => <Input {...inputProps} {...field} />}
    </FormField>
  )
}

// Textarea component
export function FormTextarea<T extends FieldValues>({
  name,
  label,
  description,
  textareaProps
}: {
  name: Path<T>
  label: string
  description?: string
  textareaProps?: React.ComponentProps<'textarea'>
}) {
  return (
    <FormField name={name} label={label} description={description}>
      {(field: any) => (
        <textarea
          {...textareaProps}
          {...field}
          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        />
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
  selectProps
}: {
  name: Path<T>
  label: string
  description?: string
  options: { value: string; label: string }[]
  selectProps?: React.ComponentProps<'select'>
}) {
  return (
    <FormField name={name} label={label} description={description}>
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
