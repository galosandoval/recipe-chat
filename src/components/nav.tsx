'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { NavDropdownMenu } from './nav-dropdown-menus'
import {
  ArrowBackLeftIcon,
  ChatBubbleLeftRightIcon,
  ListBulletIcon,
  PencilSquareIcon,
  RecipesIcon,
  XIcon
} from './icons'
import { useTranslations } from '~/hooks/use-translations'
import { ThemeToggle, useTheme } from './theme-toggle'
import { api } from '~/trpc/react'
import { cn } from '~/utils/cn'

// Custom link component that prefetches list data
function ListLink({
  children,
  className
}: {
  children: React.ReactNode
  className: string
}) {
  const { data: session } = useSession()
  const utils = api.useUtils()

  const handlePrefetch = () => {
    if (session?.user.id) {
      void utils.lists.byUserId.prefetch({ userId: session.user.id })
    }
  }

  return (
    <Link
      className={className}
      href='/list'
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onTouchStart={handlePrefetch} // Better for mobile
    >
      {children}
    </Link>
  )
}
// Custom link component that prefetches list data
function RecipesLink({
  children,
  className
}: {
  children: React.ReactNode
  className: string
}) {
  const { data: session } = useSession()
  const utils = api.useUtils()

  const handlePrefetch = () => {
    if (session?.user.id) {
      void utils.recipes.infiniteRecipes.prefetchInfinite({
        limit: 10,
        search: ''
      })
    }
  }

  return (
    <Link
      className={className}
      href='/recipes'
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onTouchStart={handlePrefetch} // Better for mobile
    >
      {children}
    </Link>
  )
}

export function NavContainer() {
  return (
    <div>
      <Nav />
    </div>
  )
}

const Nav = () => {
  const { data } = useSession()
  const pathname = usePathname()
  const { lang, id } = useParams()
  let navbar = <RoutesNavbar />

  if (!data) {
    navbar = <PublicNavbar />
  } else if (pathname === `/${lang}/recipes/${id}/edit`) {
    navbar = <EditRecipeNavbar />
  } else if (pathname === `/${lang}/recipes/${id}`) {
    navbar = <RecipeByIdNavbar />
  } else {
    return navbar
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
    <nav className='prose navbar grid w-full grid-cols-3 place-items-center items-center bg-transparent px-4'>
      <div></div>
      <h1 className='mb-0 text-base'>{t.nav.appName}</h1>
      <div className='justify-self-end'>
        <ThemeToggle theme={theme} updateTheme={updateTheme} />
      </div>
    </nav>
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

const MENU_ITEMS = [
  {
    value: '/chat',
    icon: <ChatBubbleLeftRightIcon />,
    label: 'chat'
  },
  {
    value: '/list',
    icon: <ListBulletIcon />,
    label: 'list'
  },
  {
    value: '/recipes',
    icon: <RecipesIcon />,
    label: 'recipes'
  }
] as const

function RoutesNavbar() {
  const pathname = usePathname()
  const t = useTranslations()

  const activeLinkStyles = (path: string) => {
    const isActive = pathname.includes(path)

    return cn(
      'active:translate-y-px transition-all duration-75',
      isActive && 'dock-active'
    )
  }

  return (
    <div className='border-b-base-300 from-base-100 to-base-100/70 fixed top-0 z-10 mx-auto flex w-full flex-col items-center rounded bg-transparent bg-gradient-to-b pb-[3.5rem] bg-blend-saturation backdrop-blur-xs'>
      <span className='text-base-content text-sm font-bold'>RecipeChat</span>
      <nav className='dock dock-sm border-b-base-content/5 top-5 w-full max-w-xl justify-between overflow-hidden rounded-b border-t-0 border-b-[0.5px] bg-transparent px-5'>
        {MENU_ITEMS.map((item) => {
          if (item.value === '/list') {
            return (
              <ListLink
                className={activeLinkStyles(item.value)}
                key={item.value}
              >
                {item.icon}
                <span className='dock-label'>{t.nav[item.label]}</span>
              </ListLink>
            )
          } else if (item.value === '/recipes') {
            return (
              <RecipesLink
                className={activeLinkStyles(item.value)}
                key={item.value}
              >
                {item.icon}
                <span className='dock-label'>{t.nav[item.label]}</span>
              </RecipesLink>
            )
          }

          return (
            <Link
              className={activeLinkStyles(item.value)}
              href={item.value}
              key={item.value}
            >
              {item.icon}
              <span className='dock-label'>{t.nav[item.label]}</span>
            </Link>
          )
        })}
        <div className='flex w-10 flex-1/2'>
          <NavDropdownMenu />
        </div>
      </nav>
    </div>
  )
}
