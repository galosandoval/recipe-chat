import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect, useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  XIcon,
  ListBulletIcon
} from './Icons'
import { DropdownMenuWithTheme } from './DropdownMenu'
import { ThemeToggle } from './ThemeToggle'
import { AuthModal } from './AuthModal'

export default function Layout({
  children,
  font
}: {
  children: ReactNode
  font: string
}) {
  return <RootLayout font={font}>{children}</RootLayout>
}

function RootLayout({ children, font }: { children: ReactNode; font: string }) {
  const router = useRouter()
  const { data } = useSession()

  const [lastScrollY, setLastScrollY] = useState(0)
  const [isOpen, setIsOpen] = useState('')

  let navbar = <MenuNavbar />

  if (!data) {
    navbar = <PublicNavbar />
  } else if (router.pathname === '/recipes/[id]') {
    navbar = <RecipeByIdNavbar />
  } else if (router.pathname === '/recipes/[id]/edit') {
    navbar = <EditRecipeNavbar />
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const controlNavbar = () => {
        if (lastScrollY > 10 && window.scrollY > lastScrollY) {
          // if scroll down hide the navbar
          setIsOpen('-translate-y-full')
        } else {
          setIsOpen('')
        }
        // remember current page location to use in the next move
        setLastScrollY(window.scrollY)
      }

      window.addEventListener('scroll', controlNavbar)

      // cleanup function
      return () => {
        window.removeEventListener('scroll', controlNavbar)
      }
    }
  }, [lastScrollY])

  return (
    <div className={`${font} font-roboto`}>
      <div
        className={`backdrop sticky top-0 z-10 flex w-full justify-center bg-gradient-to-b from-base-100 to-base-100/80 text-base-content bg-blend-saturation backdrop-blur transition-all duration-300 ${isOpen}`}
      >
        {navbar}
      </div>
      <main className='relative z-0 mx-auto'>{children}</main>
    </div>
  )
}

function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <nav className='navbar prose grid w-full grid-cols-3 place-items-center items-center bg-transparent px-4'>
        <button
          onClick={() => setIsOpen(true)}
          className='link-primary link mr-6 justify-self-center'
        >
          Sign up
        </button>
        <h1 className='mb-0 text-base'>Recipe Chat</h1>
        <div className='ml-auto'>
          <ThemeToggle />
        </div>
      </nav>
      <AuthModal closeModal={() => setIsOpen(false)} isOpen={isOpen} />
    </>
  )
}

function RecipeByIdNavbar() {
  const router = useRouter()
  return (
    <nav className='navbar prose grid w-full grid-cols-6 bg-transparent px-4'>
      <button
        className='btn-ghost btn-circle btn'
        onClick={() => router.push('/recipes')}
      >
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
            d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3'
          />
        </svg>
      </button>
      <h1 className='col-span-4 mb-0 justify-self-center text-base'>
        {router.query.name}
      </h1>
      <button
        className='btn-ghost btn-circle btn justify-self-end'
        onClick={() =>
          router.push(
            `/recipes/${router.query.id}/edit?name=${router.query.name}`
          )
        }
      >
        <span>
          <PencilSquareIcon />
        </span>
      </button>
    </nav>
  )
}

function EditRecipeNavbar() {
  const router = useRouter()
  return (
    <nav className='navbar prose grid w-full grid-cols-3 gap-24 bg-transparent px-4 '>
      <button
        className='btn-ghost btn-circle btn'
        onClick={() => router.back()}
      >
        <XIcon />
      </button>
      <h1 className='mb-0 justify-self-center whitespace-nowrap text-center text-base'>
        Edit Recipe
      </h1>
    </nav>
  )
}

function MenuNavbar() {
  const router = useRouter()
  const menuItems = [
    {
      label: 'Chat',
      value: '/chat',
      icon: <ChatBubbleLeftRightIcon />
    },
    {
      label: 'List',
      value: '/list',
      icon: <ListBulletIcon />
    },
    {
      label: 'Recipes',
      value: '/recipes',
      icon: (
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
            d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
          />
        </svg>
      )
    }
  ]

  const activeLinkStyles = (path: string) => {
    let styles =
      'relative flex w-20 flex-col items-center gap-1 text-xs font-semibold text-base-content'

    if (router.asPath === path) {
      styles =
        'relative flex w-20 flex-col items-center gap-1 text-xs font-semibold text-primary'
    }

    return styles
  }

  const activeSpanStyles = (path: string) => {
    let styles = 'absolute top-[3.12rem] h-1 w-full bg-transparent'

    if (router.asPath === path) {
      styles = 'absolute top-[3.12rem] h-1 w-full bg-primary'
    }

    return styles
  }

  return (
    <nav className='navbar w-full max-w-xl justify-between px-5'>
      {menuItems.map((item) => (
        <Link
          className={activeLinkStyles(item.value)}
          href={item.value}
          key={item.label}
        >
          <span className={activeSpanStyles(item.value)}></span>
          {item.icon}
          <span className=''>{item.label}</span>
        </Link>
      ))}

      <DropdownMenuWithTheme />
    </nav>
  )
}
