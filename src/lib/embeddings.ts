import { embed } from 'ai'
import { openai } from '@ai-sdk/openai'

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-large'

export type RecipeSignatureParts = {
  name: string
  description?: string | null
  cuisine?: string | null
  course?: string | null
  dietTags?: string[]
  flavorTags?: string[]
  mainIngredients?: string[]
  techniques?: string[]
}

const lc = (s?: string | null) => (s ?? '').trim().toLowerCase()
const lca = (a?: string[]) =>
  (a ?? [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)

  export function buildSignature(p: RecipeSignatureParts) {
    const diet = lca(p.dietTags).join(', ')
    const flavor = lca(p.flavorTags).join(', ')
    const mains = lca(p.mainIngredients).join(', ')
    const tech = lca(p.techniques).join(', ')
    return [
      p.name.trim().toLowerCase(),
      lc(p.cuisine) && `cuisine: ${lc(p.cuisine)}`,
      lc(p.course) && `course: ${lc(p.course)}`,
      diet && `diet: ${diet}`,
      mains && `mains: ${mains}`,
      tech && `techniques: ${tech}`,
      flavor && `flavors: ${flavor}`,
      (p.description ?? '').trim() && `summary: ${(p.description ?? '').trim()}`
    ]
      .filter(Boolean)
      .join('\n')
  }

export async function embedSignature(signature: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: signature
  })
  return embedding
}
