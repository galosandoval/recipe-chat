/**
 * @jest-environment node
 */
import { bulkAddToPantry } from '~/server/api/use-cases/pantry-use-case'
import { testPrisma, truncateAll, createTestUser } from '~/server/api/test-db'

beforeEach(async () => {
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('bulkAddToPantry', () => {
  it('merges a new item into an existing pantry item across compatible units (tbsp into cup)', async () => {
    const user = await createTestUser()

    await bulkAddToPantry(user.id, ['1 cup honey'], testPrisma)
    const results = await bulkAddToPantry(user.id, ['1 tbsp honey'], testPrisma)

    const pantry = await testPrisma.pantry.findUnique({
      where: { userId: user.id },
      include: { ingredients: true }
    })
    expect(pantry?.ingredients).toHaveLength(1)
    expect(results).toHaveLength(1)
    expect(results[0]?.unit).toBe('cup')
    expect(results[0]?.quantity).toBeCloseTo(1.06, 2)
  })

  it('merges compatible weight units (grams into an existing kg item)', async () => {
    const user = await createTestUser()

    await bulkAddToPantry(user.id, ['1 kg sugar'], testPrisma)
    const results = await bulkAddToPantry(user.id, ['500 g sugar'], testPrisma)

    const pantry = await testPrisma.pantry.findUnique({
      where: { userId: user.id },
      include: { ingredients: true }
    })
    expect(pantry?.ingredients).toHaveLength(1)
    expect(results[0]?.unit).toBe('kg')
    expect(results[0]?.quantity).toBeCloseTo(1.5, 3)
  })

  it('does not merge count units with different unit strings', async () => {
    const user = await createTestUser()

    await bulkAddToPantry(user.id, ['2 eggs'], testPrisma)
    await bulkAddToPantry(user.id, ['1 dozen eggs'], testPrisma)

    const pantry = await testPrisma.pantry.findUnique({
      where: { userId: user.id },
      include: { ingredients: true }
    })
    expect(pantry?.ingredients).toHaveLength(2)
  })
})
