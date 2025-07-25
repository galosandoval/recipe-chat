import { Button } from './button'
import { useTranslations } from '~/hooks/use-translations'
import { useRecipeChat } from '~/hooks/use-recipe-chat'
import { PaperPlaneIcon, StopIcon } from './icons'

export function SubmitMessageForm() {
  const { handleSubmit, input, handleInputChange, isSendingMessage } =
    useRecipeChat()
  const t = useTranslations()

  return (
    <form
      onSubmit={handleSubmit}
      className={`fixed bottom-0 left-0 flex w-full items-center md:rounded-md`}
    >
      <div className='prose bg-base-300/75 mx-auto flex w-full items-center py-1 sm:mb-2 sm:rounded-lg'>
        <div className='flex w-full px-2 py-1'>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={t.chatFormPlaceholder}
            className='input input-bordered bg-base-100/75 focus:bg-base-100 relative w-full'
          />
        </div>

        <div className='pr-2'>
          <Button
            type='submit'
            disabled={input.length < 5 && !isSendingMessage}
            className={`btn ${isSendingMessage ? 'btn-error' : 'btn-accent'}`}
          >
            {isSendingMessage ? <StopIcon /> : <PaperPlaneIcon />}
          </Button>
        </div>
      </div>
    </form>
  )
}
