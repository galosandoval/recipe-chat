import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import {
  getChats,
  getMessagesById,
  upsertChat
} from '~/server/api/use-cases/chats'
import { upsertChatSchema } from '~/schemas/chats'

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

  upsert: protectedProcedure
    .input(upsertChatSchema)
    .mutation(async ({ ctx, input }) => {
      const { chatId, messages } = input
      const userId = ctx.session.user.id
      return upsertChat(chatId, messages, ctx.prisma, userId)
    })
})
