import { CheckIcon, ExclamationCircle } from './icons'
import { cn } from '~/lib/utils'
import { Button } from './ui/button'
import { toast as _toast, ToasterProps, ExternalToast } from 'sonner'
import { useTranslations } from '~/hooks/use-translations'

export const loadingToastOptions: ExternalToast = {
  icon: (
    // spinner
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      className='h-6 w-6 animate-spin'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
      />
    </svg>
  ),
  style: {
    backgroundColor: 'var(--color-info)',
    color: 'var(--color-info-content)'
  }
}

export const successToastOptions: ExternalToast = {
  icon: <CheckIcon />,
  style: {
    backgroundColor: 'var(--color-success)',
    color: 'var(--color-success-content)'
  }
}

export const errorToastOptions: ExternalToast = {
  duration: Infinity
}

export const infoToastOptions: ExternalToast = {
  duration: 6000,
  style: {
    backgroundColor: 'var(--color-info)',
    color: 'var(--color-info-content)'
  },
  icon: (
    // i icon
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      className='h-6 w-6'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
      />
    </svg>
  )
}

function ToastBar({ id, tKey }: { id: string | number; tKey: string }) {
  const t = useTranslations()
  return (
    <div
    // className={cn(
    //   t ? 'animate-enter' : 'animate-leave',
    //   'bg-secondary border-error pointer-events-auto flex max-h-[calc(100svh-50px)] w-full overflow-auto rounded-lg border-4 p-4 shadow-lg md:max-w-3xl'
    // )}
    >
      <div className='bg-background flex-1 cursor-auto overflow-auto rounded-md p-3 text-left text-sm whitespace-break-spaces select-text'>
        {t.replace(tKey)}
      </div>
      <div className='flex'>
        <div>
          <Button
            onClick={() => _toast.dismiss(id)}
            className='flex w-full'
            variant='ghost'
            type='button'
          >
            {t.common.close}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const toast = {
  success: (message: string) => _toast.success(message),
  error: (message: string) =>
    _toast.custom((t) => <ToastBar id={t} tKey={message} />, errorToastOptions),
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
