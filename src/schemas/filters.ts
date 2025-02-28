import { z } from 'zod'

export const getFiltersByUserIdSchema = z.object({ userId: z.string().cuid() })
export type GetFiltersByUserIdSchema = z.infer<typeof getFiltersByUserIdSchema>

export const createFilterSchema = z.object({
	name: z.string().min(3).max(20),
	filterId: z.string()
})
export type CreateFilterSchema = z.infer<typeof createFilterSchema>

export const deleteFilterSchema = z.object({
	filterId: z.string().cuid2()
})
export type DeleteFilterSchema = z.infer<typeof deleteFilterSchema>

export const checkFilterSchema = z.object({
	filterId: z.string().cuid2(),
	checked: z.boolean()
})
export type CheckFilterSchema = z.infer<typeof checkFilterSchema>
