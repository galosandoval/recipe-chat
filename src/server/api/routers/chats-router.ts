import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import {
  generated,
  getChats,
  getMessagesById,
  getResumableChat,
  upsertChat
} from '~/server/api/use-cases/chats-use-case'
import {
  chatContextSchema,
  generatedSchema,
  upsertChatSchema
} from '~/schemas/chats-schema'

export const chatsRouter = createTRPCRouter({
  getChats: protectedProcedure
    .input(
      z.object({ userId: z.string(), context: chatContextSchema.optional() })
    )
    .query(async ({ ctx, input }) => {
      return getChats(input.userId, ctx.prisma, input.context)
    }),

  getResumableChat: protectedProcedure
    .input(z.object({ context: chatContextSchema.optional() }))
    .query(async ({ ctx, input }) => {
      return getResumableChat(ctx.session.user.id, ctx.prisma, input.context)
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
      const { chatId, messages, filterIds, context } = input
      const userId = ctx.session.user.id
      return upsertChat(
        chatId,
        messages,
        ctx.prisma,
        userId,
        context,
        filterIds
      )
    }),

  /**
   * Api to generate a recipe by clicking on a recipe to generate.
   * Adds ingredients and instructions to the recipe
   */
  generated: protectedProcedure
    .input(generatedSchema)
    .mutation(async ({ ctx, input }) => {
      return generated(ctx.prisma, input, ctx.session.user.id)
    })
})
