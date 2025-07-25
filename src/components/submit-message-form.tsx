import { useEffect, useRef } from 'react'
import { Button } from './button'
import { useTranslations } from '~/hooks/use-translations'
import { useRecipeChat } from '~/hooks/use-recipe-chat'

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
            className='input input-bordered bg-base-100/75 focus:bg-base-100 relative w-full resize-none pt-2'
          />
        </div>

        <div className='pr-2'>
          <Button
            type='submit'
            disabled={input.length < 5 && !isSendingMessage}
            className={`btn ${isSendingMessage ? 'btn-error' : 'btn-accent'}`}
          >
            {isSendingMessage ? (
              // stop icon
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-6 w-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z'
                />
              </svg>
            ) : (
              // plane icon
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-6 w-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
                />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
