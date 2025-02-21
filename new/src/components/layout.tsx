import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { type ReactNode, memo } from 'react'
import { ProtectedDropdownMenu } from './dropdown-menus'
import {
  ChatBubbleLeftRightIcon,
  ListBulletIcon,
  PencilSquareIcon,
  XIcon
} from './icons'
import { useTranslation } from '~/hooks/use-translation'
import { ThemeToggle, useTheme } from './theme-toggle'

export default function Layout({
  children,
  font
}: {
  children: ReactNode
  font: string
}) {
  return <RootLayout font={font}>{children}</RootLayout>
}

const RootLayout = memo(function RootLayout({
  children,
  font
}: {
  children: ReactNode
  font: string
}) {
  const router = useRouter()
  const { data } = useSession()

  let navbar = <RoutesNavbar />

  if (!data) {
    navbar = <PublicNavbar />
  } else if (router.pathname === '/recipes/[id]') {
    navbar = <RecipeByIdNavbar />
  } else if (router.pathname === '/recipes/[id]/edit') {
    navbar = <EditRecipeNavbar />
  }

  return (
    <div className={`${font} flex overflow-y-auto font-roboto`}>
      <div className='relative max-w-full flex-1'>
        <div className='fixed top-0 z-10 flex w-full justify-center border-b border-b-base-300 bg-gradient-to-b from-base-100 to-base-100/70 text-base-content bg-blend-saturation backdrop-blur transition-all duration-300'>
          {navbar}
        </div>
        <main className='transition-width relative flex h-[100svh] w-full flex-1 flex-col items-stretch'>
          {children}
        </main>
      </div>
    </div>
  )
})

function PublicNavbar() {
  const t = useTranslation()
  const { theme, updateTheme } = useTheme()

  return (
    <>
      <nav className='prose navbar grid w-full grid-cols-3 place-items-center items-center bg-transparent px-4'>
        <div></div>
        <h1 className='mb-0 text-base'>{t('nav.app-name')}</h1>
        <div className='justify-self-end'>
          <ThemeToggle theme={theme} updateTheme={updateTheme} />
        </div>
      </nav>
    </>
  )
}

function RecipeByIdNavbar() {
  const router = useRouter()
  return (
    <nav className='prose navbar grid w-full grid-cols-6 bg-transparent px-4'>
      <button
        className='btn btn-circle btn-ghost'
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
        className='btn btn-circle btn-ghost justify-self-end'
        onClick={() =>
          router.push(
            `/recipes/${router?.query?.id as string}/edit?name=${
              router?.query?.name as string
            }`
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
  const t = useTranslation()

  const router = useRouter()
  return (
    <nav className='prose navbar grid w-full grid-cols-3 gap-24 bg-transparent px-4 '>
      <button
        className='btn btn-circle btn-ghost'
        onClick={() => router.back()}
      >
        <XIcon />
      </button>
      <h1 className='mb-0 justify-self-center whitespace-nowrap text-center text-base'>
        {t('recipes.by-id.edit')}
      </h1>
    </nav>
  )
}

function RoutesNavbar() {
  const router = useRouter()
  const menuItems = [
    {
      value: '/chat',
      icon: <ChatBubbleLeftRightIcon />
    },
    {
      value: '/list',
      icon: <ListBulletIcon />
    },
    {
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
    let styles = 'absolute top-10 h-1 w-full bg-transparent'

    if (router.asPath === path) {
      styles = 'absolute top-10 h-1 w-full bg-primary'
    }

    return styles
  }

  return (
    <nav className='navbar w-full max-w-xl justify-between px-5'>
      {menuItems.map((item) => (
        <Link
          className={activeLinkStyles(item.value)}
          href={item.value}
          key={item.value}
        >
          <span className={activeSpanStyles(item.value)}></span>
          {item.icon}
        </Link>
      ))}

      <ProtectedDropdownMenu />
    </nav>
  )
}
