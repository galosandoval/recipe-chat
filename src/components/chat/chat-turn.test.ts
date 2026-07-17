import {
  buildUpsertMessages,
  didMutateRecipe,
  findExpandedRecipeId,
  isFailedExpand,
  priorRecipes,
  reconcileAssistantMessage,
  rollbackExpand,
  turnHasContentToPersist
} from './chat-turn'
import type { MessageWithRecipes, RecipeDTO } from '~/schemas/chats-schema'

function recipe(partial: Partial<RecipeDTO> & { name: string }): RecipeDTO {
  return {
    id: partial.id ?? 'r-' + partial.name,
    name: partial.name,
    slug: partial.slug ?? partial.name.toLowerCase(),
    description: partial.description ?? 'desc',
    ingredients: partial.ingredients ?? [],
    instructions: partial.instructions ?? [],
    prepMinutes: partial.prepMinutes ?? null,
    cookMinutes: partial.cookMinutes ?? null,
    servings: partial.servings ?? null,
    cuisine: partial.cuisine ?? null,
    course: partial.course ?? null,
    dietTags: partial.dietTags ?? [],
    flavorTags: partial.flavorTags ?? [],
    mainIngredients: partial.mainIngredients ?? [],
    techniques: partial.techniques ?? [],
    saved: partial.saved ?? false
  }
}

function message(
  partial: Partial<MessageWithRecipes> & { role: MessageWithRecipes['role'] }
): MessageWithRecipes {
  return {
    id: partial.id ?? 'm-' + partial.role,
    content: partial.content ?? '',
    role: partial.role,
    chatId: partial.chatId ?? 'chat-1',
    createdAt: partial.createdAt ?? new Date(),
    updatedAt: partial.updatedAt ?? new Date(),
    recipes: partial.recipes ?? [],
    toolInvocations: partial.toolInvocations
  }
}

describe('priorRecipes', () => {
  it('excludes the trailing assistant placeholder so card ids win', () => {
    const messages = [
      message({ role: 'user', content: 'ideas' }),
      message({
        role: 'assistant',
        recipes: [recipe({ name: 'Curry', id: 'card-id' })]
      }),
      message({ role: 'user', content: 'expand curry' }),
      message({
        role: 'assistant',
        recipes: [recipe({ name: 'Curry', id: 'streamed-id' })]
      })
    ]

    expect(priorRecipes(messages).map((r) => r.id)).toEqual(['card-id'])
  })
})

describe('reconcileAssistantMessage', () => {
  it('updates the trailing assistant placeholder in place keeping its id', () => {
    const placeholder = message({
      role: 'assistant',
      id: 'assistant-1',
      content: ''
    })
    const messages = [message({ role: 'user', content: 'hi' }), placeholder]

    const next = reconcileAssistantMessage(messages, {
      content: 'here are options',
      recipes: [{ name: 'Tacos', description: 'quick' }],
      chatId: 'chat-1'
    })

    expect(next).toHaveLength(2)
    expect(next[1].id).toBe('assistant-1')
    expect(next[1].content).toBe('here are options')
    expect(next[1].recipes.map((r) => r.name)).toEqual(['Tacos'])
  })

  it('appends a new assistant message when none is trailing', () => {
    const messages = [message({ role: 'user', content: 'hi' })]

    const next = reconcileAssistantMessage(messages, {
      content: 'reply',
      recipes: [],
      chatId: 'chat-1'
    })

    expect(next).toHaveLength(2)
    expect(next[1].role).toBe('assistant')
    expect(next[1].content).toBe('reply')
  })

  it('keeps the expanded recipe on the tapped card id', () => {
    const messages = [
      message({ role: 'user', content: 'ideas' }),
      message({
        role: 'assistant',
        recipes: [recipe({ name: 'Curry', id: 'card-id' })]
      }),
      message({ role: 'user', content: 'expand' }),
      message({ role: 'assistant', id: 'placeholder', content: '' })
    ]

    const next = reconcileAssistantMessage(messages, {
      content: 'expanded',
      recipes: [
        {
          name: 'Curry',
          description: 'desc',
          ingredients: ['a'],
          instructions: ['b'],
          servings: 4
        }
      ],
      chatId: 'chat-1'
    })

    expect(next.at(-1)?.recipes[0].id).toBe('card-id')
  })
})

describe('isFailedExpand / rollbackExpand', () => {
  it('flags an expand turn that produced no recipe', () => {
    expect(isFailedExpand([{ toolName: 'expandRecipe' }], [])).toBe(true)
    expect(
      isFailedExpand([{ toolName: 'expandRecipe' }], [{ name: 'x' }])
    ).toBe(false)
    expect(isFailedExpand([{ toolName: 'generateRecipeOptions' }], [])).toBe(
      false
    )
  })

  it('reverts the trailing user prompt and assistant placeholder', () => {
    const messages = [
      message({ role: 'assistant', id: 'options' }),
      message({ role: 'user', content: 'expand' }),
      message({ role: 'assistant', id: 'placeholder' })
    ]
    const rolled = rollbackExpand(messages)
    expect(rolled.map((m) => m.id)).toEqual(['options'])
  })
})

describe('findExpandedRecipeId', () => {
  it('returns the id of a prior suggestion matching the reconciled name', () => {
    const messages = [
      message({
        role: 'assistant',
        recipes: [recipe({ name: 'Curry', id: 'card-id' })]
      }),
      message({ role: 'user', content: 'expand' }),
      message({ role: 'assistant', id: 'placeholder' })
    ]
    expect(findExpandedRecipeId(messages, 'Curry')).toBe('card-id')
    expect(findExpandedRecipeId(messages, 'Nope')).toBeUndefined()
  })
})

describe('didMutateRecipe', () => {
  it('is true only for a successful editRecipe/addNote', () => {
    expect(
      didMutateRecipe([{ toolName: 'editRecipe', result: { success: true } }])
    ).toBe(true)
    expect(
      didMutateRecipe([{ toolName: 'editRecipe', result: { success: false } }])
    ).toBe(false)
    expect(
      didMutateRecipe([{ toolName: 'generateRecipeOptions', result: {} }])
    ).toBe(false)
  })
})

describe('buildUpsertMessages / turnHasContentToPersist', () => {
  it('drops recipes without a name or description', () => {
    const messages = [
      message({ role: 'user', content: 'hi', id: 'u1' }),
      message({
        role: 'assistant',
        id: 'a1',
        content: 'reply',
        recipes: [
          recipe({ name: 'Keep', description: 'good' }),
          recipe({ name: '   ', description: 'blank name' }),
          recipe({ name: 'NoDesc', description: '' })
        ]
      })
    ]
    const built = buildUpsertMessages(messages)
    expect(built[1].recipes.map((r) => r.name)).toEqual(['Keep'])
    expect(turnHasContentToPersist(built)).toBe(true)
  })

  it('reports nothing to persist when the assistant reply is empty', () => {
    const messages = [
      message({ role: 'user', content: 'hi', id: 'u1' }),
      message({ role: 'assistant', id: 'a1', content: '', recipes: [] })
    ]
    expect(turnHasContentToPersist(buildUpsertMessages(messages))).toBe(false)
  })
})
