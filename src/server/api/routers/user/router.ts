import { createId } from '@paralleldrive/cuid2'
import { TRPCError } from '@trpc/server'
import { hash } from 'bcryptjs'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from 'server/api/trpc'
import { z } from 'zod'

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findFirst({
      where: {
        id: ctx.session.user.id
      }
    })
  }),

  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6).max(20)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const username = input.email.toLowerCase()

      const duplicateUser = await ctx.prisma.user.findFirst({
        where: { username }
      })

      if (duplicateUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists.'
        })
      }
      const hashedPassword = await hash(input.password, 10)
      return ctx.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          list: { create: {} }
        }
      })
    }),

  createChatAndRecipe: protectedProcedure
    .input(
      z.object({
        recipe: z.object({
          description: z.string().optional(),
          name: z.string(),
          imgUrl: z.string().optional(),
          author: z.string().optional(),
          ingredients: z.array(z.string()),
          instructions: z.array(z.string()),
          prepTime: z.string().optional(),
          cookTime: z.string().optional()
        }),
        messages: z
          .object({
            content: z.string().min(1),
            role: z.enum(['system', 'user', 'assistant', 'function'])
          })
          .array()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { recipe, messages } = input
      const userId = ctx.session.user.id

      const messageId = createId()
      const chatId = createId()

      const { ingredients, instructions, ...rest } = recipe

      const onboardedUser = await ctx.prisma.user.update({
        where: { id: userId },
        data: {
          chats: {
            create: {
              id: chatId,
              messages: {
                createMany: {
                  data: messages.map((message, i, array) => {
                    if (i === array.length - 1) {
                      return {
                        content: message.content,
                        role: message.role,
                        id: messageId
                      }
                    }

                    return { content: message.content, role: message.role }
                  })
                }
              }
            }
          },
          recipes: {
            create: {
              ingredients: {
                create: ingredients.map((ingredient) => ({
                  name: ingredient
                }))
              },
              instructions: {
                create: instructions.map((instruction) => ({
                  description: instruction
                }))
              },
              ...rest,
              message: { connect: { id: messageId } }
            }
          }
        },
        include: {
          recipes: true
        }
      })

      return onboardedUser
    })
})
