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
