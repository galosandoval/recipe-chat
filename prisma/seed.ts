import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // const alice = await prisma.user.upsert({
  //   where: { username: 'alice@prisma.io' },
  //   update: {},
  //   create: {
  //     username: 'alice@prisma.io',
  //     firstName: 'Alice',
  //     lastName: 'Prisma',
  //     password: 'Admin@123',
  //     recipesOnLists: {
  //       create: {
  //         recipe: {
  //           create: [{ name: '',  }]
  //         }
  //       }
  //     }
  //     // recipes: {
  //     //   create: [
  const something = {
    author: 'gordon ramsay',
    address: 'https://www.gordonramsay.com/gr/recipes/mushroomtoast/',
    name: 'CREAMY MUSHROOM TOAST WITH SOFT EGG & GRUYÈRE',
    description:
      'A twist on the beloved British favorite, delightfully simple and absolutely delicious for breakfast, brunch, lunch, or even dinner.',

    imgUrl:
      'https://www.gordonramsay.com/assets/Uploads/_resampled/CroppedFocusedImage192072050-50-Mushroomtoast.jpg',
    ingredients: {
      create: [
        {
          name: '2 tablespoons unsalted butter, more as needed'
        },
        {
          name: 'Olive oil'
        },

        {
          name: '8 ounces mushrooms, ends trimmed and sliced into even pieces'
        },
        {
          name: '3 cloves garlic, smashed'
        },
        {
          name: '½ shallot, finely minced, about 2 tablespoons'
        },
        {
          name: 'Kosher salt'
        },
        {
          name: 'Freshly ground black pepper'
        },
        {
          name: 'Sherry vinegar'
        },
        {
          name: '3 tablespoons crème fraîche'
        },
        {
          name: '2 thick slices sourdough or country bread, toasted in a pan with butter'
        },
        {
          name: 'Handful of arugula, tossed with olive oil, lemon juice and salt'
        },
        {
          name: '2 soft-poached eggs, topped with flaky salt and black pepper'
        },
        {
          name: 'Gruyère cheese, shaved'
        }
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
  // {
  //   name: "the only ice cream recipe you'll ever need",
  //   description:
  //     'This silky, luscious and very classic custard can be used as the base for any ice cream flavor you can dream up. These particular proportions of milk and cream to egg yolk will give you a thick but not sticky ice cream that feels decadent but not heavy. For something a little lighter, use more milk and less cream, as long as the dairy adds up to 3 cups. You can also cut down on egg yolks for a thinner base, but don’t go below three.',
  //   imgUrl:
  //     'https://static01.nyt.com/images/2014/06/27/multimedia/clark-icecream/clark-icecream-articleLarge.jpg',
  //   author: 'melissa clark',
  //   address:
  //     'https://cooking.nytimes.com/recipes/1016605-the-only-ice-cream-recipe-youll-ever-need',
  //   ingredients: {
  //     create: [
  //       {
  //         name: '2 cups heavy cream'
  //       },
  //       {
  //         name: '6 large egg yolks'
  //       },
  //       {
  //         name: '1 cup whole milk'
  //       },
  //       {
  //         name: '1/8 teaspoon fine sea salt'
  //       },
  //       {
  //         name: 'Your choice of flavoring '
  //       },
  //       {
  //         name: '2/3 cup sugar'
  //       }
  //     ]
  //   },
  //   instructions: {
  //     create: [
  //       {
  //         description:
  //           'In a small pot, simmer heavy cream, milk, sugar and salt until sugar completely dissolves, about 5 minutes. Remove pot from heat. In a separate bowl, whisk yolks. Whisking constantly, slowly whisk about a third of the hot cream into the yolks, then whisk the yolk mixture back into the pot with the cream. Return pot to medium-low heat and gently cook until mixture is thick enough to coat the back of a spoon (about 170 degrees on an instant-read thermometer).'
  //       },
  //       {
  //         description:
  //           'Strain through a fine-mesh sieve into a bowl. Cool mixture to room temperature. Cover and chill at least 4 hours or overnight. Churn in an ice cream machine according to manufacturers instructions. Serve directly from the machine for soft serve, or store in freezer until needed.'
  //       }
  //     ]
  //   }
  // }
  // ]
  // }
  // }
  // })

  const alice = await prisma.recipesOnList.upsert({
    where: { id: 1 },
    update: {},
    create: {
      user: {
        create: {
          username: 'alice@prisma.io',
          firstName: 'Alice',
          lastName: 'Prisma',
          password: 'Admin@123'
        }
      },
      recipe: {
        create: {
          author: 'gordon ramsay',
          address: 'https://www.gordonramsay.com/gr/recipes/mushroomtoast/',
          name: 'CREAMY MUSHROOM TOAST WITH SOFT EGG & GRUYÈRE',
          description:
            'A twist on the beloved British favorite, delightfully simple and absolutely delicious for breakfast, brunch, lunch, or even dinner.',

          imgUrl:
            'https://www.gordonramsay.com/assets/Uploads/_resampled/CroppedFocusedImage192072050-50-Mushroomtoast.jpg',
          ingredients: {
            create: [
              {
                name: '2 tablespoons unsalted butter, more as needed'
              },
              {
                name: 'Olive oil'
              },

              {
                name: '8 ounces mushrooms, ends trimmed and sliced into even pieces'
              },
              {
                name: '3 cloves garlic, smashed'
              },
              {
                name: '½ shallot, finely minced, about 2 tablespoons'
              },
              {
                name: 'Kosher salt'
              },
              {
                name: 'Freshly ground black pepper'
              },
              {
                name: 'Sherry vinegar'
              },
              {
                name: '3 tablespoons crème fraîche'
              },
              {
                name: '2 thick slices sourdough or country bread, toasted in a pan with butter'
              },
              {
                name: 'Handful of arugula, tossed with olive oil, lemon juice and salt'
              },
              {
                name: '2 soft-poached eggs, topped with flaky salt and black pepper'
              },
              {
                name: 'Gruyère cheese, shaved'
              }
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
