/**
 * @jest-environment node
 */
import {
  generated,
  getChats,
  getResumableChat,
  upsertChat
} from '~/server/api/use-cases/chats-use-case'
import type {
  ChatContext,
  Generated,
  MessagesWithRecipes
} from '~/schemas/chats-schema'
import { embedSignature } from '~/lib/embeddings'
import {
  testPrisma,
  truncateAll,
  createTestUser,
  createTestRecipe
} from '~/server/api/test-db'

// Only the OpenAI embedding call is mocked; the rest runs against the test DB.
jest.mock('~/lib/embeddings', () => ({
  ...jest.requireActual('~/lib/embeddings'),
  embedSignature: jest.fn()
}))

const mockedEmbed = embedSignature as jest.MockedFunction<typeof embedSignature>

beforeEach(async () => {
  mockedEmbed.mockReset()
  mockedEmbed.mockResolvedValue(new Array(1536).fill(0))
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

let msgCounter = 0
/** A minimal user+assistant exchange (no recipes) for persistence assertions. */
function makeMessages(): MessagesWithRecipes {
  const now = new Date()
  const n = msgCounter++
  return [
    {
      id: `user-${n}`,
      content: `question ${n}`,
      role: 'user',
      createdAt: now,
      updatedAt: now,
      recipes: []
    },
    {
      id: `assistant-${n}`,
      content: `answer ${n}`,
      role: 'assistant',
      createdAt: now,
      updatedAt: now,
      recipes: []
    }
  ]
}

/** Backdate a chat's `updatedAt` past the 2-hour freshness window. */
async function ageChat(chatId: string) {
  await testPrisma.$executeRawUnsafe(
    `UPDATE "Chat" SET "updatedAt" = NOW() - INTERVAL '3 hours' WHERE id = $1`,
    chatId
  )
}

const listContext: ChatContext = { page: 'list' }
const pantryContext: ChatContext = { page: 'pantry' }

function recipeDetailContext(recipe: {
  id: string
  name: string
  slug: string
}): ChatContext {
  return {
    page: 'recipe-detail',
    recipe: {
      id: recipe.id,
      name: recipe.name,
      slug: recipe.slug,
      description: null,
      ingredients: [],
      cuisine: null,
      course: null
    }
  }
}

describe('upsertChat() context scoping', () => {
  it('persists the given context (page + recipeId) on chat creation', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id)

    const res = await upsertChat(
      undefined,
      makeMessages(),
      testPrisma,
      user.id,
      recipeDetailContext(recipe)
    )

    expect(res.chatId).toBeDefined()
    const row = await testPrisma.chat.findUnique({
      where: { id: res.chatId }
    })
    expect(row).toMatchObject({ page: 'recipe-detail', recipeId: recipe.id })
  })

  it('appends in place when the target chat is fresh (returns no new chatId)', async () => {
    const user = await createTestUser()
    const created = await upsertChat(
      undefined,
      makeMessages(),
      testPrisma,
      user.id,
      listContext
    )

    const res = await upsertChat(
      created.chatId,
      makeMessages(),
      testPrisma,
      user.id,
      listContext
    )

    expect('chatId' in res).toBe(false)
    const messages = await testPrisma.message.count({
      where: { chatId: created.chatId }
    })
    expect(messages).toBe(4)
  })

  it('starts a new chat scoped to the same context when the target is stale', async () => {
    const user = await createTestUser()
    const created = await upsertChat(
      undefined,
      makeMessages(),
      testPrisma,
      user.id,
      listContext
    )
    await ageChat(created.chatId!)

    const res = await upsertChat(
      created.chatId,
      makeMessages(),
      testPrisma,
      user.id,
      listContext
    )

    expect(res.chatId).toBeDefined()
    expect(res.chatId).not.toBe(created.chatId)
    const newChat = await testPrisma.chat.findUnique({
      where: { id: res.chatId }
    })
    expect(newChat).toMatchObject({ page: 'list', recipeId: null })
    // Original chat untouched — its messages weren't appended to.
    const oldCount = await testPrisma.message.count({
      where: { chatId: created.chatId }
    })
    expect(oldCount).toBe(2)
  })
})

describe('getResumableChat()', () => {
  it('returns the most recent chat for a context within the freshness window', async () => {
    const user = await createTestUser()
    const created = await upsertChat(
      undefined,
      makeMessages(),
      testPrisma,
      user.id,
      listContext
    )

    const resumable = await getResumableChat(user.id, testPrisma, listContext)
    expect(resumable?.id).toBe(created.chatId)
  })

  it('returns null when the most recent chat is stale', async () => {
    const user = await createTestUser()
    const created = await upsertChat(
      undefined,
      makeMessages(),
      testPrisma,
      user.id,
      listContext
    )
    await ageChat(created.chatId!)

    const resumable = await getResumableChat(user.id, testPrisma, listContext)
    expect(resumable).toBeNull()
  })

  it('returns null when no chat exists for the context', async () => {
    const user = await createTestUser()
    await upsertChat(
      undefined,
      makeMessages(),
      testPrisma,
      user.id,
      listContext
    )

    const resumable = await getResumableChat(user.id, testPrisma, pantryContext)
    expect(resumable).toBeNull()
  })
})

