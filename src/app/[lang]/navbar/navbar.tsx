'use client'

import { useSession } from 'next-auth/react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { NavDropdownMenu } from './settings-dropdown-menu'
import {
  ArrowBigLeft,
  CookingPotIcon,
  EditIcon,
  EllipsisVerticalIcon,
  ListTodoIcon,
  MessageSquareIcon,
  TrashIcon
} from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'
import { cn } from '~/lib/utils'
import { Button } from '~/components/button'
import { NavigationButton } from '~/components/navigation-button'
import { DropdownMenu, type MenuItemProps } from '~/components/dropdown-menu'
import { EditByIdDrawer } from '../recipes/[slug]/edit-by-id-drawer'
import { useState } from 'react'
import { DeleteRecipeDialog } from '~/components/delete-recipe-dialog'
import { SearchBar } from '../recipes/search-bar'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'

export const Navbar = () => {
  const { data } = useSession()
  const pathname = usePathname()
  const { lang } = useParams()
  const slug = useRecipeSlug()

  let navbar = <RoutesNavbar />
  if (!data) {
    navbar = <PublicNavbar />
  } else if (pathname === `/${lang}/recipes/${slug}`) {
    return <RecipeByIdNavbar />
  }

  return (
    <div className='fixed top-0 z-30 w-full'>
      <div className='mx-auto flex w-full max-w-2xl justify-center sm:pt-3'>
        <div className='glass-element from-background to-background/30 text-foreground border-b-muted-foreground/20 w-full border-b bg-gradient-to-b sm:rounded-md'>
          {navbar}
        </div>
      </div>
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
    <nav className='fixed z-20 flex w-full'>
      <div className='mx-auto flex w-full max-w-2xl flex-1 justify-between bg-transparent p-3'>
        <Button
          variant='outline'
          className='glass-background'
          onClick={() => router.push('/recipes')}
          size='icon'
        >
          <ArrowBigLeft />
        </Button>

        <RecipeByIdDropdownMenu />
      </div>
    </nav>
  )
}

export function RecipeByIdDropdownMenu() {
  const t = useTranslations()
  const [openEditDrawer, setOpenEditDrawer] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const items: MenuItemProps[] = [
    {
      label: 'nav.menu.editRecipe',
      onClick: () => setOpenEditDrawer(true),
      icon: <EditIcon />
    },
    {
      label: 'recipes.delete',
      onClick: () => setOpenDeleteDialog(true),
      icon: <TrashIcon />
    }
  ]
  return (
    <>
      <DropdownMenu
        items={items}
        title={t.nav.settings}
        trigger={
          <Button variant='outline' size='icon'>
            <EllipsisVerticalIcon />
          </Button>
        }
      />
      <EditByIdDrawer open={openEditDrawer} onOpenChange={setOpenEditDrawer} />
      <DeleteRecipeDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </>
  )
}

const MENU_ITEMS = [
  {
    value: '/chat',
    icon: <MessageSquareIcon size='1rem' />,
    label: 'chat'
  },
  {
    value: '/list',
    icon: <ListTodoIcon size='1rem' />,
    label: 'list'
  },
  {
    value: '/recipes',
    icon: <CookingPotIcon size='1rem' />,
    label: 'recipes'
  }
] as const

function RoutesNavbar() {
  const pathname = usePathname()
  const t = useTranslations()
  const isActive = (path: string) => pathname.includes(path)
  const isInRecipes = pathname.includes('/recipes')
  return (
    <div className='flex w-full flex-col items-center'>
      <div className='text-foreground my-1 text-sm font-bold'>RecipeChat</div>
      <nav className='top-5 mx-auto flex w-full justify-between gap-2 overflow-hidden px-3 py-1.5'>
        {MENU_ITEMS.map((item) => (
          <NavigationButton
            href={item.value}
            className={cn(
              'text-card-foreground/75 active:bg-accent hover:bg-accent hover:text-accent-foreground/75 flex flex-1 items-center justify-center gap-1 rounded-md transition-colors duration-75 active:scale-[99%]',
              isActive(item.value) &&
                'bg-accent text-accent-foreground/75 rounded-md'
            )}
            as={Button}
            variant={isActive(item.value) ? 'default' : 'outline'}
            key={item.value}
          >
            {item.icon}
            <span className='text-sm'>{t.nav[item.label]}</span>
          </NavigationButton>
        ))}
        <div>
          <NavDropdownMenu />
        </div>
      </nav>
      {isInRecipes && <SearchBar />}
    </div>
  )
}
