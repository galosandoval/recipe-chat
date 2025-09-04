'use client'

import { createContext, useContext, useMemo } from 'react'
import type { getTranslations } from '~/lib/get-translations'

export type AwaitedTranslations = Awaited<ReturnType<typeof getTranslations>>

// Type utility to extract all possible nested key paths
type PathsToStringProps<T> = T extends string
  ? ''
  : T extends object
    ? {
        [K in keyof T]: T[K] extends string
          ? K extends string
            ? K
            : never
          : T[K] extends object
            ? K extends string
              ? `${K}.${PathsToStringProps<T[K]>}`
              : never
            : never
      }[keyof T]
    : never

// Flatten the union type to get all possible paths
type Flatten<T> = T extends infer U ? U : never
export type AllPaths<T> = Flatten<PathsToStringProps<T>>

type TranslationMethods<T> = {
  replace(path: AllPaths<T>, ...args: string[]): string
  get(path: AllPaths<T>): string
}

// Enhanced translations type that adds replace methods to nested objects
export type Translations<T = AwaitedTranslations> = {
  [K in keyof T]: T[K] extends string
    ? T[K]
    : T[K] extends object
      ? Translations<T[K]> & TranslationMethods<T[K]>
      : T[K]
} & TranslationMethods<T>

export type TPaths = AllPaths<Translations>

/**
 * Translation class that provides both direct property access and variable substitution
 */
class TranslationClass {
  private translations: Translations
  private cache = new Map<string, string>()

  constructor(translations: Translations) {
    this.translations = translations
  }

  /**
   * Get a nested translation value with caching
   */
  get(path: string): string {
    // Check cache first
    if (this.cache.has(path)) {
      console.log('cache hit', path)
      return this.cache.get(path)!
    }

    const keys = path.split('.')
    let value: any = this.translations

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        // Cache the path as fallback
        this.cache.set(path, path)
        return path
      }
    }

    const result = typeof value === 'string' ? value : path
    // Cache the result
    this.cache.set(path, result)
    return result
  }

  /**
   * Call a translation with variable substitution
   * @param path - The translation path (e.g., 'hello.world')
   * @param args - Arguments to substitute for $1, $2, etc.
   */
  replace(path: string, ...args: string[]): string {
    const translation = this.get(path)

    console.log('no args', path, translation)
    if (typeof translation !== 'string') {
      return path
    }

    // Early return if no arguments to substitute
    if (args.length === 0) {
      console.log('no args', path, translation)
      return translation
    }

    // Replace $1, $2, etc. with the provided arguments
    return translation.replace(/\$(\d+)/g, (match, index) => {
      const argIndex = parseInt(index) - 1
      return args[argIndex] !== undefined ? args[argIndex] : match
    })
  }

  /**
   * Create an enhanced translations object with replace methods on nested objects
   * Uses shallow copy for better performance
   */
  createEnhanced(): Translations {
    // Use shallow copy instead of deep copy for better performance
    const enhanced = { ...this.translations } as Translations

    // Add the root replace method
    enhanced.replace = this.replace.bind(this)
    enhanced.get = this.get.bind(this)
    // Add replace methods to nested objects
    this.addReplaceMethods(enhanced, '', this)

    return enhanced
  }

  /**
   * Recursively add replace methods to nested objects
   * Optimized to avoid unnecessary object creation
   */
  private addReplaceMethods(
    obj: any,
    path: string,
    translationClass: TranslationClass
  ): void {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]
        const currentPath = path ? `${path}.${key}` : key

        if (
          value &&
          typeof value === 'object' &&
          typeof value !== 'function' &&
          !Array.isArray(value)
        ) {
          // Add replace method to this nested object
          value.replace = (subKey: string, ...args: string[]) => {
            const fullPath = `${currentPath}.${subKey}`
            return translationClass.replace(fullPath, ...args)
          }

          // Recursively process deeper nested objects
          this.addReplaceMethods(value, currentPath, translationClass)
        }
      }
    }
  }

  /**
   * Clear cache to free memory
   */
  clearCache(): void {
    this.cache.clear()
  }
}

export const TranslationsContext = createContext<Translations | null>(null)

export const useTranslations = (): Translations => {
  const translations = useContext(TranslationsContext)

  if (!translations) {
    throw new Error('useTranslations must be used within a TranslationsContext')
  }

  // Memoize the enhanced translations to avoid recreating on every render
  return useMemo(() => {
    const translationClass = new TranslationClass(translations)
    return translationClass.createEnhanced()
  }, [])
}
