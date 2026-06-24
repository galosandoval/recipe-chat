/**
 * @jest-environment node
 */
import { buildSignature } from '~/lib/embeddings'

describe('buildSignature', () => {
  it('renders every present facet as its own labelled line, in a stable order', () => {
    const signature = buildSignature({
      name: 'Spicy Thai Basil Chicken',
      description: 'A quick weeknight stir-fry',
      cuisine: 'Thai',
      course: 'Dinner',
      dietTags: ['Gluten-Free'],
      flavorTags: ['Spicy', 'Savory'],
      mainIngredients: ['Chicken', 'Thai Basil'],
      techniques: ['Stir-Fry']
    })

    expect(signature).toBe(
      [
        'spicy thai basil chicken',
        'cuisine: thai',
        'course: dinner',
        'diet: gluten-free',
        'mains: chicken, thai basil',
        'techniques: stir-fry',
        'flavors: spicy, savory',
        'summary: A quick weeknight stir-fry'
      ].join('\n')
    )
  })

  it('omits absent facets, leaving only the normalized name', () => {
    const signature = buildSignature({ name: '  Plain Toast  ' })

    expect(signature).toBe('plain toast')
  })

  it('lowercases, trims, and de-duplicates array facets', () => {
    const signature = buildSignature({
      name: 'Soup',
      mainIngredients: [' Onion ', 'onion', 'CARROT', 'carrot', '']
    })

    expect(signature).toBe(['soup', 'mains: onion, carrot'].join('\n'))
  })
})
