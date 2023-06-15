import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect, useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  EditIcon,
  XIcon,
  ListBulletIcon,
  ArrowLeftOnRectangleIcon,
  ElipsisVerticalIcon
} from './Icons'
import { Menu } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle'

export default function Layout({ children }: { children: ReactNode }) {
  const { status } = useSession()

  if (status === 'authenticated') {
    return <RootLayout>{children}</RootLayout>
  }
  return <>{children}</>
}

function RootLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [lastScrollY, setLastScrollY] = useState(0)
  const [isOpen, setIsOpen] = useState('')

  let navbar = <PagesNavbar />

  if (router.pathname === '/recipes/[id]') {
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
    <div>
      <div
        className={`backdrop sticky top-0 z-10 flex w-full justify-center bg-gradient-to-b from-base-100 to-base-100/80 text-base-content bg-blend-saturation backdrop-blur transition-all duration-300 ${isOpen}`}
      >
        {navbar}
      </div>
      <main className='container relative z-0 mx-auto'>{children}</main>
    </div>
  )
}

function RecipeByIdNavbar() {
  const router = useRouter()
  return (
    <nav className='navbar prose w-full justify-between gap-3 bg-transparent px-4'>
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
      <h1 className='mb-0 text-base'>{router.query.name}</h1>
      <button
        className='btn-ghost btn-circle btn'
        onClick={() =>
          router.push(
            `/recipes/${router.query.id}/edit?name=${router.query.name}`
          )
        }
      >
        <EditIcon />
      </button>
    </nav>
  )
}

function EditRecipeNavbar() {
  const router = useRouter()
  return (
    <nav className='navbar prose w-full gap-24 bg-transparent px-4'>
      <button
        className='btn-ghost btn-circle btn'
        onClick={() => router.back()}
      >
        <XIcon />
      </button>
      <h1 className='mb-0 text-base'>Edit Recipe</h1>
    </nav>
  )
}

function PagesNavbar() {
  const router = useRouter()
  const menuItems = [
    {
      label: 'Chat',
      value: '/',
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
    <nav className='navbar w-full justify-between px-5'>
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

      <DropdownMenu />
    </nav>
  )
}

const dropdownMenuOptions = {
  transition: {
    duration: 0.3
  },
  initial: {
    opacity: 0,
    y: -5
  },
  animate: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    y: -5
  }
} as const

function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Menu as='div' className='relative'>
      <Menu.Button
        onClick={() => setIsOpen((state) => !state)}
        className='btn-ghost btn-circle btn mb-4'
      >
        <ElipsisVerticalIcon />
      </Menu.Button>
      <AnimatePresence>
        {isOpen && (
          <Menu.Items
            as={motion.ul}
            static
            {...dropdownMenuOptions}
            className='absolute right-0 top-[3.5rem] flex flex-col gap-4 rounded-md bg-primary-content py-2'
          >
            <Menu.Item>
              <ThemeToggle />
            </Menu.Item>
            <Menu.Item>
              <button
                onClick={() => signOut()}
                className='btn-ghost no-animation btn w-[8rem]'
              >
                <span>Logout</span>
                <ArrowLeftOnRectangleIcon />
              </button>
            </Menu.Item>
          </Menu.Items>
        )}
      </AnimatePresence>
    </Menu>
  )
}
