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
  'kosher'
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
  cuisinePreferences: z.array(z.string()).default([]),
  cookingSkill: z.enum(cookingSkillOptions, {
    message: 'Select your cooking skill level'
  }),
  householdSize: z
    .number()
    .int()
    .min(1, 'Household size must be at least 1')
    .max(10, 'Household size can be at most 10')
    .default(2),
  healthGoals: z.array(z.string()).default([])
})

export type TasteProfileSchema = z.infer<typeof tasteProfileSchema>

/** Single source of truth for a fresh taste profile (new users, loading fallback). */
export const tasteProfileDefaults: TasteProfileSchema = {
  dietaryRestrictions: [],
  cuisinePreferences: [],
  cookingSkill: 'intermediate',
  householdSize: 2,
  healthGoals: []
}
