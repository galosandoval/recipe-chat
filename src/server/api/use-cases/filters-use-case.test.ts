/**
 * @jest-environment node
 */
import { randomUUID } from 'crypto'
import { saveFilters } from '~/server/api/use-cases/filters-use-case'
import { testPrisma, truncateAll, createTestUser } from '~/server/api/test-db'
import type { Filter } from '@prisma/client'

/** A cuid-length id (idSchema requires >= 24 chars). */
function filterId() {
  return `filter-${randomUUID()}`
}

function createFilter(
  userId: string,
  overrides: Partial<Pick<Filter, 'id' | 'name' | 'checked'>> = {}
) {
  return testPrisma.filter.create({
    data: {
      id: overrides.id ?? filterId(),
      name: overrides.name ?? 'a filter',
      checked: overrides.checked ?? true,
      userId
    }
  })
}

function byName(filters: Filter[]) {
  return [...filters].sort((a, b) => a.name.localeCompare(b.name))
}

beforeEach(async () => {
  await truncateAll()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('saveFilters', () => {
  it('creates filters in the payload but not in the DB (checked: true)', async () => {
    const user = await createTestUser()
    const newId = filterId()

    const result = await saveFilters(
      { userId: user.id, filters: [{ id: newId, name: 'vegan' }] },
      testPrisma
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: newId, name: 'vegan', checked: true })
  })

  it('deletes filters in the DB but absent from the payload', async () => {
    const user = await createTestUser()
    const keep = await createFilter(user.id, { name: 'keep' })
    await createFilter(user.id, { name: 'drop' })

    const result = await saveFilters(
      { userId: user.id, filters: [{ id: keep.id, name: keep.name }] },
      testPrisma
    )

    expect(result.map((f) => f.name)).toEqual(['keep'])
  })

  it('updates the name of a filter whose id persists but name changed', async () => {
    const user = await createTestUser()
    const filter = await createFilter(user.id, { name: 'vegitarian' })

    const result = await saveFilters(
      { userId: user.id, filters: [{ id: filter.id, name: 'vegetarian' }] },
      testPrisma
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: filter.id, name: 'vegetarian' })
  })

  it('applies add, remove, and rename in one call', async () => {
    const user = await createTestUser()
    const rename = await createFilter(user.id, { name: 'old name' })
    await createFilter(user.id, { name: 'remove me' })
    const newId = filterId()

    const result = await saveFilters(
      {
        userId: user.id,
        filters: [
          { id: rename.id, name: 'new name' },
          { id: newId, name: 'brand new' }
        ]
      },
      testPrisma
    )

    expect(byName(result).map((f) => f.name)).toEqual(['brand new', 'new name'])
  })

  it('is a no-op when the payload equals the persisted set', async () => {
    const user = await createTestUser()
    const a = await createFilter(user.id, { name: 'alpha', checked: false })
    const b = await createFilter(user.id, { name: 'beta', checked: true })

    const result = await saveFilters(
      {
        userId: user.id,
        filters: [
          { id: a.id, name: a.name },
          { id: b.id, name: b.name }
        ]
      },
      testPrisma
    )

    expect(byName(result)).toMatchObject([
      { id: a.id, name: 'alpha', checked: false },
      { id: b.id, name: 'beta', checked: true }
    ])
  })

  it('preserves checked on persisting rows, including renamed ones', async () => {
    const user = await createTestUser()
    const renamed = await createFilter(user.id, {
      name: 'unchecked old',
      checked: false
    })

    const result = await saveFilters(
      { userId: user.id, filters: [{ id: renamed.id, name: 'unchecked new' }] },
      testPrisma
    )

    expect(result[0]).toMatchObject({ name: 'unchecked new', checked: false })
  })

  it('only affects the calling user’s filters', async () => {
    const user = await createTestUser()
    const other = await createTestUser()
    const otherFilter = await createFilter(other.id, { name: 'other filter' })

    await saveFilters(
      { userId: user.id, filters: [{ id: filterId(), name: 'mine' }] },
      testPrisma
    )

    const otherFilters = await testPrisma.filter.findMany({
      where: { userId: other.id }
    })
    expect(otherFilters).toHaveLength(1)
    expect(otherFilters[0]).toMatchObject({
      id: otherFilter.id,
      name: 'other filter'
    })
  })
})
