import { SendIcon } from 'lucide-react'
import { Button } from '~/components/button'
import { useTranslations } from '~/hooks/use-translations'

/**
 * The Generate action that sits on a Recipe Option — look and label only, with
 * the generating itself left to the caller. Both the chat and the landing page's
 * proof section render this one button, so the marketing card can't drift from
 * the real one as the chat's button changes.
 */
export function GenerateRecipeButton({
  disabled,
  isLoading,
  onClick,
  isDecorative
}: {
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  /**
   * For a card that only shows what the chat returns: nothing happens on press,
   * so the button is hidden from assistive tech and dropped from the tab order
   * rather than offered as pressable.
   */
  isDecorative?: boolean
}) {
  const t = useTranslations()

  return (
    <Button
      size='sm'
      variant='outline'
      icon={<SendIcon className='size-4' />}
      disabled={disabled}
      isLoading={isLoading}
      onClick={onClick}
      aria-hidden={isDecorative}
      tabIndex={isDecorative ? -1 : undefined}
    >
      {t.chat.generate}
    </Button>
  )
}
