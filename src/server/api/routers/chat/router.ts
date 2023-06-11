import { createTRPCRouter, protectedProcedure } from 'server/api/trpc'
import { z } from 'zod'

const createChatSchema = z.object({
  messages: z.array(
    z.object({
      name: z.string().min(3).max(50),
      userId: z.number(),
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1).max(255)
    })
  )
})

const addMessagesSchema = z.object({
  messages: z.array(
    z.object({
      chatId: z.number(),
      content: z.string().min(1).max(255),
      role: z.enum(['system', 'user', 'assistant'])
    })
  )
})

export const chatRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createChatSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return ctx.prisma.chat.create({
        data: {
          userId,
          messages: {
            createMany: { data: input.messages }
          }
        }
      })
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    return ctx.prisma.chat.findFirst({
      where: {
        userId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 1,
      include: {
        messages: true
      }
    })
  }),

  addMessages: protectedProcedure
    .input(addMessagesSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.message.createMany({
        data: input.messages
      })
    })
})
