import { useState } from 'react'
import { ScrapedRecipe } from '../../server/helpers/parse-recipe-url'

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
