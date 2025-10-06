import {
  type FieldValuesFromFieldErrors,
  ErrorMessage as _ErrorMessage
} from '@hookform/error-message'
import { AlertCircleIcon } from 'lucide-react'
import { type FieldErrors, type FieldName, type FieldValues } from 'react-hook-form'

export type ErrorMessageProps<T extends FieldValues> = {
  errors: Partial<FieldErrors<T>>
  name: FieldName<FieldValuesFromFieldErrors<Partial<FieldErrors<T>>>>
  align?: 'start' | 'center' | 'end'
}

export function ErrorMessage<T extends FieldValues>({
  name,
  errors,
  align
}: ErrorMessageProps<T>) {
  return (
    <div
      className={`relative flex h-8 w-full justify-${align ?? 'start'} py-1`}
    >
      <_ErrorMessage
        errors={errors}
        name={name}
        render={(data) => ErrorMessageContent({ ...data })}
      />
    </div>
  )
}

function ErrorMessageContent({ message }: { message: string }) {
  const errorMessage = handleError({ message })
  return (
    <div className='text-error absolute flex items-center justify-start gap-1 truncate'>
      <AlertCircleIcon />
      <p className='mt-0 mb-0 text-sm'>{errorMessage}</p>
    </div>
  )
}

export function handleError({ message }: { message: string }) {
  if (typeof message === 'string' && message.startsWith('[')) {
    return JSON.stringify(message, null, 2)
  }

  return message
}
