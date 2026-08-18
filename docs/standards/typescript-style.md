# TypeScript Style

**Guiding principle:** When you look at any given piece of code, you should be
able to tell what everything does. Names, structure, and size should make each
part self-explanatory without hunting through the file or jumping elsewhere.

Size numbers below are soft signals for _reconsider this_, not hard limits. The
default answer to "this file is long" is to extract **within the same file** —
only reuse across files justifies a new file.

## Size guidelines

### React components

- **100–125 lines** is a good time to consider extracting per component file.
- When a component grows beyond this, consider:
  - Extracting sub-components (keep them in the same file unless reused elsewhere)
  - Moving logic to custom hooks
  - Splitting into smaller, focused pieces

### Functions, methods, and classes

- **~80 lines** is a good time to consider extracting (helpers, private methods,
  smaller units).
- When a function grows large, consider:
  - Extracting helper functions **in the same file**, placed nearby
  - Breaking into smaller, single-responsibility functions
  - Using early returns to reduce nesting

## Colocation

- **Keep code close to where it's used** — helper functions, hooks, and
  sub-components live near their consumers.
- **Don't export unless needed elsewhere** — keep functions unexported until
  they're actually used in other files.
- **Only extract to a separate file when reused.** If a function is used in one
  place, it stays in that file.
- **Tests are colocated** — the test file sits directly beside the prod file (no
  `__tests__/` directories). Backend / Node tests need the
  `@jest-environment node` docblock at the top (the default environment is jsdom).

## When a file gets large

1. **Check if the code is reused** — only extract to a separate file if it is.
2. **Extract custom hooks** — stateful logic and side effects into dedicated
   hooks (same file first, separate file only if reused).
3. **Create sub-components** — split the UI, keeping the pieces in the same file
   unless reused.
4. **Consider composition** before new files.
