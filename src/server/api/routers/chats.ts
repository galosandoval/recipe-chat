import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import {
  getChats,
  getMessagesById,
  createChat,
  addMessages,
  upsertChat
} from '~/server/api/use-cases/chats'

export const messagesSchema = z.array(
  z.object({
    content: z.string().min(1),
    role: z.enum(['system', 'user', 'assistant', 'function', 'data', 'tool']),
    id: z.string().optional()
  })
)

export const chatsRouter = createTRPCRouter({
  getChats: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getChats(input.userId, ctx.prisma)
    }),

  getMessagesById: protectedProcedure
    .input(
      z.object({
        chatId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      return getMessagesById(input.chatId, ctx.prisma)
    }),

  create: protectedProcedure
    .input(
      z.object({
        messages: messagesSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      return createChat(userId, input.messages, ctx.prisma)
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
      return addMessages(chatId, messages, ctx.prisma)
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
      const userId = ctx.session.user.id
      return upsertChat(chatId, messages, ctx.prisma, userId)
    })
})
