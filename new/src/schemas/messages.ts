import { z } from 'zod'

export const messagesSchema = z.array(
  z.object({
    content: z.string().min(1),
    role: z.enum(['system', 'user', 'assistant', 'function', 'data', 'tool']),
    id: z.string().optional()
  })
)
