import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "../../lib/prisma";
import { Recipe } from "@prisma/client";
import { parseRecipeUrl } from "../helpers/parse-recipe-url";

const CreateRecipeSchema = z.object({
  description: z.string().optional(),
  name: z.string(),
  imgUrl: z.string().optional(),
  author: z.string().optional(),
  address: z.string().optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  userId: z.number(),
  listId: z.number().optional(),
  url: z.string().optional(),
});

export const recipesRouter = router({
  recipeEntity: procedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const recipeList = await prisma.recipesOnList.findMany({
        where: { userId: { equals: input.userId } },
        select: {
          recipe: true,
        },
      });

      const entity: { [recipeId: string]: Recipe } = {};

      recipeList.forEach((element) => {
        entity[element.recipe.id] = element.recipe;
      });

      return entity;
    }),

  parseRecipeUrl: procedure
    .input(z.string())
    .mutation(({ input }) => parseRecipeUrl(input)),

  recipeCreate: procedure.input(CreateRecipeSchema).mutation(createRecipe),

  recipeById: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.recipe.findFirst({
        where: { id: { equals: input.id } },
        select: { ingredients: true, instructions: true },
      });
    }),
});

export type CreateRecipeParams = z.infer<typeof CreateRecipeSchema>;

async function createRecipe({ input }: { input: CreateRecipeParams }) {
  const { userId, listId, ingredients, instructions, ...rest } = input;
  const result = await prisma.recipe.create({
    data: {
      ...rest,
      instructions: {
        create: instructions.map((i) => ({ description: i })),
      },
      ingredients: {
        create: ingredients.map((i) => ({ name: i })),
      },
      onLists: { create: { userId, listId } },
    },
    include: {
      ingredients: true,
      instructions: true,
      onLists: true,
    },
  });
  return result;
}
