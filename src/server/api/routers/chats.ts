import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import {
	getChats,
	createChat,
	addMessages,
	createChatOrAddMessages,
	getChat
} from '~/server/api/use-cases/chats'
import { createOrAddMessages, messagesSchema } from '~/schemas/chats'

export const chatsRouter = createTRPCRouter({
	getChats: protectedProcedure
		.input(z.object({ userId: z.string() })) // input userId for trpc cache invalidation
		.query(async ({ ctx, input }) => {
			return await getChats(input.userId, ctx.db)
		}),

	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return await getChat(input.id, ctx.db)
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
			return await addMessages(
				chatId,
				messages,
				ctx.db,
				ctx.session.user.id
			)
		}),

	createOrAddMessages: protectedProcedure
		.input(createOrAddMessages)
		.mutation(async ({ ctx, input }) => {
			return await createChatOrAddMessages(
				input,
				ctx.db,
				ctx.session.user.id
			)
		})
})
