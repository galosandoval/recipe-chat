'use client'

import { useParams } from 'next/navigation'

export function useRecipeSlug() {
  const { slug } = useParams()
  return slug as string
}
