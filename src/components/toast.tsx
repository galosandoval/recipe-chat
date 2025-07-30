import toast, {
  type ToastOptions,
  Toaster,
  useToasterStore,
  ToastBar
} from 'react-hot-toast'
import { CheckIcon, ExclamationCircle } from './icons'

export function Toast() {
  const { toasts } = useToasterStore()

  const lastToastId = toasts.at(-1)?.id

  const handleClickToaster = () => {
    toast.dismiss(lastToastId)
  }

  return (
    <button>
      <Toaster
        toastOptions={{
          success: successToastOptions,
          error: errorToastOptions,
          loading: loadingToastOptions
        }}
      >
        {(t) => (
          <div>
            <ToastBar toast={t} />
          </div>
        )}
      </Toaster>
    </button>
  )
}

export const loadingToastOptions: ToastOptions = {
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

export const successToastOptions: ToastOptions = {
  icon: <CheckIcon />,
  style: {
    backgroundColor: 'var(--color-success)',
    color: 'var(--color-success-content)'
  }
}

export const errorToastOptions: ToastOptions = {
  icon: <ExclamationCircle />,
  style: {
    backgroundColor: 'var(--color-error)',
    color: 'var(--color-error-content)',
    fontSize: '12px'
  },
  duration: Infinity
}

export const infoToastOptions: ToastOptions = {
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

export const myToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) =>
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } bg-base-300 border-error pointer-events-auto flex max-h-[calc(100svh-50px)] w-full overflow-auto rounded-lg border-4 p-4 shadow-lg md:max-w-3xl`}
        >
          <div className='flex-1 text-left text-sm whitespace-break-spaces'>
            {message}
          </div>
          <div className='flex'>
            <div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className='btn btn-ghost flex w-full'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ),
      errorToastOptions
    ),
  loading: toast.loading
}