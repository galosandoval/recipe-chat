import { useState } from 'react'
import { api } from '../utils/api'
import { ScrapedRecipe } from '../server/helpers/parse-recipe-url'
import { Step, TotalSteps } from '../components/TransitionWrapper'
import { Dialog } from '@headlessui/react'
import { CreateRecipe, UploadRecipeUrlForm } from '../pages/recipes'

export const useRecipeEntity = () => api.recipe.entity.useQuery(undefined)

export const useRecipeIngredientsAndInstructions = (id: number) =>
  api.recipe.ingredientsAndInstructions.useQuery({
    id
  })

export function useParseRecipeOnClient() {
  const [data, setData] = useState<ScrapedRecipe>()
  const [status, setStatus] = useState<
    'idle' | 'failed' | 'loading' | 'success'
  >('idle')

  async function fetchRecipe(url: string) {
    try {
      setStatus('loading')

      const response = await fetch(url)

      const html = await response.text()

      let openScriptIdx = 0
      let closeScriptIdx = 0
      let foundLinkedData = false
      for (let i = 0; i < html.length - 4; i++) {
        const char1 = html[i]
        const char2 = html[i + 1]
        const char3 = html[i + 2]
        const char4 = html[i + 3]
        const char5 = html[i + 4]

        if (
          char1 === 'l' &&
          char2 === 'd' &&
          char3 === '+' &&
          char4 === 'j' &&
          char5 === 's'
        ) {
          foundLinkedData = true
          openScriptIdx = i + 9
        } else if (
          foundLinkedData &&
          char1 === '<' &&
          char2 === '/' &&
          char3 === 's' &&
          char4 === 'c' &&
          char5 === 'r'
        ) {
          closeScriptIdx = i
          break
        }
      }

      const scrapedRecipe = JSON.parse(
        html.slice(openScriptIdx, closeScriptIdx)
      ) as ScrapedRecipe

      setData(scrapedRecipe)
      setStatus('success')
      return true
    } catch (error) {
      setStatus('failed')
      return false
    }
  }

  return { fetchRecipe, data, status }
}

export function useParseRecipe() {
  const {
    data: parsedDataOnClient,
    fetchRecipe,
    status
  } = useParseRecipeOnClient()
  const parseRecipeOnServer = api.recipe.parseRecipeUrl.useMutation()

  let data = parsedDataOnClient
  if (parseRecipeOnServer.status === 'success') {
    data = parseRecipeOnServer.data
  }

  const isError = parseRecipeOnServer.status === 'error'
  const isSuccess =
    status === 'success' || parseRecipeOnServer.status === 'success'

  const steps: TotalSteps = {
    first: {
      key: 'first',
      next: 'second',
      prev: null,
      component: (
        <>
          <Dialog.Title as='h3' className=''>
            Paste a recipe from the web
          </Dialog.Title>
          <UploadRecipeUrlForm onSubmit={onSubmitUrl} />
        </>
      )
    },
    second: {
      key: 'second',
      next: null,
      prev: 'first',
      component: (
        <>
          <Dialog.Title as='h3' className=''>
            Save recipe
          </Dialog.Title>
          <CreateRecipe
            closeModal={closeModal}
            data={data}
            isError={isError}
            isSuccess={isSuccess}
          />
        </>
      )
    }
  } as const

  const [isOpen, setIsOpen] = useState(false)

  const [currentStep, setCurrentStep] = useState<Step | undefined>(steps.first)

  function closeModal() {
    setIsOpen(false)
    setTimeout(() => {
      // to show UI change after closing modal
      setCurrentStep(steps.first)
    }, 200)
  }

  function openModal() {
    setIsOpen(true)
  }

  function nextStep() {
    setCurrentStep((state) => steps[state?.next as keyof typeof steps])
  }

  async function onSubmitUrl({ url }: { url: string }) {
    const isSuccessOnClient = await fetchRecipe(url)

    if (!isSuccessOnClient) {
      parseRecipeOnServer.mutate(url)
    }

    nextStep()
  }

  return { isOpen, steps, currentStep, openModal, closeModal }
}
