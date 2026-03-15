import { z } from 'zod'

export const cookingSkillOptions = [
  'beginner',
  'intermediate',
  'advanced'
] as const

export const dietaryRestrictionOptions = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'keto',
  'paleo',
  'halal',
  'kosher',
  'none'
] as const

export const cuisineOptions = [
  'Mexican',
  'Italian',
  'Thai',
  'Indian',
  'Japanese',
  'Chinese',
  'Mediterranean',
  'American',
  'Korean',
  'French'
] as const

export const healthGoalOptions = [
  'high-protein',
  'low-carb',
  'low-sodium',
  'heart-healthy',
  'balanced'
] as const

export const tasteProfileSchema = z.object({
  dietaryRestrictions: z.array(z.string()).default([]),
  cuisinePreferences: z.array(z.string()).min(1, 'Select at least one cuisine'),
  cookingSkill: z.enum(cookingSkillOptions),
  householdSize: z.number().int().min(1).max(10).default(2),
  healthGoals: z.array(z.string()).default([])
})

export type TasteProfileSchema = z.infer<typeof tasteProfileSchema>
