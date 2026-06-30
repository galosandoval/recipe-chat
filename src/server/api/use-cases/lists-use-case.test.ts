/**
 * @jest-environment node
 */
import { updateIngredientQuantities } from '~/server/api/use-cases/lists-use-case'
import { testPrisma, truncateAll, createTestUser } from '~/server/api/test-db'

beforeEach(async () => {
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

async function createListIngredient(
  listId: string,
  data: { quantity: number; unit: string; itemName: string }
) {
  return testPrisma.ingredient.create({
    data: {
      listId,
      rawString: `${data.quantity} ${data.unit} ${data.itemName}`,
      quantity: data.quantity,
      unit: data.unit,
      itemName: data.itemName
    }
  })
}

describe('updateIngredientQuantities', () => {
  it('updates the quantity of each provided ingredient', async () => {
    const user = await createTestUser()
    const list = await testPrisma.list.create({ data: { userId: user.id } })
    const a = await createListIngredient(list.id, {
      quantity: 1,
      unit: 'cup',
      itemName: 'flour'
    })
    const b = await createListIngredient(list.id, {
      quantity: 2,
      unit: 'cup',
      itemName: 'flour'
    })

    await updateIngredientQuantities(
      [
        { id: a.id, quantity: 3 },
        { id: b.id, quantity: 6 }
      ],
      testPrisma
    )

    const updatedA = await testPrisma.ingredient.findUnique({
      where: { id: a.id }
    })
    const updatedB = await testPrisma.ingredient.findUnique({
      where: { id: b.id }
    })
    expect(updatedA?.quantity).toBe(3)
    expect(updatedB?.quantity).toBe(6)
  })
})
