# Third-Party Library Encapsulation

## Why encapsulate

Wrap third-party libraries in custom hooks or utilities to:

- Add type safety and autocomplete the library may lack
- Simplify the API for this app's specific use case
- Make it easy to swap implementations later
- Centralize configuration and defaults

## Pattern

Wrap the library in a custom hook — kept in the file that uses it, and moved to
`hooks/` once a second file needs it (see
[typescript-style.md](typescript-style.md) on colocation):

```ts
// hooks/use-translations.ts
import { useTranslations as useNextIntlTranslations } from 'next-intl'
import type messages from '@/messages/en.json'

type Messages = typeof messages
type Namespace = keyof Messages
type NamespacedKey<N extends Namespace> = keyof Messages[N] & string

export function useTranslation<N extends Namespace>(namespace: N) {
  const t = useNextIntlTranslations(namespace) as any
  return {
    t: (key: NamespacedKey<N>) => t(key) as string
  }
}
```

## When to apply

- i18n libraries (next-intl, react-i18next)
- Form libraries (react-hook-form)
- State management (zustand)
- Any library where you want stricter types or a simpler API

## When not to encapsulate

A thin pass-through — a wrapper whose body is one library call with no added
type safety, simplification, or config centralization — doesn't earn a wrapper.
Call the library directly at the call site instead. Forwarding arguments and
return values 1:1 is indirection without benefit.

**If unsure**: if the library were swapped out tomorrow, would call sites need to
change anyway because they use library-specific types/options directly? If yes,
wrap it. If the wrapper would just rename the library's function, don't.
