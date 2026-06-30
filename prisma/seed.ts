import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { slugify } from '~/lib/utils'

const prisma = new PrismaClient()

/**
 * Seed credentials. The plaintext password is what the e2e auth fixture and a
 * human typing into the login form use; it is bcrypt-hashed below so the
 * Credentials provider's `compare()` succeeds (the login flow never sees
 * plaintext in the DB). Not exported — this module runs `main()` as an import
 * side effect, so it can't be safely imported; `e2e/auth.setup.ts` keeps its
 * own copy of these values in sync.
 */
const SEED_USER = {
  email: 'alice@prisma.io',
  password: 'Admin@123'
}

async function main() {
  // Hash like real signup (`createUser` uses `hash(password, 10)`) so the
  // seeded user can authenticate through the Credentials provider; a plaintext
  // password would fail `compare()` and make the seeded login unusable.
  const hashedPassword = await hash(SEED_USER.password, 10)

  const alice = await prisma.user.upsert({
    // Key on the real unique field, not a synthetic id, so re-seeding an
    // existing DB updates Alice instead of colliding on the username constraint.
    where: { username: SEED_USER.email },
    // Refresh the login credential on every run — a stale hash breaks the e2e
    // auth fixture. Relations stay on the create branch: the e2e DB is reset
    // before seeding (see e2e/global-setup.ts), so create always runs there.
    update: { password: hashedPassword },
    create: {
      username: SEED_USER.email,
      firstName: 'Alice',
      lastName: 'Prisma',
      password: hashedPassword,
      // Real signup creates an empty list; the session callback reads
      // `user.list.id`, so the seeded user needs one too.
      list: { create: {} },

      // The taste-profile onboarding drawer auto-opens for any authenticated
      // user whose `tasteProfile` is null, covering the page. Seed a profile so
      // the e2e specs land on an unobstructed app instead of the onboarding quiz.
      tasteProfile: { create: { cookingSkill: 'intermediate' } },

      recipes: {
        create: {
          slug: slugify('CREAMY MUSHROOM TOAST WITH SOFT EGG & GRUYÈRE'),
          author: 'gordon ramsay',
          address: 'https://www.gordonramsay.com/gr/recipes/mushroomtoast/',
          name: 'CREAMY MUSHROOM TOAST WITH SOFT EGG & GRUYÈRE',
          // `getInfiniteRecipes` (the /recipes list) filters `saved: true`; the
          // schema defaults `saved` to false, so the e2e recipes spec only sees
          // this recipe when it's explicitly saved.
          saved: true,
          description:
            'A twist on the beloved British favorite, delightfully simple and absolutely delicious for breakfast, brunch, lunch, or even dinner.',

          // Unsplash, not the original source host: `images.unsplash.com` is
          // allowlisted in `next.config.mjs` `remotePatterns`, so `next/image`
          // renders it. An unconfigured host throws and trips the error boundary.
          imgUrl:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
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
