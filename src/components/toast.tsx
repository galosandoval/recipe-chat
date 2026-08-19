'use client'

import { toast as sonner } from 'sonner'
import {
  CheckCircle2Icon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
  XIcon
} from 'lucide-react'
import { cn } from '~/lib/utils'

type Variant = 'success' | 'error' | 'info' | 'loading'

/** Extra bits a caller can attach to any toast. */
type ToastOptions = {
  /** Secondary line under the message. */
  description?: string
  /** Reuse an existing toast's id to replace it in place (loading -> result). */
  id?: string | number
  duration?: number
}

/**
 * Errors stay put in development so a stack-trace-worthy message isn't missed
 * while iterating; in production they time out like everything else.
 */
const ERROR_DURATION = process.env.NODE_ENV === 'production' ? 10_000 : Infinity

const DURATIONS: Record<Variant, number> = {
  success: 4000,
  error: ERROR_DURATION,
  info: 6000,
  loading: Infinity
}

const VARIANTS: Record<
  Variant,
  { icon: typeof InfoIcon; accent: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2Icon,
    accent: 'bg-success',
    iconColor: 'text-success'
  },
  error: {
    icon: TriangleAlertIcon,
    accent: 'bg-destructive',
    iconColor: 'text-destructive'
  },
  info: { icon: InfoIcon, accent: 'bg-info', iconColor: 'text-info' },
  loading: {
    icon: Loader2Icon,
    accent: 'bg-muted-foreground',
    iconColor: 'text-muted-foreground'
  }
}

function ToastCard({
  variant,
  message,
  description,
  onDismiss
}: {
  variant: Variant
  message: string
  description?: string
  onDismiss: () => void
}) {
  const { icon: Icon, accent, iconColor } = VARIANTS[variant]
  const isLoading = variant === 'loading'

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      onClick={isLoading ? undefined : onDismiss}
      className={cn(
        'bg-popover text-popover-foreground border-border relative flex w-full items-start gap-3 overflow-hidden rounded-lg border py-3 pr-3 pl-4 shadow-lg',
        !isLoading && 'cursor-pointer'
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-1', accent)} />

      <Icon
        className={cn('mt-0.5 size-5 shrink-0', iconColor, {
          'animate-spin': isLoading
        })}
      />

      <div className='min-w-0 flex-1'>
        <p className='text-sm leading-5 font-medium break-words'>{message}</p>
        {description ? (
          <p className='text-muted-foreground mt-0.5 text-xs break-words'>
            {description}
          </p>
        ) : null}
      </div>

      {isLoading ? null : (
        <button
          type='button'
          aria-label='Dismiss'
          onClick={onDismiss}
          className='text-muted-foreground hover:text-foreground -my-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-md transition-colors'
        >
          <XIcon className='size-4' />
        </button>
      )}
    </div>
  )
}

/**
 * `id` is spread over sonner's own generated id, so passing it as `undefined`
 * leaves the stored toast under a *different* id than the one handed to the
 * render callback — and `dismiss()` then targets nothing. Only send the key
 * when a caller actually supplied one.
 */
const show = (variant: Variant, message: string, options?: ToastOptions) =>
  sonner.custom(
    (id) => (
      <ToastCard
        variant={variant}
        message={message}
        description={options?.description}
        onDismiss={() => sonner.dismiss(id)}
      />
    ),
    {
      ...(options?.id === undefined ? {} : { id: options.id }),
      duration: options?.duration ?? DURATIONS[variant]
    }
  )

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    show('success', message, options),
  error: (message: string, options?: ToastOptions) =>
    show('error', message, options),
  info: (message: string, options?: ToastOptions) =>
    show('info', message, options),
  /** Sticks until dismissed — pass the returned id to a later toast to replace it. */
  loading: (message: string, options?: ToastOptions) =>
    show('loading', message, options),
  dismiss: (id?: string | number) => sonner.dismiss(id)
}
