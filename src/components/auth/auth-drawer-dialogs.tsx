import { useTranslations } from '~/hooks/use-translations'
import { DrawerDialog } from '../drawer-dialog'
import { LoginForm } from './login-form'
import { SignUpForm } from './sign-up-form'

export function SignUpDrawerDialog({
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
      title={t.auth.signUp}
      description={t.auth.signUpDescription}
      trigger={trigger}
      cancelText={t.common.cancel}
      submitText={t.auth.signUp}
      formId='signUp'
      open={open}
      onOpenChange={onOpenChange}
    >
      <SignUpForm />
    </DrawerDialog>
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
    >
      <LoginForm />
    </DrawerDialog>
  )
}
