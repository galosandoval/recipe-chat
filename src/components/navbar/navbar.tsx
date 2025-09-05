'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { NavDropdownMenu } from './settings-dropdown-menu'
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
    <div className='border-b-secondary from-background to-background/70 text-foreground fixed top-0 z-10 flex w-full justify-center border-b bg-gradient-to-b bg-blend-saturation backdrop-blur transition-all duration-300'>
      {navbar}
    </div>
  )
}

function PublicNavbar() {
  const t = useTranslations()

  return (
    <nav className='grid w-full grid-cols-3 place-items-center items-center bg-transparent px-4 py-2'>
      <div></div>
      <h1 className='text-base'>{t.nav.appName}</h1>
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
      <Button variant='ghost' size='icon' onClick={() => router.back()}>
        <XIcon />
      </Button>
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
    <div className='from-background to-background/70 border-b-foreground/30 fixed top-0 z-10 mx-auto flex w-full flex-col items-center border-b-[0.5px] bg-transparent bg-gradient-to-b bg-blend-saturation backdrop-blur-xs'>
      <div className='text-foreground my-1 bg-transparent text-sm font-bold'>
        RecipeChat
      </div>
      <nav className='top-5 mx-auto flex w-full justify-between gap-2 overflow-hidden bg-transparent px-5 py-1.5'>
        {MENU_ITEMS.map((item) => (
          <Button
            className={cn(
              'text-card-foreground/75 active:bg-secondary hover:bg-secondary hover:text-secondary-foreground/75 flex flex-1 items-center justify-center gap-1 rounded transition-colors duration-75 active:scale-[99%]',
              isActive(item.value) &&
                'bg-secondary text-secondary-foreground/75 rounded'
            )}
            variant={isActive(item.value) ? 'default' : 'outline'}
            key={item.value}
            asChild
          >
            <Link href={item.value}>
              {item.icon}
              <span className='text-sm'>{t.nav[item.label]}</span>
            </Link>
          </Button>
        ))}
        <div>
          <NavDropdownMenu />
        </div>
      </nav>
    </div>
  )
}
