'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { NavDropdownMenu } from './dropdown-menus'
import { ArrowBigLeft, CookingPot, ListTodo, MessageCircle } from 'lucide-react'
import { XIcon } from '../icons'
import { useTranslations } from '~/hooks/use-translations'
import { cn } from '~/lib/utils'
import { Button } from '../ui/button'
import { EditByIdDrawer } from '~/app/[lang]/recipes/[id]/edit-by-id-drawer'

export const Navbar = () => {
  const { data } = useSession()
  const pathname = usePathname()
  const { lang, id } = useParams()
  let navbar = <RoutesNavbar />

  if (!data) {
    navbar = <PublicNavbar />
  } else if (pathname === `/${lang}/recipes/${id}/edit`) {
    navbar = <EditRecipeNavbar />
  } else if (pathname === `/${lang}/recipes/${id}`) {
    return <RecipeByIdNavbar />
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

  return (
    <nav className='navbar grid w-full grid-cols-3 place-items-center items-center bg-transparent px-4'>
      <div></div>
      <h1 className='mb-0 text-base'>{t.nav.appName}</h1>
      <div className='justify-self-end'>
        <NavDropdownMenu />
      </div>
    </nav>
  )
}

function RecipeByIdNavbar() {
  const router = useRouter()
  return (
    <nav className='fixed z-20 flex w-full justify-between bg-transparent p-4'>
      <Button variant='outline' onClick={() => router.back()} size='icon'>
        <ArrowBigLeft />
      </Button>

      <EditByIdDrawer />
    </nav>
  )
}

function EditRecipeNavbar() {
  const t = useTranslations()
  const router = useRouter()
  return (
    <nav className='grid w-full grid-cols-3 gap-24 bg-transparent px-4'>
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
    icon: <MessageCircle size='1rem' />,
    label: 'chat'
  },
  {
    value: '/list',
    icon: <ListTodo size='1rem' />,
    label: 'list'
  },
  {
    value: '/recipes',
    icon: <CookingPot size='1rem' />,
    label: 'recipes'
  }
] as const

function RoutesNavbar() {
  const pathname = usePathname()
  const t = useTranslations()
  const isActive = (path: string) => pathname.includes(path)
  return (
    <div className='from-base-100 to-base-100/70 border-b-base-content/30 fixed top-0 z-10 mx-auto flex w-full flex-col items-center border-b-[0.5px] bg-transparent bg-gradient-to-b bg-blend-saturation backdrop-blur-xs'>
      <div className='text-base-content bg-base-100 my-2 text-sm font-bold'>
        RecipeChat
      </div>
      <nav className='bg-base-300/60 top-5 mx-auto flex w-full justify-between gap-2 overflow-hidden px-5 py-1'>
        {MENU_ITEMS.map((item) => (
          <Link
            className={cn(
              'text-base-content/75 active:bg-base-100 hover:bg-base-100 flex flex-1 items-center justify-center gap-1 transition-colors duration-75 active:scale-[99%]',
              isActive(item.value) && 'bg-base-100 text-base-content rounded'
            )}
            href={item.value}
            key={item.value}
          >
            {item.icon}
            <span className='text-sm'>{t.nav[item.label]}</span>
          </Link>
        ))}
        <div>
          <NavDropdownMenu />
        </div>
      </nav>
    </div>
  )
}
