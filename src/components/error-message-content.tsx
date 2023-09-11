import {
  FieldValuesFromFieldErrors,
  ErrorMessage as _ErrorMessage
} from '@hookform/error-message'
import { ExclamationCircle } from './icons'
import { FieldErrorsImpl, FieldName } from 'react-hook-form'

type ErrorMessageProps<T extends Record<string, string>> = {
  name: FieldName<FieldValuesFromFieldErrors<Partial<FieldErrorsImpl<T>>>>
  errors: Partial<FieldErrorsImpl<T>>
}

export function ErrorMessage<T extends Record<string, string>>({
  name,
  errors
}: ErrorMessageProps<T>) {
  return (
    <div className='relative h-8 py-1'>
      <_ErrorMessage errors={errors} name={name} render={ErrorMessageContent} />
    </div>
  )
}

function ErrorMessageContent({ message }: { message: string }) {
  const errorMessage = handleError({ message })
  return (
    <div className='absolute flex items-center justify-start gap-1 truncate text-error'>
      <ExclamationCircle />
      <p className='mb-0 mt-0 text-sm'>{errorMessage}</p>
    </div>
  )
}

export function handleError({ message }: { message: string }) {
  if (typeof message === 'string' && message[0] === '[') {
    return JSON.stringify(message, null, 2)
  }

  return message
}