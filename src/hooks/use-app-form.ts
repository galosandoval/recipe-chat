import {
  useForm,
  type UseFormProps,
  type UseFormReturn,
  type DefaultValues
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'

export function useAppForm<T extends z.ZodTypeAny>(
  schema: T,
  config: {
    defaultValues: DefaultValues<z.infer<T>>
  } & Omit<UseFormProps<z.infer<T>>, 'resolver'>
): UseFormReturn<z.infer<T>> {
  return useForm({
    ...config,
    resolver: zodResolver(schema)
  } as UseFormProps<z.infer<T>>)
}
