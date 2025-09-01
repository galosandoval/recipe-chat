import {
  FormProvider,
  useFormContext,
  type FieldValues,
  type Path,
  type SubmitHandler,
  type UseFormReturn
} from 'react-hook-form'
import {
  Form as FormUI,
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
  form,
  className,
  onSubmit
}: {
  children: React.ReactNode
  form: UseFormReturn<T>
  className?: string
  onSubmit: SubmitHandler<T>
}) {
  if (!form) {
    throw new Error('Form is not provided')
  }
  const help = () => {
    console.log('form', form)
  }
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(help)} className={className}>
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
  form,
  children
}: {
  name: Path<T>
  label: string
  description?: string
  form: UseFormReturn<T>
  children: ((field: any) => React.ReactElement) | React.ReactNode
}) {
  return (
    <FormFieldUI
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
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
  inputProps,
  form
}: {
  name: Path<T>
  label: string
  description?: string
  inputProps?: React.ComponentProps<typeof Input>
  form: UseFormReturn<T>
}) {
  return (
    <FormField name={name} label={label} description={description} form={form}>
      {(field: T) => <Input {...inputProps} {...field} />}
    </FormField>
  )
}

// Textarea component
export function FormTextarea<T extends FieldValues>({
  name,
  label,
  description,
  textareaProps,
  form
}: {
  name: Path<T>
  label: string
  description?: string
  textareaProps?: React.ComponentProps<'textarea'>
  form: UseFormReturn<T>
}) {
  return (
    <FormField name={name} label={label} description={description} form={form}>
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
  selectProps,
  form
}: {
  name: Path<T>
  label: string
  description?: string
  options: { value: string; label: string }[]
  selectProps?: React.ComponentProps<'select'>
  form: UseFormReturn<T>
}) {
  return (
    <FormField name={name} label={label} description={description} form={form}>
      {(field: any) => (
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
