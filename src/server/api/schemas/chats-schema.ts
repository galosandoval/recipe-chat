import z from 'zod'
import { messagesWithRecipesSchema } from '~/schemas/chats-schema'
import { userIdSchema } from '~/schemas/ids-schema'

export const createChatWithMessagesSchema = z
  .object({
    messages: messagesWithRecipesSchema
  })
  .merge(userIdSchema)
export type CreateChatWithMessages = z.infer<
  typeof createChatWithMessagesSchema
>
