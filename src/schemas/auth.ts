import { z } from 'zod'

export const signUpSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6).max(20)
})
export type SignUpSchema = z.infer<typeof signUpSchema>
