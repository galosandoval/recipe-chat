import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import {
	getChats,
	getMessagesById,
	createChat,
	addMessages,
	createChatOrAddMessages,
	getChat
} from '~/server/api/use-cases/chats'
import { messagesSchema } from '../../../schemas/messages'

export const chatsRouter = createTRPCRouter({
	getChats: protectedProcedure
		.input(z.object({ userId: z.string() })) // input userId for trpc cache invalidation
		.query(async ({ ctx, input }) => {
			return await getChats(input.userId, ctx.db)
		}),

	getChat: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return await getChat(input.id, ctx.db)
		}),

	getMessagesById: protectedProcedure
		.input(
			z.object({
				chatId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			return await getMessagesById(input.chatId, ctx.db)
		}),

	create: protectedProcedure
		.input(
			z.object({
				messages: messagesSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			return await createChat(ctx.session.user.id, input.messages, ctx.db)
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
			return await addMessages(chatId, messages, ctx.db)
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
			return await createChatOrAddMessages(
				chatId,
				messages,
				ctx.db,
				ctx.session.user.id
			)
		})
})
