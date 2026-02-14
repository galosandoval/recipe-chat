export type UnitType = 'volume' | 'weight' | 'count'

const VOLUME_UNITS: Record<string, UnitType> = {
  cup: 'volume',
  cups: 'volume',
  tbsp: 'volume',
  tablespoon: 'volume',
  tablespoons: 'volume',
  tsp: 'volume',
  teaspoon: 'volume',
  teaspoons: 'volume',
  ml: 'volume',
  milliliter: 'volume',
  milliliters: 'volume',
  l: 'volume',
  liter: 'volume',
  liters: 'volume',
  'fl oz': 'volume',
  'fluid ounce': 'volume',
  'fluid ounces': 'volume',
  pinch: 'volume',
  pinches: 'volume'
}

const WEIGHT_UNITS: Record<string, UnitType> = {
  g: 'weight',
  gram: 'weight',
  grams: 'weight',
  kg: 'weight',
  kilogram: 'weight',
  kilograms: 'weight',
  oz: 'weight',
  ounce: 'weight',
  ounces: 'weight',
  lb: 'weight',
  lbs: 'weight',
  pound: 'weight',
  pounds: 'weight'
}

const COUNT_UNITS: Record<string, UnitType> = {
  clove: 'count',
  cloves: 'count',
  piece: 'count',
  pieces: 'count',
  stalk: 'count',
  stalks: 'count',
  slice: 'count',
  slices: 'count',
  can: 'count',
  cans: 'count',
  bunch: 'count',
  bunches: 'count',
  sprig: 'count',
  sprigs: 'count',
  leaf: 'count',
  leaves: 'count',
  head: 'count',
  heads: 'count',
  large: 'count',
  medium: 'count',
  small: 'count'
}

type UnitEntry = [string, { unit: string; unitType: UnitType }]
const UNIT_MAP = new Map<string, { unit: string; unitType: UnitType }>([
  ...Object.entries(VOLUME_UNITS).map(
    ([k, v]): UnitEntry => [k.toLowerCase(), { unit: k, unitType: v }]
  ),
  ...Object.entries(WEIGHT_UNITS).map(
    ([k, v]): UnitEntry => [k.toLowerCase(), { unit: k, unitType: v }]
  ),
  ...Object.entries(COUNT_UNITS).map(
    ([k, v]): UnitEntry => [k.toLowerCase(), { unit: k, unitType: v }]
  )
])

const PREPARATION_WORDS = new Set([
  'minced', 'sliced', 'diced', 'chopped', 'grated', 'toasted', 'crushed', 'dried', 'fresh',
  'ground', 'peeled', 'julienned', 'cubed', 'shredded', 'crumbled', 'melted', 'softened',
  'beaten', 'whipped', 'rinsed', 'drained', 'divided', 'optional', 'thawed', 'frozen',
  'warm', 'cooled', 'room temperature', 'finely', 'roughly', 'thinly', 'coarsely',
  'boneless', 'skinless'
])

export interface ParsedIngredient {
  quantity: number | null
  unit: string | null
  unitType: UnitType | null
  itemName: string | null
  preparation: string | null
  rawString: string
}

/**
 * Splits an ingredient name string into structured fields: quantity, unit,
 * unitType, itemName, preparation. Always sets rawString to the original name.
 */
export function parseIngredientName(name: string): ParsedIngredient {
  const rawString = name.trim()
  const result: ParsedIngredient = {
    quantity: null,
    unit: null,
    unitType: null,
    itemName: null,
    preparation: null,
    rawString
  }

  if (!rawString) return result

  let rest = rawString

  // Optional leading quantity: "1 1/2", "2.5", or "1/2" (fraction only)
  const qtyMatch = rest.match(/^(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?)\s+/)
  const fractionOnlyMatch = !qtyMatch && rest.match(/^(\d+\/\d+)\s+/)
  if (qtyMatch) {
    const qtyStr = qtyMatch[1]!
    const simple = qtyStr.replace(/\s+(\d+)\/(\d+)/, (_, n, d) =>
      String(parseFloat(qtyStr) + Number(n) / Number(d))
    )
    result.quantity = parseFloat(simple) || null
    rest = rest.slice(qtyMatch[0]!.length).trim()
  } else if (fractionOnlyMatch) {
    const [num, den] = fractionOnlyMatch[1]!.split('/').map(Number)
    result.quantity = num / den
    rest = rest.slice(fractionOnlyMatch[0]!.length).trim()
  }

  // Optional unit (single word or "fl oz")
  const unitMatch = rest.match(/^(fl\s+oz|fluid\s+ounce|fluid\s+ounces|[a-zA-Z]+)\s+/i)
  if (unitMatch) {
    const unitKey = unitMatch[1]!.toLowerCase().replace(/\s+/g, ' ')
    const mapped = UNIT_MAP.get(unitKey)
    if (mapped) {
      result.unit = mapped.unit
      result.unitType = mapped.unitType
      rest = rest.slice(unitMatch[0].length).trim()
    }
  }

  // Remainder: possibly "prep itemName" or "itemName, prep" or "itemName"
  if (!rest) return result

  // Split by comma; last segment might be preparation
  const parts = rest.split(',').map((p) => p.trim()).filter(Boolean)
  const trailing = parts.length > 1 ? parts[parts.length - 1]! : null
  // When trailing is a known preparation word, use it and main = rest minus that; otherwise keep full remainder as main
  let main: string
  if (trailing && PREPARATION_WORDS.has(trailing.toLowerCase())) {
    result.preparation = trailing
    main = parts.slice(0, -1).join(', ').trim()
  } else {
    main = rest
  }

  // In main, pull leading preparation words off into preparation
  const mainWords = main.split(/\s+/)
  const prepFound: string[] = []
  let i = 0
  while (i < mainWords.length) {
    const word = mainWords[i]!.toLowerCase()
    if (PREPARATION_WORDS.has(word)) {
      prepFound.push(mainWords[i]!)
      i++
    } else {
      break
    }
  }
  if (prepFound.length > 0) {
    result.preparation = [result.preparation, ...prepFound].filter(Boolean).join(', ')
    main = mainWords.slice(i).join(' ').trim()
  }

  result.itemName = main || null
  return result
}

/**
 * Converts an ingredient line string into the shape needed for Prisma Ingredient create.
 * Use when persisting ingredients from the recipe generator or any string source.
 */
export function ingredientStringToCreatePayload(rawString: string): {
  rawString: string
  quantity: number | null
  unit: string | null
  unitType: 'volume' | 'weight' | 'count' | null
  itemName: string | null
  preparation: string | null
} {
  const parsed = parseIngredientName(rawString)
  return {
    rawString: parsed.rawString,
    quantity: parsed.quantity,
    unit: parsed.unit,
    unitType: parsed.unitType,
    itemName: parsed.itemName,
    preparation: parsed.preparation
  }
}
