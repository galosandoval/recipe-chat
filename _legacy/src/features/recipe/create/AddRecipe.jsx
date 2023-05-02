import React, { useState } from 'react'
import {
  useCreateIngredients,
  useCreateInstructions,
  useCreateRecipe
} from '../../services/recipeService'
import { queryClient } from '../../utils/react-query-client'
import { storage } from '../../utils/storage'
import { parseIngredients, parseInstructions } from '../../utils/addRecipe'

const initialRecipeToAddState = {
  name: '',
  description: '',
  ingredients: '',
  instructions: '',
  imageUrl: '',
  author: '',
  address: ''
}
const userId = storage.getUserId()

export const AddRecipe = () => {
  const recipe = useCreateRecipe()
  const instructions = useCreateInstructions()
  const ingredients = useCreateIngredients()

  const [recipeFormStyle, setRecipeFormStyle] = useState(0)
  const [count, setCount] = useState(0)
  const [formValues, setFormValues] = useState(initialRecipeToAddState)
  const [disabled, setDisabled] = useState(true)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((state) => ({ ...state, [name]: value }))
    setDisabled(false)
  }

  const handleNext = (event) => {
    const { name } = event.target
    if (name === 'next') {
      setCount((state) => state + 1)
      setRecipeFormStyle((state) => state - 100)
    }
    setDisabled(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const recipeBody = {
      'recipe-name': formValues.name,
      description: formValues.description,
      'user-id': userId,
      'img-url': formValues.imageUrl,
      author: formValues.author,
      address: formValues.address
    }

    await recipe.mutateAsync(recipeBody)
    const newRecipeId = queryClient.getQueryData([
      'recipe',
      { 'user-id': storage.getUserId() }
    ]).data.recipe[0]

    const parsedIngredients = parseIngredients(formValues.ingredients)
    const parsedInstructions = parseInstructions(formValues.instructions)
    const ingredientsBody = parsedIngredients.map((ingredientToAdd) => ({
      'recipe-id': newRecipeId,
      name: ingredientToAdd
    }))

    const instructionsBody = parsedInstructions.map((instruction, index) => ({
      'recipe-id': newRecipeId,
      description: instruction,
      step: index + 1
    }))

    await ingredients.mutateAsync(ingredientsBody)
    await instructions.mutateAsync(instructionsBody)

    setRecipeFormStyle(0)
    document.querySelector('#form').click()

    setTimeout(() => {
      recipe.reset()
      instructions.reset()
      ingredients.reset()
    }, 2000)
  }
  return (
    <form className='form-add'>
      <div
        className='form-add__carousel'
        style={{
          transform: `translateX(${recipeFormStyle}%)`
        }}
      >
        <label className='form-add__label'>
          Recipe Name
          <input
            required
            type='text'
            placeholder='Creamy Mushroom Toast With Soft Egg & Gruyère'
            name='name'
            className='form-container-recipe__input form-add__input'
            value={formValues.name}
            onChange={handleChange}
          />
        </label>
        <label className='form-add__label'>
          Recipe Description
          <input
            required
            type='text'
            placeholder='A twist on the beloved British favorite, delightfully simple and absolutely delicious for breakfast, brunch, lunch, or even dinner.'
            name='description'
            className='form-container-recipe__input form-add__input'
            value={formValues.description}
            onChange={handleChange}
          />
        </label>
        <label className='form-add__label'>
          Image Address
          <input
            required
            type='text'
            placeholder='https://www.gordonramsay.com/assets/Uploads/_resampled/CroppedFocusedImage108081050-50-Mushroomtoast.jpg'
            name='imageUrl'
            className='form-container-recipe__input form-add__input'
            value={formValues.imageUrl}
            onChange={handleChange}
          />
        </label>
        <label className='form-add__label'>
          Author
          <input
            required
            type='text'
            placeholder='Gordon Ramsay'
            name='author'
            className='form-container-recipe__input form-add__input'
            value={formValues.author}
            onChange={handleChange}
          />
        </label>
        <label className='form-add__label'>
          Web Address
          <input
            required
            type='text'
            placeholder='https://www.gordonramsay.com/gr/recipes/mushroomtoast/'
            name='address'
            className='form-container-recipe__input form-add__input'
            value={formValues.address}
            onChange={handleChange}
          />
        </label>

        <label className='form-add__label'>
          Ingredients
          <textarea
            required
            className='form-add__textarea'
            name='ingredients'
            cols='30'
            rows='10'
            placeholder='2 tablespoons unsalted butter
              8 ounces mushrooms
              3 cloves garlic, smashed
              3 large sprigs of thyme
              ½ shallot...'
            value={formValues.ingredients}
            onChange={handleChange}
          />
        </label>
        <label className='form-add__label'>
          Instructions
          <textarea
            required
            className='form-add__textarea'
            name='instructions'
            cols='30'
            rows='10'
            placeholder='Make the Mushrooms: Heat a large skillet over medium-high heat and melt butter. Once melted, add mushrooms (working in batches if needed to not...'
            value={formValues.instructions}
            onChange={handleChange}
          />
        </label>
      </div>
      {count < 6 ? (
        <button
          onClick={handleNext}
          className='add-btn-submit form-add__btn'
          name='next'
          disabled={disabled}
        >
          Next
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          className='add-btn-submit form-add__btn'
          type='submit'
          name='submit'
          disabled={disabled}
        >
          {recipe.isSuccess && instructions.isSuccess && ingredients.isSuccess
            ? 'Success'
            : recipe.isLoading ||
              instructions.isLoading ||
              ingredients.isLoading
            ? 'Adding...'
            : 'Save'}
        </button>
      )}
    </form>
  )
}
const someting = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': 'https://www.recipetineats.com/thai-green-curry/#article',
      isPartOf: { '@id': 'https://www.recipetineats.com/thai-green-curry/' },
      author: {
        name: 'Nagi',
        '@id':
          'https://www.recipetineats.com/#/schema/person/1d495a057e0419b552333c8526d827a9'
      },
      headline: 'Thai Green Curry',
      datePublished: '2019-02-15T08:59:57+00:00',
      dateModified: '2021-11-11T21:32:51+00:00',
      wordCount: 2315,
      commentCount: 420,
      publisher: { '@id': 'https://www.recipetineats.com/#organization' },
      image: {
        '@id': 'https://www.recipetineats.com/thai-green-curry/#primaryimage'
      },
      thumbnailUrl:
        'https://www.recipetineats.com/wp-content/uploads/2019/02/Thai-Green-Curry_5.jpg',
      articleSection: ['Curries', 'Iconic Dishes', 'Thai Recipes'],
      inLanguage: 'en-US',
      potentialAction: [
        {
          '@type': 'CommentAction',
          name: 'Comment',
          target: ['https://www.recipetineats.com/thai-green-curry/#respond']
        }
      ]
    },
    {
      '@type': 'WebPage',
      '@id': 'https://www.recipetineats.com/thai-green-curry/',
      url: 'https://www.recipetineats.com/thai-green-curry/',
      name: 'Thai Green Curry | RecipeTin Eats',
      isPartOf: { '@id': 'https://www.recipetineats.com/#website' },
      primaryImageOfPage: {
        '@id': 'https://www.recipetineats.com/thai-green-curry/#primaryimage'
      },
      image: {
        '@id': 'https://www.recipetineats.com/thai-green-curry/#primaryimage'
      },
      thumbnailUrl:
        'https://www.recipetineats.com/wp-content/uploads/2019/02/Thai-Green-Curry_5.jpg',
      datePublished: '2019-02-15T08:59:57+00:00',
      dateModified: '2021-11-11T21:32:51+00:00',
      description:
        'Thai Green Curry made quick and easy by pimping up store bought curry paste OR with a homemade green curry paste. Better than your local Thai place!',
      breadcrumb: {
        '@id': 'https://www.recipetineats.com/thai-green-curry/#breadcrumb'
      },
      inLanguage: 'en-US',
      potentialAction: [
        {
          '@type': 'ReadAction',
          target: ['https://www.recipetineats.com/thai-green-curry/']
        }
      ]
    },
    {
      '@type': 'ImageObject',
      inLanguage: 'en-US',
      '@id': 'https://www.recipetineats.com/thai-green-curry/#primaryimage',
      url: 'https://www.recipetineats.com/wp-content/uploads/2019/02/Thai-Green-Curry_5.jpg',
      contentUrl:
        'https://www.recipetineats.com/wp-content/uploads/2019/02/Thai-Green-Curry_5.jpg',
      width: 900,
      height: 1260,
      caption: 'Thai Green Curry in a black skillet, fresh off the stove'
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://www.recipetineats.com/thai-green-curry/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.recipetineats.com/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Collections',
          item: 'https://www.recipetineats.com/category/collections/'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Curries',
          item: 'https://www.recipetineats.com/category/collections/curry-recipes/'
        },
        { '@type': 'ListItem', position: 4, name: 'Thai Green Curry' }
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.recipetineats.com/#website',
      url: 'https://www.recipetineats.com/',
      name: 'RecipeTin Eats',
      description: 'Fast Prep, Big Flavours',
      publisher: { '@id': 'https://www.recipetineats.com/#organization' },
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.recipetineats.com/?s={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      ],
      inLanguage: 'en-US'
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.recipetineats.com/#organization',
      name: 'RecipeTin Eats',
      url: 'https://www.recipetineats.com/',
      logo: {
        '@type': 'ImageObject',
        inLanguage: 'en-US',
        '@id': 'https://www.recipetineats.com/#/schema/logo/image/',
        url: 'https://www.recipetineats.com/wp-content/uploads/2019/04/RecipeTinEats_logo_for_Knowledge_Graph_card.png',
        contentUrl:
          'https://www.recipetineats.com/wp-content/uploads/2019/04/RecipeTinEats_logo_for_Knowledge_Graph_card.png',
        width: 2591,
        height: 347,
        caption: 'RecipeTin Eats'
      },
      image: { '@id': 'https://www.recipetineats.com/#/schema/logo/image/' },
      sameAs: [
        'https://www.facebook.com/RecipeTinEats',
        'http://instagram.com/recipe_tin',
        'https://www.linkedin.com/in/nagi-maehashi-9779648b',
        'http://www.pinterest.com/recipetin/',
        'https://www.youtube.com/c/recipetineats'
      ]
    },
    {
      '@type': ['Person', 'Organization'],
      '@id':
        'https://www.recipetineats.com/#/schema/person/1d495a057e0419b552333c8526d827a9',
      name: 'Nagi',
      image: {
        '@type': 'ImageObject',
        inLanguage: 'en-US',
        '@id': 'https://www.recipetineats.com/#/schema/person/image/',
        url: 'https://secure.gravatar.com/avatar/400004f5258d5b43d30deed3aa6e9566?s=96&d=https%3A%2F%2Fwww.recipetineats.com%2Fwp-content%2Fthemes%2Fonce-coupled-recipe-tin-eats%2Fassets%2Fimages%2Favatar-guest-temp-cache-bust-duplicate.png&r=g',
        contentUrl:
          'https://secure.gravatar.com/avatar/400004f5258d5b43d30deed3aa6e9566?s=96&d=https%3A%2F%2Fwww.recipetineats.com%2Fwp-content%2Fthemes%2Fonce-coupled-recipe-tin-eats%2Fassets%2Fimages%2Favatar-guest-temp-cache-bust-duplicate.png&r=g',
        caption: 'Nagi'
      },
      logo: { '@id': 'https://www.recipetineats.com/#/schema/person/image/' },
      description:
        'I believe you can make great food with everyday ingredients even if you’re short on time and cost conscious. You just need to cook clever and get creative!',
      sameAs: ['http:////www.recipetineats.com/about-me/']
    },
    {
      '@type': 'Person',
      '@id':
        'https://www.recipetineats.com/#/schema/person/1d495a057e0419b552333c8526d827a9',
      name: 'Nagi',
      image: {
        '@type': 'ImageObject',
        inLanguage: 'en-US',
        '@id': 'https://www.recipetineats.com/#/schema/person/image/',
        url: 'https://secure.gravatar.com/avatar/400004f5258d5b43d30deed3aa6e9566?s=96&d=https%3A%2F%2Fwww.recipetineats.com%2Fwp-content%2Fthemes%2Fonce-coupled-recipe-tin-eats%2Fassets%2Fimages%2Favatar-guest-temp-cache-bust-duplicate.png&r=g',
        contentUrl:
          'https://secure.gravatar.com/avatar/400004f5258d5b43d30deed3aa6e9566?s=96&d=https%3A%2F%2Fwww.recipetineats.com%2Fwp-content%2Fthemes%2Fonce-coupled-recipe-tin-eats%2Fassets%2Fimages%2Favatar-guest-temp-cache-bust-duplicate.png&r=g',
        caption: 'Nagi'
      },
      description:
        'I believe you can make great food with everyday ingredients even if you’re short on time and cost conscious. You just need to cook clever and get creative!',
      sameAs: ['http:////www.recipetineats.com/about-me/']
    },
    {
      '@type': 'Recipe',
      name: 'Thai Green Curry',
      author: {
        '@id':
          'https://www.recipetineats.com/#/schema/person/1d495a057e0419b552333c8526d827a9'
      },
      description:
        "Recipe video above. This is how to make a really great QUICK green curry by pimping up curry in a jar, OR using a homemade green curry paste! Don't skip frying off the curry paste, this makes all the difference. See Spiciness info in Note 1 (remember, Green Curry is supposed to be spicy!)",
      datePublished: '2019-02-15T19:59:57+00:00',
      image: [
        'https://www.recipetineats.com/wp-content/uploads/2019/02/Thai-Green-Curry_5.jpg',
        'https://www.recipetineats.com/wp-content/uploads/2019/02/Thai-Green-Curry_5.jpg?w=500&h=500&crop=1',
        'https://www.recipetineats.com/wp-content/uploads/2019/02/Thai-Green-Curry_5.jpg?w=500&h=375&crop=1',
        'https://www.recipetineats.com/wp-content/uploads/2019/02/Thai-Green-Curry_5.jpg?w=480&h=270&crop=1'
      ],
      recipeYield: ['4', '4 people'],
      prepTime: 'PT15M',
      cookTime: 'PT20M',
      totalTime: 'PT35M',
      recipeIngredient: [
        '4 - 6 tbsp Thai Green Curry Paste (Maesri best) OR ((Note 1))',
        '1 quantity homemade green curry paste ((Note 1))',
        '2  large garlic cloves (, minced)',
        '2 tsp fresh ginger (, finely grated)',
        '1 tbsp lemongrass paste ((Note 2))',
        '2 tbsp vegetable oil',
        '1 cup (250ml)   chicken or vegetable broth, low sodium',
        '400 g/14oz   coconut milk (, full fat (Note 4))',
        '1 - 3 tsp fish sauce *',
        '1 - 3 tsp white sugar *',
        '1/8 tsp salt *',
        '6  kaffir lime leaves (, torn in half (Note 5))',
        '350 g/12 oz   chicken thigh (, skinless boneless, sliced (Note 6))',
        '2  Japanese eggplants,  (, small, 1cm / 2/5" slices (Note 7))',
        '1 1/2 cups snow peas (, small, trimmed)',
        '16  Thai basil leaves ((Note 8))',
        'Juice of 1/2 lime (, to taste)',
        'Crispy fried Asian shallots (, high recommended (Note 9))',
        'Thai basil or cilantro/coriander (, recommended)',
        'Green or red chillies slices (, optional)',
        'Steamed jasmine rice'
      ],
      recipeInstructions: [
        {
          '@type': 'HowToStep',
          text: 'Heat oil in a heavy based skillet or pot over medium high heat.',
          name: 'Heat oil in a heavy based skillet or pot over medium high heat.',
          url: 'https://www.recipetineats.com/thai-green-curry/#wprm-recipe-34470-step-0-0'
        },
        {
          '@type': 'HowToStep',
          text: 'Add curry paste (and garlic, ginger and lemongrass Extras, if using) and cook for 2 to 3 minutes until it mostly "dries out" - see video. Don\'t breath in the fumes!!',
          name: 'Add curry paste (and garlic, ginger and lemongrass Extras, if using) and cook for 2 to 3 minutes until it mostly "dries out" - see video. Don\'t breath in the fumes!!',
          url: 'https://www.recipetineats.com/thai-green-curry/#wprm-recipe-34470-step-0-1'
        },
        {
          '@type': 'HowToStep',
          text: 'Add chicken broth and coconut milk, mix to dissolve paste.',
          name: 'Add chicken broth and coconut milk, mix to dissolve paste.',
          url: 'https://www.recipetineats.com/thai-green-curry/#wprm-recipe-34470-step-0-2'
        },
        {
          '@type': 'HowToStep',
          text: 'Curry in a jar seasonings: Add 1 tsp fish sauce, 1 tsp sugar, no salt.',
          name: 'Curry in a jar seasonings: Add 1 tsp fish sauce, 1 tsp sugar, no salt.',
          url: 'https://www.recipetineats.com/thai-green-curry/#wprm-recipe-34470-step-0-3'
        },
        {
          '@type': 'HowToStep',
          text: 'Homemade curry paste seasonings: Add 3 tsp fish sauce, 3 tsp sugar, 1/8 tsp salt.',
          name: 'Homemade curry paste seasonings: Add 3 tsp fish sauce, 3 tsp sugar, 1/8 tsp salt.',
          url: 'https://www.recipetineats.com/thai-green-curry/#wprm-recipe-34470-step-0-4'
        },
        {
          '@type': 'HowToStep',
          text: 'Add kaffir lime leaves. Mix then bring to simmer.',
          name: 'Add kaffir lime leaves. Mix then bring to simmer.',
          url: 'https://www.recipetineats.com/thai-green-curry/#wprm-recipe-34470-step-0-5'
        },
        {
          '@type': 'HowToStep',
          text: "Add chicken, stir then lower heat to medium so it's bubbling gently. Cook 7 minutes.",
          name: "Add chicken, stir then lower heat to medium so it's bubbling gently. Cook 7 minutes.",
          url: 'https://www.recipetineats.com/thai-green-curry/#wprm-recipe-34470-step-0-6'
        }
      ]
    }
  ]
}
