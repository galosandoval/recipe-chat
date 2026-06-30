import { aggregateIngredients } from '~/lib/ingredient-display'

type Input = Parameters<typeof aggregateIngredients>[0][number]

function ing(overrides: Partial<Input> & { id: string }): Input {
  return {
    rawString: '',
    quantity: null,
    unit: null,
    itemName: null,
    preparation: null,
    recipeId: null,
    checked: false,
    ...overrides
  }
}

describe('aggregateIngredients', () => {
  it('sums quantities for the same item and identical unit', () => {
    const result = aggregateIngredients([
      ing({ id: '1', quantity: 1, unit: 'cup', itemName: 'flour' }),
      ing({ id: '2', quantity: 2, unit: 'cups', itemName: 'flour' })
    ])

    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(3)
    expect(result[0].unit).toBe('cup')
    expect(result[0].displayText).toContain('flour')
    expect(result[0].ingredientIds).toEqual(['1', '2'])
  })

  it('merges compatible units of the same kind by converting (tbsp into cups)', () => {
    const result = aggregateIngredients([
      ing({ id: '1', quantity: 1, unit: 'cup', itemName: 'milk' }),
      ing({ id: '2', quantity: 16, unit: 'tbsp', itemName: 'milk' })
    ])

    // 16 tbsp ≈ 1 cup, so total ≈ 2 cups (displayed in the first contributor's unit)
    expect(result).toHaveLength(1)
    expect(result[0].unit).toBe('cup')
    expect(result[0].quantity).toBeCloseTo(2, 1)
    expect(result[0].ingredientIds).toEqual(['1', '2'])
  })

  it('does not merge the same item across incompatible kinds (volume vs weight)', () => {
    const result = aggregateIngredients([
      ing({ id: '1', quantity: 1, unit: 'cup', itemName: 'sugar' }),
      ing({ id: '2', quantity: 200, unit: 'g', itemName: 'sugar' })
    ])

    expect(result).toHaveLength(2)
  })

  it('does not merge different count units of the same item', () => {
    const result = aggregateIngredients([
      ing({ id: '1', quantity: 1, unit: 'clove', itemName: 'garlic' }),
      ing({ id: '2', quantity: 1, unit: 'head', itemName: 'garlic' })
    ])

    expect(result).toHaveLength(2)
  })

  it('tracks the distinct contributing recipe ids', () => {
    const result = aggregateIngredients([
      ing({
        id: '1',
        quantity: 1,
        unit: 'cup',
        itemName: 'flour',
        recipeId: 'r1'
      }),
      ing({
        id: '2',
        quantity: 2,
        unit: 'cup',
        itemName: 'flour',
        recipeId: 'r2'
      }),
      ing({
        id: '3',
        quantity: 1,
        unit: 'cup',
        itemName: 'flour',
        recipeId: 'r1'
      })
    ])

    expect(result).toHaveLength(1)
    expect(result[0].recipeIds).toEqual(['r1', 'r2'])
  })

  it('is checked only when every contributing ingredient is checked', () => {
    const partly = aggregateIngredients([
      ing({
        id: '1',
        quantity: 1,
        unit: 'cup',
        itemName: 'flour',
        checked: true
      }),
      ing({
        id: '2',
        quantity: 2,
        unit: 'cup',
        itemName: 'flour',
        checked: false
      })
    ])
    expect(partly[0].checked).toBe(false)

    const fully = aggregateIngredients([
      ing({
        id: '1',
        quantity: 1,
        unit: 'cup',
        itemName: 'flour',
        checked: true
      }),
      ing({
        id: '2',
        quantity: 2,
        unit: 'cup',
        itemName: 'flour',
        checked: true
      })
    ])
    expect(fully[0].checked).toBe(true)
  })

  describe('edge cases', () => {
    it('keeps "to taste" items as unmeasured (no quantity summed)', () => {
      const result = aggregateIngredients([
        ing({ id: '1', rawString: 'salt to taste', itemName: 'salt' }),
        ing({ id: '2', rawString: 'salt to taste', itemName: 'salt' })
      ])

      expect(result).toHaveLength(1)
      expect(result[0].unmeasured).toBe(true)
      expect(result[0].quantity).toBeNull()
      expect(result[0].ingredientIds).toEqual(['1', '2'])
    })

    it('does not sum optional ingredients into a measured group', () => {
      const result = aggregateIngredients([
        ing({ id: '1', quantity: 1, unit: 'cup', itemName: 'parsley' }),
        ing({
          id: '2',
          quantity: 1,
          unit: 'cup',
          itemName: 'parsley',
          rawString: '1 cup parsley (optional)',
          preparation: 'optional'
        })
      ])

      const measured = result.find((r) => !r.unmeasured)
      const optional = result.find((r) => r.unmeasured)
      expect(measured?.quantity).toBe(1)
      expect(optional?.unmeasured).toBe(true)
    })

    it('keeps garnish items separate from the measured total', () => {
      const result = aggregateIngredients([
        ing({ id: '1', quantity: 2, unit: 'cup', itemName: 'cilantro' }),
        ing({
          id: '2',
          rawString: 'cilantro for garnish',
          itemName: 'cilantro'
        })
      ])

      expect(result).toHaveLength(2)
      expect(result.some((r) => r.unmeasured)).toBe(true)
    })

    it('keeps ingredients without item name as individual entries', () => {
      const result = aggregateIngredients([
        ing({ id: '1', rawString: 'a pinch of something nice' }),
        ing({ id: '2', rawString: 'a dash of mystery' })
      ])

      expect(result).toHaveLength(2)
    })
  })
})
