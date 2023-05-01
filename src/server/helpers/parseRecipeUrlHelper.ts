import { ScrapedRecipe } from './parse-recipe-url'

export function parseHtml(html: string) {
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

  console.log(
    'parsed recipe',
    JSON.parse(html.slice(openScriptIdx, closeScriptIdx)) as ScrapedRecipe
  )
  return JSON.parse(
    html.slice(openScriptIdx, closeScriptIdx)
  )[0] as ScrapedRecipe
}
