import { toast as _toast, type ExternalToast } from 'sonner'
import { InfoIcon } from 'lucide-react'

const ERROR_DURATION = process.env.NODE_ENV === 'production' ? 10000 : Infinity
export const errorToastOptions: ExternalToast = {
  duration: ERROR_DURATION,
  cancel: true
}

export const infoToastOptions: ExternalToast = {
  duration: 6000,
  icon: <InfoIcon />
}

export const toast = {
  success: (message: string) => _toast.success(message),
  error: (message: string) => _toast.error(message, errorToastOptions),
  loading: _toast.loading,
  info: (message: string) => _toast(message, infoToastOptions),
  promise: async function <T>(
    promise: Promise<T>,
    msgs: {
      loading: string
      success: () => string
      error: () => string
    }
  ) {
    return _toast.promise(promise, msgs)
  }
}
