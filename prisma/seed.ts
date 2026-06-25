import { PrismaClient } from '@prisma/client'
import { slugify } from '~/lib/utils'

const prisma = new PrismaClient()

async function main() {
  const alice = await prisma.user.upsert({
    where: { id: '1' },
    update: {},
    create: {
      username: 'alice@prisma.io',
      firstName: 'Alice',
      lastName: 'Prisma',
      password: 'Admin@123',

      recipes: {
        create: {
          slug: slugify('CREAMY MUSHROOM TOAST WITH SOFT EGG & GRUYÈRE'),
          author: 'gordon ramsay',
          address: 'https://www.gordonramsay.com/gr/recipes/mushroomtoast/',
          name: 'CREAMY MUSHROOM TOAST WITH SOFT EGG & GRUYÈRE',
          description:
            'A twist on the beloved British favorite, delightfully simple and absolutely delicious for breakfast, brunch, lunch, or even dinner.',

          imgUrl:
            'https://www.gordonramsay.com/assets/Uploads/_resampled/CroppedFocusedImage192072050-50-Mushroomtoast.jpg',
          ingredients: {
            create: [
              { rawString: '2 tablespoons unsalted butter, more as needed' },
              { rawString: 'Olive oil' },
              {
                rawString:
                  '8 ounces mushrooms, ends trimmed and sliced into even pieces'
              },
              { rawString: '3 cloves garlic, smashed' },
              {
                rawString: '½ shallot, finely minced, about 2 tablespoons'
              },
              { rawString: 'Kosher salt' },
              { rawString: 'Freshly ground black pepper' },
              { rawString: 'Sherry vinegar' },
              { rawString: '3 tablespoons crème fraîche' },
              {
                rawString:
                  '2 thick slices sourdough or country bread, toasted in a pan with butter'
              },
              {
                rawString:
                  'Handful of arugula, tossed with olive oil, lemon juice and salt'
              },
              {
                rawString:
                  '2 soft-poached eggs, topped with flaky salt and black pepper'
              },
              { rawString: 'Gruyère cheese, shaved' }
            ]
          },
          instructions: {
            create: [
              {
                description:
                  'Make the Mushrooms: Heat a large skillet over medium-high heat and melt butter. Once melted, add mushrooms (working in batches if needed to not overcrowd the pan), garlic and thyme and cook, tossing occasionally, until mushrooms are lightly browned and tender. If working in batches, remove mushrooms from skillet and set aside, keeping the garlic and thyme in the pan and add a bit more butter to the pan, and repeat with remaining mushrooms.'
              },
              {
                description:
                  'Add shallots, season everything with salt and pepper, and saute for 1-2 minutes, until shallots are tender and fragrant. Discard garlic and thyme, then add a splash of sherry vinegar, crème fraîche then stir to combine. Reduce heat to medium low and let simmer all together for a moment. Taste and adjust seasoning before removing from heat. '
              },
              {
                description:
                  'Place a few generous spoonfuls of mushrooms and sauce on top of toasted bread, then top with arugula leaves. Nestle the eggs atop the greens and top with shaves of Gruyère.'
              }
            ]
          }
        }
      }
    }
  })

  console.log({ alice })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
