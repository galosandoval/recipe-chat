import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import {
	getChats,
	getMessagesById,
	createChat,
	addMessages,
	createChatOrAddMessages
} from '~/server/api/use-cases/chats'
import { messagesSchema } from '../../../schemas/messages'

export const chatsRouter = createTRPCRouter({
	getChats: protectedProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			return getChats(input.userId, ctx.db)
		}),

	getMessagesById: protectedProcedure
		.input(
			z.object({
				chatId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			return getMessagesById(input.chatId, ctx.db)
		}),

	create: protectedProcedure
		.input(
			z.object({
				messages: messagesSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id
			return createChat(userId, input.messages, ctx.db)
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
			return addMessages(chatId, messages, ctx.db)
		}),

	createOrAddMessages: protectedProcedure
		.input(
			z.object({
				chatId: z.string().optional(),
				messages: messagesSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { chatId, messages } = input
			const userId = ctx.session.user.id
			return createChatOrAddMessages(chatId, messages, ctx.db, userId)
		})
})
