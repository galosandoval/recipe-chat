import { cuid } from '~/lib/createId'
import { type MessageWithRecipes } from '~/schemas/chats-schema'

export function userMessageDTO(
  content: string,
  chatId?: string
): MessageWithRecipes {
  return {
    content,
    role: 'user',
    id: cuid(),
    chatId: chatId ?? '',
    createdAt: new Date(),
    updatedAt: new Date(),
    recipes: []
  }
}
