import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from 'server/api/trpc'
import { z } from 'zod'

const messagesSchema = z.array(
  z.object({
    content: z.string().min(1),
    role: z.enum(['system', 'user', 'assistant']),
    id: z.string().optional()
  })
)

export const chatRouter = createTRPCRouter({
  getChats: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.chat.findMany({
        where: {
          userId: input.userId
        },
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          messages: {
            orderBy: {
              id: 'desc'
            },
            take: 1
          }
        },
        take: 5
      })
    }),

  getMessagesByChatId: protectedProcedure
    .input(
      z.object({
        chatId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.chat.findFirst({
        where: {
          id: input.chatId
        },

        include: {
          messages: {
            orderBy: {
              id: 'asc'
            }
          }
        }
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        messages: messagesSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      return ctx.prisma.chat.create({
        data: {
          userId,

          messages: {
            createMany: {
              data: input.messages.map((message) => ({
                content: message.content,
                role: message.role
              }))
            }
          }
        },

        include: {
          messages: true
        }
      })
    }),

  createPublic: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            name: z.string().min(3).max(50),
            userId: z.string(),
            role: z.enum(['system', 'user', 'assistant']),
            content: z.string().min(1).max(255)
          })
        ),
        userId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.chat.create({
        data: {
          userId: input.userId,
          messages: {
            createMany: { data: input.messages }
          }
        }
      })
    }),

  addMessages: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        messages: messagesSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId, messages } = input

      return await ctx.prisma.$transaction(
        messages.map((m) =>
          ctx.prisma.message.create({
            data: { content: m.content, role: m.role, chatId }
          })
        )
      )
    })
})
