import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  icon?: React.ReactNode
  isLoading?: boolean
  color?: 'primary' | 'secondary' | 'accent' | 'ghost'
}

export const Button = ({
  children,
  icon,
  isLoading,
  color = 'primary',
  ...attributes
}: ButtonProps) => {
  let className = `btn btn-${color}`
  if (!!attributes.className) {
    className += ` ${attributes.className}`
  }

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
  } else if (icon) {
    iconToRender = icon
  }

  return (
    <button {...attributes} className={className}>
      {isLoading ? iconToRender : children}
    </button>
  )
}
