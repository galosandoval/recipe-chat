import { useTranslations } from '~/hooks/use-translations'
import { DrawerDialog } from '../drawer-dialog'
import { LoginForm } from './login-form'
import { SignUp } from './sign-up-form'
import { KeyRoundIcon } from 'lucide-react'

export function SignUpDrawerDialog({
  trigger,
  open,
  title,
  description,
  onOpenChange
}: {
  trigger?: React.ReactNode
  open?: boolean
  title?: string
  description?: string
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <SignUp
      trigger={trigger}
      title={title}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
    />
  )
}

export function LoginDrawerDialog({
  trigger,
  open,
  onOpenChange
}: {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const t = useTranslations()

  return (
    <DrawerDialog
      title={t.auth.login}
      description={t.auth.loginDescription}
      trigger={trigger}
      cancelText={t.common.cancel}
      submitText={t.auth.login}
      formId='login'
      open={open}
      onOpenChange={onOpenChange}
      submitIcon={<KeyRoundIcon />}
    >
      <LoginForm />
    </DrawerDialog>
  )
}
