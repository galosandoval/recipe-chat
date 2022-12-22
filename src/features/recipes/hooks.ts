import * as http from '../../client'
import { Recipe } from '@prisma/client'
import { z } from 'zod'
import {
  ParsedRecipe,
  ParseRecipeSchema
} from '../../pages/api/recipes/parse-url'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CreateRecipeParams } from '../../pages/api/recipes/create'

export const recipeKeys = {
  all: ['recipes'] as const,
  parsed: () => [...recipeKeys.all, 'parsed'] as const
}

type FetchRecipesReq = {
  userId: number
}

export type FetchRecipesRes = {
  recipe: Recipe
}

const fetchRecipesParams = {
  userId: 1
}

export const fetchRecipes = () =>
  http.post<FetchRecipesReq, FetchRecipesRes[]>(
    'http://localhost:3000/api/recipes',
    fetchRecipesParams
  )

export const useRecipes = () =>
  useQuery({
    queryKey: recipeKeys.all,
    queryFn: fetchRecipes
  })

export type ParseRecipeParams = z.infer<typeof ParseRecipeSchema>

const parseRecipe = (params: ParseRecipeParams) =>
  http.post<ParseRecipeParams, ParsedRecipe>(
    'http://localhost:3000/api/recipes/parse-url',
    params
  )

export const useParseRecipe = () =>
  useMutation({
    mutationFn: (params: ParseRecipeParams) => parseRecipe(params)
  })

const createRecipe = (params: CreateRecipeParams) =>
  http.post<CreateRecipeParams, FetchRecipesRes[]>(
    'http://localhost:3000/api/recipes/create',
    params
  )

export const useCreateRecipe = (onSuccess: () => void) =>
  useMutation({
    mutationFn: (params: CreateRecipeParams) => createRecipe(params),
    onSuccess
  })
