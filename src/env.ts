import { z } from 'zod'

const envVariables = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.string(),
  NEXT_PUBLIC_NEXTAUTH_SECRET: z.string(),
  OPENAI_API_KEY: z.string(),
  PORT: z.string()
})

envVariables.parse(process.env)

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
