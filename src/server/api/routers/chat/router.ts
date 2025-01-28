import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { z } from 'zod'

const messagesSchema = z.array(
  z.object({
    content: z.string().min(1),
    role: z.enum(['system', 'user', 'assistant', 'function', 'data', 'tool']),
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

  getMessagesById: protectedProcedure
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
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        chatId: z.string().optional(),
        messages: messagesSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId, messages } = input

      if (chatId) {
        // add messages

        const lastTwoMessages = messages.slice(-2)

        await ctx.prisma.$transaction(
          lastTwoMessages.map((m) =>
            ctx.prisma.message.create({
              data: { content: m.content, role: m.role, chatId }
            })
          )
        )

        const allMessages = await ctx.prisma.message.findMany({
          where: {
            chatId
          },
          orderBy: {
            id: 'asc'
          }
        })

        return {
          success: true,
          message: 'successfully added messages',
          messages: allMessages
        } as const
      } else {
        // create chat

        const userId = ctx.session.user.id

        const newChat = await ctx.prisma.chat.create({
          data: {
            userId,

            messages: {
              createMany: {
                data: messages.map((message) => ({
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

        return {
          success: true,
          message: 'successfully created a chat',
          chatId: newChat.id,
          messages: newChat.messages
        } as const
      }
    })
})
