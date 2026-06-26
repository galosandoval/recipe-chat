/**
 * @jest-environment node
 */
import { generated } from '~/server/api/use-cases/chats-use-case'
import type { Generated } from '~/schemas/chats-schema'
import { embedSignature } from '~/lib/embeddings'
import { testPrisma, truncateAll, createTestUser } from '~/server/api/test-db'

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
