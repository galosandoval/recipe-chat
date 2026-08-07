// Guards the ubiquitous language (CONTEXT.md) at the only place users read it:
// the translation catalogs. "Grocery List" is canonical — "Shopping List" and a
// bare "List" for the same concept are the divergence this locks out. Lives in
// src/ rather than beside the catalogs because everything under public/ is
// served verbatim in production.
import en from '../../public/translations/en.json'
import es from '../../public/translations/es.json'

type Catalog = { [key: string]: string | Catalog }

/** Flattens a nested catalog to `[dotted.key.path, value]` pairs for its leaves. */
function flattenCatalog(catalog: Catalog, path = ''): [string, string][] {
  return Object.entries(catalog).flatMap(([key, value]) => {
    const keyPath = path ? `${path}.${key}` : key
    return typeof value === 'string'
      ? [[keyPath, value] as [string, string]]
      : flattenCatalog(value, keyPath)
  })
}

const enEntries = flattenCatalog(en as Catalog)
const esEntries = flattenCatalog(es as Catalog)

describe('translation vocabulary', () => {
  it('never says "shopping list" in English', () => {
    const offenders = enEntries.filter(([, value]) =>
      /shopping\s+list/i.test(value)
    )

    expect(offenders).toEqual([])
  })

  it('capitalizes the concept as "Grocery List" everywhere it appears', () => {
    const offenders = enEntries.filter(
      ([, value]) =>
        /grocery\s+list/i.test(value) && !/Grocery List/.test(value)
    )

    expect(offenders).toEqual([])
  })

  it('capitalizes the Spanish rendering as "Lista de Compras"', () => {
    const offenders = esEntries.filter(
      ([, value]) =>
        /lista\s+de\s+compras/i.test(value) && !/Lista de Compras/.test(value)
    )

    expect(offenders).toEqual([])
  })

  it('labels the nav with Grocery List and Collections', () => {
    expect(en.nav.list).toBe('Grocery List')
    expect(en.nav.lists).toBe('Collections')
    expect(es.nav.list).toBe('Lista de Compras')
    expect(es.nav.lists).toBe('Colecciones')
  })

  // The surfaces the vocabulary ticket (#584) called out by name, so a future
  // edit can't quietly drop the term from one of them.
  it.each([
    ['list.noItems', en.list.noItems, es.list.noItems],
    ['list.addToList', en.list.addToList, es.list.addToList],
    ['list.addIngredient', en.list.addIngredient, es.list.addIngredient],
    [
      'valueProps.welcome.list.title',
      en.valueProps.welcome.list.title,
      es.valueProps.welcome.list.title
    ],
    [
      'valueProps.welcome.list.description',
      en.valueProps.welcome.list.description,
      es.valueProps.welcome.list.description
    ],
    ['chat.chatFormList', en.chat.chatFormList, es.chat.chatFormList],
    [
      'recipes.byId.goToList',
      en.recipes.byId.goToList,
      es.recipes.byId.goToList
    ],
    [
      'recipes.byId.addToList',
      en.recipes.byId.addToList,
      es.recipes.byId.addToList
    ],
    [
      'subscription.starterFeatures',
      en.subscription.starterFeatures,
      es.subscription.starterFeatures
    ]
  ])('names the Grocery List in %s', (_key, enValue, esValue) => {
    expect(enValue).toContain('Grocery List')
    expect(esValue).toContain('Lista de Compras')
  })
})