describe('getChats() context filtering', () => {
  it('returns only the requested context and is unaffected by staleness', async () => {
    const user = await createTestUser()
    const listChat = await upsertChat(
      undefined,
      makeMessages(),
      testPrisma,
      user.id,
      listContext
    )
    await upsertChat(
      undefined,
      makeMessages(),
      testPrisma,
      user.id,
      pantryContext
    )
    // Age the list chat — browse-history still shows it.
    await ageChat(listChat.chatId!)

    const listChats = await getChats(user.id, testPrisma, listContext)
    expect(listChats).toHaveLength(1)
    expect(listChats[0].id).toBe(listChat.chatId)

    const pantryChats = await getChats(user.id, testPrisma, pantryContext)
    expect(pantryChats).toHaveLength(1)
    expect(pantryChats[0].page).toBe('pantry')
  })
})

let genCounter = 0
function makeGenerated(chatId: string, context?: ChatContext): Generated {
  const n = genCounter++
  return {
    prompt: {
      content: `make me dish ${n}`,
      role: 'user',
      id: `gen-prompt-${n}`,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    generated: {
      content: 'here you go',
      id: `gen-recipe-${n}`,
      name: `Dish ${n}`,
      ingredients: ['1 lb chicken'],
      instructions: ['Cook it'],
      prepMinutes: 10,
      cookMinutes: 20,
      servings: 4,
      cuisine: 'thai',
      course: 'dinner',
      dietTags: [],
      flavorTags: [],
      mainIngredients: ['chicken'],
      techniques: ['stir-fry'],
      messageId: `gen-msg-${n}`,
      chatId
    },
    ...(context ? { context } : {})
  }
}

describe('generated() context scoping', () => {
  it('persists the context on chat creation and returns the effective chatId', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id)
    const chatId = 'gen-chat-new'

    const res = await generated(
      testPrisma,
      makeGenerated(chatId, recipeDetailContext(recipe)),
      user.id
    )

    expect(res.chatId).toBe(chatId)
    const row = await testPrisma.chat.findUnique({ where: { id: chatId } })
    expect(row).toMatchObject({ page: 'recipe-detail', recipeId: recipe.id })
  })

  it('swaps to a new chat (new effective chatId) when the target is stale', async () => {
    const user = await createTestUser()
    // Seed a fresh chat, then age it.
    const seeded = await upsertChat(
      undefined,
      makeMessages(),
      testPrisma,
      user.id,
      listContext
    )
    await ageChat(seeded.chatId!)

    const res = await generated(
      testPrisma,
      makeGenerated(seeded.chatId!, listContext),
      user.id
    )

    expect(res.chatId).toBeDefined()
    expect(res.chatId).not.toBe(seeded.chatId)
    const newChat = await testPrisma.chat.findUnique({
      where: { id: res.chatId }
    })
    expect(newChat).toMatchObject({ page: 'list', recipeId: null })
  })
})

describe('recipe deletion cascade', () => {
  it('deletes a recipe-detail chat when its recipe is deleted', async () => {
    const user = await createTestUser()
    const recipe = await createTestRecipe(user.id)
    const created = await upsertChat(
      undefined,
      makeMessages(),
      testPrisma,
      user.id,
      recipeDetailContext(recipe)
    )

    await testPrisma.recipe.delete({ where: { id: recipe.id } })

    const chat = await testPrisma.chat.findUnique({
      where: { id: created.chatId }
    })
    expect(chat).toBeNull()
    const messages = await testPrisma.message.count({
      where: { chatId: created.chatId }
    })
    expect(messages).toBe(0)
  })
})

describe('generated()', () => {
  it('persists facets + servings threaded through the Generate payload', async () => {
    const user = await createTestUser()

    const data: Generated = {
      prompt: {
        content: 'make me thai basil chicken',
        role: 'user',
        id: 'prompt-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      generated: {
        content: 'here you go',
        id: 'gen-recipe-1',
        name: 'Thai Basil Chicken',
        ingredients: ['1 lb chicken'],
        instructions: ['Stir-fry the chicken'],
        prepMinutes: 10,
        cookMinutes: 20,
        servings: 4,
        cuisine: 'thai',
        course: 'dinner',
        dietTags: ['gluten-free'],
        flavorTags: ['spicy'],
        mainIngredients: ['chicken'],
        techniques: ['stir-fry'],
        messageId: 'msg-1',
        chatId: 'chat-1'
      }
    }

    await generated(testPrisma, data, user.id)

    const row = await testPrisma.recipe.findUnique({
      where: { id: 'gen-recipe-1' }
    })

    expect(row).toMatchObject({
      servings: 4,
      cuisine: 'thai',
      course: 'dinner',
      dietTags: ['gluten-free'],
      flavorTags: ['spicy'],
      mainIngredients: ['chicken'],
      techniques: ['stir-fry']
    })
  })
})
