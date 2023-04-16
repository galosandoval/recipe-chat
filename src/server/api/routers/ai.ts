import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { createTRPCRouter, publicProcedure } from '../trpc'

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

// export const authSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(4).max(14)
// })

// export type AuthSchemaType = z.infer<typeof authSchema>

const messages = [
  {
    role: 'system',
    content: 'You are a helpful assistant that only generates recipes.'
  },
  { role: 'user', content: "I'm feeling saucy." }
] satisfies ChatCompletionRequestMessage[]

export const aiRouter = createTRPCRouter({
  generate: publicProcedure
    // .input(authSchema)
    .query(async ({ input }) => {
      const chatGPT = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages
      })

      const chatGPTMessage = chatGPT.data.choices[0].message

      return chatGPTMessage
    })
})
