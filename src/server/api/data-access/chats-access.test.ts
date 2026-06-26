/**
 * @jest-environment node
 */
import { ChatsAccess } from '~/server/api/data-access/chats-access'
import type { MessagesWithRecipes } from '~/schemas/chats-schema'
import {
  testPrisma,
  truncateAll,
  createTestUser
} from '~/server/api/test-db'

const access = new ChatsAccess(testPrisma)

const FACETS = {
  cuisine: 'thai',
  course: 'dinner',
  dietTags: ['gluten-free'],
  flavorTags: ['spicy'],
  mainIngredients: ['chicken'],
  techniques: ['stir-fry']
}

function recipeWithFacets(): MessagesWithRecipes[number]['recipes'][number] {
  return {
    id: 'recipe-facets-1',
    slug: 'thai-basil-chicken',
    name: 'Thai Basil Chicken',
    description: 'A quick weeknight stir-fry',
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 4,
    ...FACETS,
    ingredients: ['1 lb chicken'],
    instructions: ['Stir-fry the chicken']
  }
}

function messageWith(
  id: string,
  recipes: MessagesWithRecipes[number]['recipes']
): MessagesWithRecipes[number] {
  return {
    id,
    content: 'here is a recipe',
    role: 'assistant',
    createdAt: new Date(),
    updatedAt: new Date(),
    recipes
  }
}

beforeEach(async () => {
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('createRecipesForMessage facet persistence', () => {
  it('persists all 6 facet fields on the CREATE branch', async () => {
    const user = await createTestUser()

    await access.createChatWithMessages({
      userId: user.id,
      messages: [messageWith('msg-1', [recipeWithFacets()])]
    })

    const row = await testPrisma.recipe.findUnique({
      where: { id: 'recipe-facets-1' }
    })

    expect(row).not.toBeNull()
    expect(row).toMatchObject(FACETS)
    expect(row?.servings).toBe(4)
  })

  it('skips a message whose id already exists rather than throwing or duplicating recipe joins', async () => {
    const user = await createTestUser()

    const chat = await access.createChatWithMessages({
      userId: user.id,
      messages: [messageWith('msg-1', [recipeWithFacets()])]
    })

    // Re-save msg-1 (already persisted) alongside a genuinely new message.
    await expect(
      access.addMessages(
        chat.id,
        [
          messageWith('msg-1', [recipeWithFacets()]),
          messageWith('msg-2', [])
        ],
        user.id
      )
    ).resolves.not.toThrow()

    const messages = await testPrisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { id: 'asc' }
    })
    expect(messages.map((m) => m.id)).toEqual(['msg-1', 'msg-2'])

    // The re-saved message must not have gained a second recipe-join row.
    const joins = await testPrisma.recipesOnMessages.findMany({
      where: { messageId: 'msg-1' }
    })
    expect(joins).toHaveLength(1)
  })

  it('does not wipe facets when the same recipe is re-saved (UPDATE branch)', async () => {
    const user = await createTestUser()

    // First save → CREATE branch
    const chat = await access.createChatWithMessages({
      userId: user.id,
      messages: [messageWith('msg-1', [recipeWithFacets()])]
    })

    // Re-save the same recipe id → UPDATE branch
    await access.addMessages(
      chat.id,
      [messageWith('msg-2', [recipeWithFacets()])],
      user.id
    )

    const row = await testPrisma.recipe.findUnique({
      where: { id: 'recipe-facets-1' }
    })

    expect(row).toMatchObject(FACETS)
    expect(row?.servings).toBe(4)
  })
})
