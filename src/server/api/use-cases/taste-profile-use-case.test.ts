/**
 * @jest-environment node
 */
import { upsertTasteProfile } from '~/server/api/use-cases/taste-profile-use-case'
import { testPrisma, truncateAll, createTestUser } from '~/server/api/test-db'
import { tasteProfileDefaults } from '~/schemas/taste-profile-schema'

beforeEach(async () => {
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('upsertTasteProfile', () => {
  it('persists the taste profile', async () => {
    const user = await createTestUser()

    const profile = await upsertTasteProfile(
      user.id,
      { ...tasteProfileDefaults, dietaryRestrictions: ['vegan'] },
      testPrisma
    )

    expect(profile.dietaryRestrictions).toEqual(['vegan'])
  })

  it('does not create or modify any filters when saving dietary restrictions', async () => {
    const user = await createTestUser()

    await upsertTasteProfile(
      user.id,
      {
        ...tasteProfileDefaults,
        // includes a preset restriction and a custom free-text one
        dietaryRestrictions: ['vegan', 'Pescatarian']
      },
      testPrisma
    )

    const filters = await testPrisma.filter.findMany({
      where: { userId: user.id }
    })
    expect(filters).toEqual([])
  })

  it('leaves a pre-existing checked filter untouched when saving a profile', async () => {
    const user = await createTestUser()
    // A filter the user manages themselves; its name happens to match a
    // dietary restriction the old sync would have unchecked.
    const filter = await testPrisma.filter.create({
      data: { name: 'vegan', checked: true, userId: user.id }
    })

    await upsertTasteProfile(
      user.id,
      { ...tasteProfileDefaults, dietaryRestrictions: [] },
      testPrisma
    )

    const filters = await testPrisma.filter.findMany({
      where: { userId: user.id }
    })
    expect(filters).toEqual([filter])
  })
})
