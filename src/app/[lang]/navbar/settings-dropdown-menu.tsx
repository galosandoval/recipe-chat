'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { usePathname } from 'next/navigation'
import { ChatsDrawer } from '~/components/chats-drawer'
import { chatStore } from '~/stores/chat-store'
import {
  LoginDrawerDialog,
  SignUpDrawerDialog
} from '~/components/auth/auth-drawer-dialogs'
import {
  buildMenuItem,
  DropdownMenu,
  type MenuItemProps
} from '~/components/dropdown-menu'
import {
  HistoryIcon,
  KeyRoundIcon,
  LogOutIcon,
  MoonIcon,
  PlusIcon,
  RulerIcon,
  SettingsIcon,
  SunIcon,
  UserPlusIcon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { darkTheme, lightTheme } from '~/constants/theme'
import { useState } from 'react'
import { Dialog } from '~/components/dialog'
import { Form } from '~/components/form/form'
import { api } from '~/trpc/react'
import {
  recipeUrlSchema,
  type RecipeUrlSchemaType
} from '~/schemas/recipes-schema'
import { CreateParsedRecipe } from '../recipes/create-recipe-button'
import { FormInput } from '~/components/form/form-input'
import { Button } from '~/components/button'
import { useAppForm } from '~/hooks/use-app-form'
import { z } from 'zod'

const preferredUnitsFormSchema = z.object({
  preferredWeightUnit: z.string(),
  preferredVolumeUnit: z.string()
})

export function NavDropdownMenu() {
  const t = useTranslations()
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isChatsOpen, setIsChatsOpen] = useState(false)
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false)
  const [isPreferredUnitsOpen, setIsPreferredUnitsOpen] = useState(false)
  const { chatId } = chatStore()
  const pathname = usePathname()

  const session = useSession()

  const handleToggleSignUp = () => {
    setIsSignUpOpen((state) => !state)
  }
  const handleToggleLogin = () => {
    setIsLoginOpen((state) => !state)
  }
  const handleToggleDrawer = () => {
    setIsChatsOpen((state) => !state)
  }
  const handleToggleAddRecipe = () => {
    setIsAddRecipeOpen((state) => !state)
  }
  const handleTogglePreferredUnits = () => {
    setIsPreferredUnitsOpen((state) => !state)
  }

  const isAuthenticated = !!session.data
  const items: MenuItemProps[] = [useThemeToggleMenuItem(), useLogoutMenuItem()]

  if (isAuthenticated) {
    items.push({
      icon: <RulerIcon />,
      label: 'nav.menu.preferredUnits',
      onClick: handleTogglePreferredUnits
    })
  }

  if (!chatId && pathname.includes('chat') && isAuthenticated) {
    items.push({
      slot: (
        <span onClick={handleToggleDrawer}>
          <HistoryIcon />
          {t.nav.menu.chats}
        </span>
      )
    })
  }

  if (!isAuthenticated) {
    // auth items
    items.push(
      {
        slot: (
          <span onClick={handleToggleLogin}>
            <KeyRoundIcon />
            {t.nav.menu.login}
          </span>
        )
      },
      {
        slot: (
          <span onClick={handleToggleSignUp}>
            <UserPlusIcon />
            {t.nav.menu.signUp}
          </span>
        )
      }
    )
  }
  if (isAuthenticated && pathname.includes('recipes')) {
    // recipe items
    items.push({
      icon: <PlusIcon />,
      label: 'nav.menu.addRecipe',
      onClick: handleToggleAddRecipe,
      space: 'above'
    })
  }

  items.push(useStartNewChatMenuItem())

  return (
    <>
      <DropdownMenu
        trigger={
          <Button variant='outline' size='icon'>
            <SettingsIcon />
          </Button>
        }
        items={items}
        title={t.nav.settings}
      />
      <SignUpDrawerDialog
        open={isSignUpOpen}
        onOpenChange={handleToggleSignUp}
      />
      <ParseAndAddRecipeDialogs
        open={isAddRecipeOpen}
        onOpenChange={handleToggleAddRecipe}
      />
      <LoginDrawerDialog open={isLoginOpen} onOpenChange={handleToggleLogin} />
      <ChatsDrawer open={isChatsOpen} onOpenChange={handleToggleDrawer} />
      <PreferredUnitsDialog
        open={isPreferredUnitsOpen}
        onOpenChange={setIsPreferredUnitsOpen}
      />
    </>
  )
}

function PreferredUnitsDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations()
  const { data: user } = api.users.get.useQuery(undefined, { enabled: open })
  const utils = api.useUtils()
  const { mutate, status } = api.users.updatePreferredUnits.useMutation({
    onSuccess: () => {
      utils.users.get.invalidate()
      onOpenChange(false)
    }
  })
  const form = useAppForm(preferredUnitsFormSchema, {
    defaultValues: {
      preferredWeightUnit: '',
      preferredVolumeUnit: ''
    },
    values:
      open && user
        ? {
            preferredWeightUnit: user.preferredWeightUnit ?? '',
            preferredVolumeUnit: user.preferredVolumeUnit ?? ''
          }
        : undefined
  })

  const onSubmit = (values: z.infer<typeof preferredUnitsFormSchema>) => {
    mutate({
      preferredWeightUnit: values.preferredWeightUnit || null,
      preferredVolumeUnit: values.preferredVolumeUnit || null
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.nav.menu.preferredUnits}
      description={t.pantry.preferredWeightUnit + ' / ' + t.pantry.preferredVolumeUnit}
      cancelText={t.common.cancel}
      submitText={t.common.save}
      formId='preferred-units-form'
      isLoading={status === 'pending'}
    >
      <Form form={form} onSubmit={onSubmit} formId='preferred-units-form'>
        <div className='flex flex-col gap-4 py-2'>
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium'>
              {t.pantry.preferredWeightUnit}
            </label>
            <select
              className='border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm'
              {...form.register('preferredWeightUnit')}
            >
              <option value=''>Default</option>
              <option value='g'>g (grams)</option>
              <option value='oz'>oz (ounces)</option>
            </select>
          </div>
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium'>
              {t.pantry.preferredVolumeUnit}
            </label>
            <select
              className='border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm'
              {...form.register('preferredVolumeUnit')}
            >
              <option value=''>Default</option>
              <option value='ml'>ml (milliliters)</option>
              <option value='cup'>cup</option>
            </select>
          </div>
        </div>
      </Form>
    </Dialog>
  )
}

function ParseAndAddRecipeDialogs({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations()
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false)
  const { mutate, status, data } = api.recipes.parseRecipeUrl.useMutation({
    onSuccess: (_) => {
      onOpenChange(false)
      setTimeout(() => {
        setIsAddRecipeOpen(true)
      }, 200)
    }
  })
  const form = useAppForm(recipeUrlSchema(t.error.invalidUrl), {
    defaultValues: {
      url: ''
    }
  })
  const onSubmit = (values: RecipeUrlSchemaType) => {
    mutate(values.url)
  }

  return (
    <>
      <Dialog
        formId='parse-recipe-form'
        cancelText={t.common.cancel}
        submitText={t.recipes.upload}
        title={t.recipes.paste}
        description={t.recipes.enterUrl}
        open={open}
        onOpenChange={onOpenChange}
        isLoading={status === 'pending'}
      >
        <Form form={form} onSubmit={onSubmit} formId='parse-recipe-form'>
          <FormInput name='url' label={t.recipes.url} />
        </Form>
      </Dialog>

      <CreateParsedRecipe
        isAddRecipeOpen={isAddRecipeOpen}
        data={data}
        closeModal={() => setIsAddRecipeOpen(false)}
      />
    </>
  )
}

function useThemeToggleMenuItem() {
  const { theme, setTheme } = useTheme()
  const handleToggleTheme = () => {
    if (theme === darkTheme) {
      setTheme(lightTheme)
    } else {
      setTheme(darkTheme)
    }
  }

  return buildMenuItem({
    label: 'nav.menu.theme',
    icon: theme === darkTheme ? <SunIcon /> : <MoonIcon />,
    onClick: handleToggleTheme
  })
}

function useLogoutMenuItem() {
  const { setChatId } = chatStore()
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session)
    return buildMenuItem({
      slot: null
    })

  const handleSignOut = () => {
    signOut({ callbackUrl: pathname })

    setChatId('')
  }

  return buildMenuItem({
    label: 'nav.menu.logout',
    icon: <LogOutIcon />,
    onClick: handleSignOut
  })
}

function useStartNewChatMenuItem() {
  const { setChatId } = chatStore()
  const pathname = usePathname()
  const { setStream, setMessages, messages } = chatStore()

  const handleStartNewChat = () => {
    setChatId('')
    setStream(null)
    setMessages([])
  }

  // Only show if there's an actual chat ID (not empty string or undefined)
  const isInChat = pathname.includes('chat')
  if (!isInChat || (messages.length === 0 && isInChat)) {
    return buildMenuItem({
      slot: null
    })
  }

  return buildMenuItem({
    label: 'nav.menu.startNewChat',
    icon: <PlusIcon />,
    onClick: handleStartNewChat,
    space: 'above'
  })
}
