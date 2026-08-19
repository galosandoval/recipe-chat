import { Button as ButtonUI, type ButtonProps } from './ui/button'
import { forwardRef } from 'react'
import { cn } from '~/lib/utils'

interface Props extends ButtonProps {
  isLoading?: boolean
  icon?: React.ReactNode
}

/**
 * A track ring with one spinning arc — reads as a deliberate loader rather than
 * a bare icon, and inherits the button's text colour on every variant.
 */
function ButtonSpinner() {
  return (
    <span className='relative size-4' aria-hidden='true'>
      <span className='absolute inset-0 rounded-full border-2 border-current opacity-20' />
      <span className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-current' />
    </span>
  )
}

/**
 * While loading, the label stays in place and fades out under a centred
 * spinner, so the button keeps its width instead of jumping mid-click.
 */
export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ isLoading, children, icon, className, ...props }, ref) => {
    const isDisabled = props.disabled || isLoading

    return (
      <ButtonUI
        ref={ref}
        {...props}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn('relative', className)}
      >
        <span
          className={cn(
            'inline-flex items-center gap-2 transition-opacity duration-150',
            isLoading && 'opacity-0'
          )}
        >
          {icon}
          {children}
        </span>

        {isLoading ? (
          <span className='absolute inset-0 flex items-center justify-center'>
            <ButtonSpinner />
          </span>
        ) : null}
      </ButtonUI>
    )
  }
)

Button.displayName = 'Button'
