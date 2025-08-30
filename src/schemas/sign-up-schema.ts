import z from 'zod'

export const signUpSchema = z
  .object({
    email: z.string().email('emailRequired'),
    password: z.string().min(6, 'minChars6').max(20, 'maxChars20'),
    confirm: z.string().min(6, 'minChars6').max(20, 'maxChars20')
  })
  .refine((data) => data.confirm === data.password, {
    message: 'passwordsDontMatch',
    path: ['confirm']
  })

export type SignUpSchemaType = z.infer<typeof signUpSchema>
