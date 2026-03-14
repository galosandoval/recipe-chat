import { CheckCircleIcon, AlertCircleIcon } from 'lucide-react'
import { LoadingSpinner } from '~/components/loaders/loading-spinner'
import { useTranslations } from '~/hooks/use-translations'

function AppMessage({ label, icon }: { icon: React.ReactNode; label: string }) {
  return (
    <div className='flex w-full justify-center'>
      <div className='text-muted-foreground flex items-center justify-center gap-2'>
        <div className='flex items-center justify-center'>{icon}</div>
        <p className='text-foreground text-xs'>{label}</p>
      </div>
    </div>
  )
}

export function GenerateStatusAppMessage({
  recipeName,
  isStreaming
}: {
  recipeName: string
  isStreaming: boolean
}) {
  const t = useTranslations()

  const icon = isStreaming ? (
    <LoadingSpinner className='text-primary size-4' />
  ) : (
    <CheckCircleIcon className='text-success size-5' />
  )
  const label = isStreaming
    ? t.chat.replace('generatingRecipe', recipeName)
    : t.chat.replace('generatedRecipe', recipeName)
  return <AppMessage label={label} icon={icon} />
}

export function ToolResultAppMessage({
  toolName,
  result
}: {
  toolName: string
  result: { success: boolean; recipeName?: string; error?: string }
}) {
  if (!result.success) {
    return (
      <AppMessage
        label={result.error ?? 'Something went wrong'}
        icon={<AlertCircleIcon className='text-destructive size-5' />}
      />
    )
  }

  const label =
    toolName === 'editRecipe'
      ? `Updated recipe: ${result.recipeName ?? ''}`
      : `Added note to: ${result.recipeName ?? ''}`

  return (
    <AppMessage
      label={label}
      icon={<CheckCircleIcon className='text-success size-5' />}
    />
  )
}
