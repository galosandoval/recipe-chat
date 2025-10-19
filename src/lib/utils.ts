import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { nanoId } from './createId'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function slugifyBase(input: string, maxLen = 60) {
  const base = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-') // non-alnum → hyphen
    .replace(/^-+|-+$/g, '') // trim hyphens
    .replace(/-{2,}/g, '-') // collapse hyphens
    .slice(0, maxLen)
    .replace(/^-+|-+$/g, '')
  return base || 'recipe'
}

export function slugify(title: string) {
  const base = slugifyBase(title)
  const suffix = nanoId() // 6-char unique suffix
  return `${base}-${suffix}`
}
