import { createId } from '@paralleldrive/cuid2'
import { type MessageWithRecipes } from '~/schemas/chats'

export function userMessageDTO(
  content: string,
  chatId?: string
): MessageWithRecipes {
  return {
    content,
    role: 'user',
    id: createId(),
    chatId: chatId ?? '',
    createdAt: new Date(),
    updatedAt: new Date(),
    recipes: []
  }
}
