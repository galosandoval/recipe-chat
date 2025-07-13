'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { ProtectedDropdownMenu } from './dropdown-menus'
import {
  ArrowBackLeftIcon,
  ChatBubbleLeftRightIcon,
  ListBulletIcon,
  PencilSquareIcon,
  XIcon
} from './icons'
import { useTranslations } from '~/hooks/use-translations'
import { ThemeToggle, useTheme } from './theme-toggle'
import { api } from '~/trpc/react'

export function NavContainer() {
  return (
    <div>
      <Nav />
    </div>
  )
}

const Nav = () => {
  const { data } = useSession()
  console.log('data', data)
  const pathname = usePathname()
  console.log('pathname', pathname)
  const { lang, id } = useParams()
  let navbar = <RoutesNavbar />

  if (!data) {
    navbar = <PublicNavbar />
  } else if (pathname === `/${lang}/recipes/${id}/edit`) {
    navbar = <EditRecipeNavbar />
  } else if (pathname === `/${lang}/recipes/${id}`) {
    navbar = <RecipeByIdNavbar />
  }

  return (
    <div className='border-b-base-300 from-base-100 to-base-100/70 text-base-content fixed top-0 z-10 flex w-full justify-center border-b bg-gradient-to-b bg-blend-saturation backdrop-blur transition-all duration-300'>
      {navbar}
    </div>
  )
}

function PublicNavbar() {
  const t = useTranslations()
  const { theme, updateTheme } = useTheme()

  return (
    <>
      <nav className='prose navbar grid w-full grid-cols-3 place-items-center items-center bg-transparent px-4'>
        <div></div>
        <h1 className='mb-0 text-base'>{t.nav.appName}</h1>
        <div className='justify-self-end'>
          <ThemeToggle theme={theme} updateTheme={updateTheme} />
        </div>
      </nav>
    </>
  )
}

function RecipeByIdNavbar() {
  const router = useRouter()
  const { id } = useParams()
  const { data } = api.recipes.byId.useQuery({ id: id as string })

  return (
    <nav className='prose navbar grid w-full grid-cols-6 bg-transparent px-4'>
      <button
        className='btn btn-circle btn-ghost'
        onClick={() => router.push('/recipes')}
      >
        <ArrowBackLeftIcon />
      </button>
      <h1 className='col-span-4 mb-0 justify-self-center text-base'>
        {data?.name}
      </h1>
      <button
        className='btn btn-circle btn-ghost justify-self-end'
        onClick={() => router.push(`/recipes/${id}/edit?name=${data?.name}`)}
      >
        <span>
          <PencilSquareIcon />
        </span>
      </button>
    </nav>
  )
}

function EditRecipeNavbar() {
  const t = useTranslations()
  const router = useRouter()
  return (
    <nav className='prose navbar grid w-full grid-cols-3 gap-24 bg-transparent px-4'>
      <button
        className='btn btn-circle btn-ghost'
        onClick={() => router.back()}
      >
        <XIcon />
      </button>
      <h1 className='mb-0 justify-self-center text-center text-base whitespace-nowrap'>
        {t.recipes.byId.edit}
      </h1>
    </nav>
  )
}

function RoutesNavbar() {
  const pathname = usePathname()
  console.log('pathname', pathname)
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

    if (pathname === path) {
      styles =
        'relative flex w-20 flex-col items-center gap-1 text-xs font-semibold text-primary'
    }

    return styles
  }

  const activeSpanStyles = (path: string) => {
    let styles = 'absolute top-10 h-1 w-full bg-transparent'

    if (pathname === path) {
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
