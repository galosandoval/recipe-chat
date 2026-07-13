import { useFabStackStore, type FabRegistration } from './fab-stack-store'

function fab(
  overrides: Partial<FabRegistration> & { id: string }
): FabRegistration {
  return {
    priority: 0,
    ariaLabel: overrides.id,
    icon: null,
    onClick: () => {},
    ...overrides
  }
}

const ids = () => useFabStackStore.getState().fabs.map((f) => f.id)

beforeEach(() => {
  useFabStackStore.setState({ fabs: [] })
})

describe('useFabStackStore', () => {
  it('registers a FAB', () => {
    useFabStackStore.getState().register(fab({ id: 'edit', priority: 1 }))
    expect(ids()).toEqual(['edit'])
  })

  it('sorts by priority ascending (lower is closer to the thumb)', () => {
    const { register } = useFabStackStore.getState()
    register(fab({ id: 'edit', priority: 2 }))
    register(fab({ id: 'chat', priority: 1 }))
    expect(ids()).toEqual(['chat', 'edit'])
  })

  it('breaks priority ties by registration order', () => {
    const { register } = useFabStackStore.getState()
    register(fab({ id: 'first', priority: 1 }))
    register(fab({ id: 'second', priority: 1 }))
    register(fab({ id: 'third', priority: 1 }))
    expect(ids()).toEqual(['first', 'second', 'third'])
  })

  it('keeps ties in registration order even when a lower-priority FAB is added between them', () => {
    const { register } = useFabStackStore.getState()
    register(fab({ id: 'a', priority: 2 }))
    register(fab({ id: 'thumb', priority: 1 }))
    register(fab({ id: 'b', priority: 2 }))
    expect(ids()).toEqual(['thumb', 'a', 'b'])
  })

  it('unregisters a FAB and closes the gap', () => {
    const { register, unregister } = useFabStackStore.getState()
    register(fab({ id: 'edit', priority: 2 }))
    register(fab({ id: 'chat', priority: 1 }))
    unregister('edit')
    expect(ids()).toEqual(['chat'])
  })

  it('is a no-op when unregistering an unknown id', () => {
    useFabStackStore.getState().register(fab({ id: 'edit', priority: 1 }))
    useFabStackStore.getState().unregister('nope')
    expect(ids()).toEqual(['edit'])
  })

  it('replaces a re-registered id in place without duplicating it', () => {
    const { register } = useFabStackStore.getState()
    register(fab({ id: 'edit', priority: 1, ariaLabel: 'Edit' }))
    register(fab({ id: 'edit', priority: 1, ariaLabel: 'Edit recipe' }))
    expect(ids()).toEqual(['edit'])
    expect(useFabStackStore.getState().fabs[0].ariaLabel).toBe('Edit recipe')
  })

  it('re-sorts when a re-registration changes a FAB priority', () => {
    const { register } = useFabStackStore.getState()
    register(fab({ id: 'edit', priority: 1 }))
    register(fab({ id: 'chat', priority: 2 }))
    expect(ids()).toEqual(['edit', 'chat'])
    // Edit moves below chat by taking a higher priority number.
    register(fab({ id: 'edit', priority: 3 }))
    expect(ids()).toEqual(['chat', 'edit'])
  })
})
