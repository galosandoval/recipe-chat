import { Button as ButtonUI } from './ui/button'

import { Loader2Icon } from 'lucide-react'
import type { ButtonProps } from './ui/button'
import { forwardRef } from 'react'

interface Props extends ButtonProps {
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ isLoading, children, icon, ...props }, ref) => {
    const isDisabled = props.disabled || isLoading
    return (
      <ButtonUI ref={ref} {...props} disabled={isDisabled}>
        {isLoading ? (
          <>
            <Loader2Icon className='h-4 w-4 animate-spin' />
            {children}
          </>
        ) : icon ? (
          <>
            {icon}
            {children}
          </>
        ) : (
          children
        )}
      </ButtonUI>
    )
  }
)

Button.displayName = 'Button'
