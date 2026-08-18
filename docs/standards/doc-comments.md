# Documentation Comments

## Prefer JSDoc/TSDoc over inline comments

When a comment documents _what_ a function, type, hook, component, constant, or
other named declaration is or does, write it as a **JSDoc/TSDoc block**
(`/** ... */`) directly above the declaration — not as an inline (`//`) comment.

The reason: JSDoc/TSDoc blocks attach to the symbol, so hovering over the
implementation **or any usage** surfaces the doc in the editor and in generated
type docs. An inline `//` comment is invisible at the call site.

```ts
/**
 * Formats a price in cents as a localized currency string.
 *
 * @param cents - The amount in cents
 * @param currency - ISO 4217 currency code (defaults to "USD")
 * @returns The formatted currency string, e.g. "$12.50"
 */
function formatPrice(cents: number, currency = 'USD') {
  // ...
}
```

## When to still use inline comments

- Explaining a specific line or block _inside_ a function body (the "why" behind
  a tricky bit of logic)
- `// TODO` / `// FIXME` / `// HACK` notes
- Anything that isn't documenting a named declaration

## Guidelines

- Don't restate types TypeScript already expresses — let `@param`/`@returns` add
  meaning, not noise. Omit them entirely when the signature is self-explanatory
  and a one-line summary is enough.
- Keep the summary line short and imperative; add `@param`, `@returns`,
  `@throws`, `@example`, `@deprecated` only when they add information.
- This is about comments you choose to write — not every declaration needs a doc
  block. Prefer self-explanatory names first; document when it genuinely helps.
