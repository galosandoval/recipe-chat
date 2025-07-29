import { useTranslations } from '~/hooks/use-translations'
import { useSession } from 'next-auth/react'
import { chatStore } from '~/stores/chat'
import type { GeneratedRecipe } from '~/schemas/chats'
import { Button } from './button'
import { PaperPlaneIcon } from './icons'

export function RecipesToGenerate({ recipes }: { recipes: GeneratedRecipe[] }) {
  const t = useTranslations()
  // const [generated, setGenerated] = useState<boolean[]>(
  // 	recipes?.map(() => false) ?? []
  // )
  const { triggerAISubmission, isStreaming } = chatStore()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  // if (!recipes || recipes.length === 0 || recipes.length === 1) {
  // 	return null
  // }

  const generateRecipe = async (
    name: string,
    description: string,
    index: number
  ) => {
    // onChatFormSubmit({
    // 	prompt: `Generate a recipe for ${name}: ${description}`
    // })
    // setGenerated((state) => {
    // 	const newState = [...state]
    // 	newState[index] = true
    // 	return newState
    // })
    triggerAISubmission(t.chatWindow.generateRecipe + name + ': ' + description)
  }

  return (
    <div className='grid grid-cols-1 items-stretch gap-2 pt-3 sm:grid-cols-2'>
      {recipes.map((r, i) => (
        <div key={r.name + i} className='bg-base-100 rounded p-2'>
          <h3 className='font-semibold'>{r.name}</h3>
          <p className='text-xs'>{r.description}</p>

          <div className='flex justify-end pt-2'>
            {/* {generated[i] ? (
                isAuthenticated ? (
                  <Button
                    className='w-full'
                    // onClick={() => handleSaveRecipe(r)}
                  >
                    <Save />
                    {t.chatWindow.save}
                  </Button>
                ) : (
                  // fake save button to show the sign up modal
                  <SignUpModalTrigger>
                    <Save />
                    {t.chatWindow.save}
                  </SignUpModalTrigger>
                )
              ) : (
                  )} */}
            <GenerateButton
              disabled={isStreaming}
              onClick={() => generateRecipe(r.name, r.description ?? '', i)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function GenerateButton({
  disabled,
  onClick
}: {
  disabled: boolean
  onClick: () => Promise<void>
}) {
  const t = useTranslations()

  const handleGenerate = async () => {
    await onClick()
  }

  return (
    <Button className='btn-sm btn' disabled={disabled} onClick={handleGenerate}>
      <PaperPlaneIcon className='size-4' />
      {t.chatWindow.generate}
    </Button>
  )
}
