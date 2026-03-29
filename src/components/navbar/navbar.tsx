'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { NavDropdownMenu } from './settings-dropdown-menu'
import {
  ArrowBigLeft,
  CookingPotIcon,
  EditIcon,
  EllipsisVerticalIcon,
  ListTodoIcon,
  MessageSquareIcon,
  PackageIcon,
  TrashIcon
} from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'
import { cn } from '~/lib/utils'
import { Button } from '~/components/button'
import { NavigationButton } from '~/components/navigation-button'
import { DropdownMenu, type MenuItemProps } from '~/components/dropdown-menu'
import { useState } from 'react'
import { DeleteRecipeDialog } from '~/components/delete-recipe-dialog'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'
import { EditByIdDrawer } from '~/components/navbar/edit-by-id-drawer'

export const Navbar = () => {
  const pathname = usePathname()
  const slug = useRecipeSlug()

  if (pathname === `/recipes/${slug}`) {
    return <RecipeByIdNavbar />
  }

  return (
    <div className='w-full'>
      <div className='mx-auto flex w-full max-w-2xl justify-center sm:pt-3'>
        <div className='glass-element from-background to-background/30 text-foreground border-muted-foreground/20 w-full border-b bg-gradient-to-b sm:rounded-md sm:border'>
          <AppHeader />
        </div>
      </div>
    </div>
  )
}

export const BottomNav = () => {
  const { data } = useSession()
  const pathname = usePathname()
  const slug = useRecipeSlug()

  if (!data || pathname === `/recipes/${slug}`) {
    return null
  }

  return (
    <div className='w-full'>
      <div className='mx-auto flex w-full max-w-2xl justify-center sm:pb-3'>
        <div className='glass-element from-background/30 to-background text-foreground border-muted-foreground/20 w-full border-t bg-gradient-to-t sm:rounded-md sm:border'>
          <BottomNavTabs />
        </div>
      </div>
    </div>
  )
}

function AppHeader() {
  const t = useTranslations()

  return (
    <nav className='grid w-full grid-cols-3 place-items-center items-center bg-transparent px-4 py-1'>
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
    <nav>
      <div className='absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-2xl flex-1 justify-between bg-transparent p-3'>
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

const NAV_ITEMS = [
  {
    value: '/chat',
    icon: <MessageSquareIcon />,
    label: 'chat'
  },
  {
    value: '/recipes',
    icon: <CookingPotIcon />,
    label: 'recipes'
  },
  {
    value: '/list',
    icon: <ListTodoIcon />,
    label: 'list'
  },
  {
    value: '/pantry',
    icon: <PackageIcon />,
    label: 'pantry'
  }
] as const

function BottomNavTabs() {
  const pathname = usePathname()
  const t = useTranslations()
  const isActive = (path: string) => pathname.includes(path)
  return (
    <nav className='mx-auto flex w-full justify-between gap-2 overflow-hidden px-3 py-1.5'>
      {NAV_ITEMS.map((item) => (
        <NavigationButton
          href={item.value}
          className={cn(
            'text-card-foreground/75 active:bg-accent hover:bg-accent hover:text-accent-foreground/75 flex h-14 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 py-1 transition-colors duration-75 active:scale-[99%] [&_svg]:size-5',
            isActive(item.value) &&
            'bg-accent text-accent-foreground/75 rounded-md'
          )}
          as={Button}
          variant={isActive(item.value) ? 'default' : 'outline'}
          key={item.value}
        >
          {item.icon}
          <span className='text-xs'>{t.nav[item.label]}</span>
        </NavigationButton>
      ))}
    </nav>
  )
}
