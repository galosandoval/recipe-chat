import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  isLoading?: boolean
}

export const Button = ({
  children,
  isLoading,
  type = 'button',
  className,
  ...attributes
}: ButtonProps) => {
  const loader = (
    <svg
      className='h-5 w-5 animate-spin'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      ></circle>
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      ></path>
    </svg>
  )
  let iconToRender: React.ReactNode = null
  if (isLoading) {
    iconToRender = loader
  }

  return (
    <button
      {...attributes}
      type={type}
      className={className}
      disabled={isLoading || attributes.disabled}
    >
      {isLoading ? iconToRender : children}
    </button>
  )
}
