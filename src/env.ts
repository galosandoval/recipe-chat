import { z } from 'zod'

const envVariables = z.object({
  DATABASE_URL: z.string(),
  DATABASE_PRISMA_URL: z.string(),
  DATABASE_URL_NON_POOLING: z.string(),
  NODE_ENV: z.string(),
  NEXTAUTH_SECRET: z.string(),
  OPENAI_API_KEY: z.string(),
  PORT: z.string()
})

envVariables.parse(process.env)

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof envVariables> { }
  }
}
