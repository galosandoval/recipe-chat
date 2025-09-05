import { useMemo } from 'react'
import { CheckCircleIcon } from '~/components/icons'
import { LoadingSpinner } from '~/components/loaders/loading-spinner'
import { useTranslations } from '~/hooks/use-translations'

function AppMessage({ label, icon }: { icon: React.ReactNode; label: string }) {
  return (
    <div className='flex w-full justify-center'>
      <div className='bg-secondary flex items-center justify-center gap-2 rounded-2xl px-4 py-1'>
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

  const icon = useMemo(
    () =>
      isStreaming ? (
        <LoadingSpinner className='text-primary size-4' />
      ) : (
        <CheckCircleIcon className='text-success size-5' />
      ),
    [isStreaming]
  )
  const label = useMemo(
    () =>
      isStreaming
        ? t.chatWindow.replace('generatingRecipe', recipeName)
        : t.chatWindow.replace('generatedRecipe', recipeName),
    [isStreaming]
  )
  return <AppMessage label={label} icon={icon} />
}
