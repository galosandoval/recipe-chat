import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import {
  generated,
  getChats,
  getMessagesById,
  getResumableChat,
  getResumableChatWithMessages,
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
    .query(async ({ input }) => {
      return getChats(input.userId, input.context)
    }),

  getResumableChat: protectedProcedure
    .input(z.object({ context: chatContextSchema.optional() }))
    .query(async ({ ctx, input }) => {
      return getResumableChat(ctx.session.user.id, input.context)
    }),

  /**
   * Resume state for a Chat Context in one round-trip. Prefer this over
   * `getResumableChat` + `getMessagesById` when seeding a page's chat surface
   * server-side (see `app/chat/page.tsx`).
   */
  getResumableChatWithMessages: protectedProcedure
    .input(z.object({ context: chatContextSchema.optional() }))
    .query(async ({ ctx, input }) => {
      return getResumableChatWithMessages(ctx.session.user.id, input.context)
    }),

  getMessagesById: protectedProcedure
    .input(
      z.object({
        chatId: z.string()
      })
    )
    .query(async ({ input }) => {
      return getMessagesById(input.chatId)
    }),

  upsert: protectedProcedure
    .input(upsertChatSchema)
    .mutation(async ({ ctx, input }) => {
      const { chatId, messages, filterIds, context } = input
      const userId = ctx.session.user.id
      return upsertChat(chatId, messages, userId, context, filterIds)
    }),

  /**
   * Api to generate a recipe by clicking on a recipe to generate.
   * Adds ingredients and instructions to the recipe
   */
  generated: protectedProcedure
    .input(generatedSchema)
    .mutation(async ({ ctx, input }) => {
      return generated(input, ctx.session.user.id)
    })
})
