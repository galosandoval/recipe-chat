import {
  facetDefaults,
  toRecipeDTOs,
  transformStoredMessages
} from './recipe-dto'
import type { MessageWithRecipesDTO, RecipeDTO } from '~/schemas/chats-schema'

function priorCard(partial: { name: string; id: string }): RecipeDTO {
  return {
    id: partial.id,
    name: partial.name,
    slug: partial.name.toLowerCase(),
    description: 'desc',
    ingredients: [],
    instructions: [],
    prepMinutes: null,
    cookMinutes: null,
    servings: null,
    cuisine: null,
    course: null,
    dietTags: [],
    flavorTags: [],
    mainIngredients: [],
    techniques: [],
    saved: false
  }
}

describe('facetDefaults', () => {
  it('null-coalesces every Facet field', () => {
    expect(facetDefaults({})).toEqual({
      cuisine: null,
      course: null,
      dietTags: [],
      flavorTags: [],
      mainIngredients: [],
      techniques: []
    })
  })

  it('drops null elements inside Facet arrays', () => {
    expect(
      facetDefaults({
        cuisine: 'thai',
        course: 'main',
        dietTags: ['vegan', null],
        flavorTags: [null, 'spicy'],
        mainIngredients: ['tofu', null],
        techniques: [null]
      })
    ).toEqual({
      cuisine: 'thai',
      course: 'main',
      dietTags: ['vegan', ''],
      flavorTags: ['', 'spicy'],
      mainIngredients: ['tofu', ''],
      techniques: ['']
    })
  })
})

describe('toRecipeDTOs', () => {
  it('maps a full generated recipe carrying every Facet', () => {
    const [dto] = toRecipeDTOs([
      {
        name: 'Pad Thai',
        description: 'noodles',
        prepMinutes: 10,
        cookMinutes: 15,
        servings: 4,
        cuisine: 'thai',
        course: 'main',
        dietTags: ['vegan'],
        flavorTags: ['spicy'],
        mainIngredients: ['tofu'],
        techniques: ['stir-fry'],
        ingredients: ['tofu', 'noodles'],
        instructions: ['cook']
      }
    ])
    expect(dto).toMatchObject({
      name: 'Pad Thai',
      description: 'noodles',
      prepMinutes: 10,
      cookMinutes: 15,
      servings: 4,
      cuisine: 'thai',
      course: 'main',
      dietTags: ['vegan'],
      flavorTags: ['spicy'],
      mainIngredients: ['tofu'],
      techniques: ['stir-fry'],
      ingredients: ['tofu', 'noodles'],
      instructions: ['cook'],
      saved: false
    })
    expect(dto.id).toBeTruthy()
    expect(dto.slug).toMatch(/^pad-thai/)
  })

  it('defaults every Facet and list for a partial mid-stream recipe', () => {
    const [dto] = toRecipeDTOs([{ name: 'Half Dish' }])
    expect(dto).toMatchObject({
      description: '',
      ingredients: [],
      instructions: [],
      prepMinutes: null,
      cookMinutes: null,
      servings: null,
      cuisine: null,
      course: null,
      dietTags: [],
      flavorTags: [],
      mainIngredients: [],
      techniques: []
    })
  })

  it('mints a fallback slug from a cuid when the recipe has no name', () => {
    const [dto] = toRecipeDTOs([{ description: 'nameless' }])
    expect(dto.name).toBe('')
    expect(dto.slug).toBeTruthy()
    expect(dto.id).toBeTruthy()
  })

  it('preserves a prior card id when the name matches (card id wins)', () => {
    const [dto] = toRecipeDTOs(
      [{ name: 'Curry', description: 'now expanded' }],
      {
        kind: 'preserve',
        prior: [priorCard({ name: 'Curry', id: 'card-id' })]
      }
    )
    expect(dto.id).toBe('card-id')
  })

  it('mints a fresh id when no prior card name matches', () => {
    const [dto] = toRecipeDTOs([{ name: 'Brand New', description: 'x' }], {
      kind: 'preserve',
      prior: [priorCard({ name: 'Curry', id: 'card-id' })]
    })
    expect(dto.id).not.toBe('card-id')
    expect(dto.id).toBeTruthy()
  })

  it('emits empty id and slug for a placeholder stream render', () => {
    const [dto] = toRecipeDTOs([{ name: 'Streaming' }], { kind: 'placeholder' })
    expect(dto.id).toBe('')
    expect(dto.slug).toBe('')
    expect(dto.name).toBe('Streaming')
  })
})

describe('transformStoredMessages', () => {
  const stored: MessageWithRecipesDTO = {
    id: 'm1',
    content: 'here',
    role: 'assistant',
    chatId: 'c1',
    createdAt: new Date(),
    updatedAt: new Date(),
    recipes: [
      {
        recipe: {
          id: 'r1',
          name: 'Stored Curry',
          description: 'saved',
          slug: 'stored-curry',
          prepMinutes: 5,
          cookMinutes: 20,
          servings: 2,
          cuisine: 'indian',
          course: 'main',
          dietTags: ['veg', null],
          flavorTags: null,
          mainIngredients: null,
          techniques: null,
          saved: true,
          ingredients: [{ rawString: '1 cup rice' }],
          instructions: [{ description: 'boil' }]
        }
      }
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any

  it('maps a stored Message into client Recipe state with defaulted Facets', () => {
    const [message] = transformStoredMessages([stored])
    expect(message.id).toBe('m1')
    const [recipe] = message.recipes
    expect(recipe).toMatchObject({
      id: 'r1',
      name: 'Stored Curry',
      slug: 'stored-curry',
      cuisine: 'indian',
      course: 'main',
      dietTags: ['veg', ''],
      flavorTags: [],
      mainIngredients: [],
      techniques: [],
      ingredients: ['1 cup rice'],
      instructions: ['boil'],
      saved: true
    })
  })
})
