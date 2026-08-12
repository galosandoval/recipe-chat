# React Preferences

## Props & typing

- Inline props types in the function signature — don't create a separate
  interface/type above the component unless reused.
- If the inline types are getting cluttered, that's a signal the component may be
  doing too much — rethink the architecture (split the component, compose
  differently) rather than just extracting a type.
- Export the type when it's reused in other files; move it to a dedicated file
  only when it's widely reused.

## Components

- Use function declarations for components (`function MyComponent()`, not
  `const MyComponent = () =>`).
- Destructure props in the signature
  (`({ title, onClick }: { title: string; onClick: () => void })`).

## Hooks & state

- Infer return types on custom hooks — don't annotate unless the type is complex
  or ambiguous.
- Separate `useState` per value — prefer individual calls over grouping into
  objects.
- Call store actions via the destructured selector, not `store.getState().setX()`.
  Actions are stable, so this is safe and reads better.
  - Exception: `store.getState()` is fine (and preferred) for reading **mutable
    state** inside async callbacks / event handlers, where a destructured value
    would be a stale closure. Only the setter calls should be destructured.

```ts
// avoid
useChatStore.getState().setPendingExpandRecipeId(id)
// prefer
const { setPendingExpandRecipeId } = useChatStore()
setPendingExpandRecipeId(id)

// still correct — fresh read in an async handler
const chatId = useChatStore.getState().chatId
```

## JSX patterns

- Early returns for conditional rendering (`if (!data) return null` at the top).
- Extract complex conditions into named variables (`const isVisible = x && y`).
- No nested ternaries in JSX — use early returns or if/else instead.
- Self-close tags with no children (`<Component />`).

## Mobile-first layout

This app is used primarily on phones. Design and build every UI for a small
touch screen first, then widen.

- Unprefixed Tailwind classes = the phone layout. `sm:`/`md:`/`lg:` are additive
  overrides for bigger screens only — never write a desktop layout and shrink it.
- Prefer thumb-reachable interactions (scroll, swipe, snap, bottom-anchored
  controls) over precise pointer ones. Tap targets ≥44px.
- Assume one column, no hover, and a soft keyboard eating half the viewport. Use
  `dvh`, not `vh`.
- When verifying a change in a browser or with Playwright, check a phone
  viewport first.

## Organization

- Only export the top-level component from a file — sub-components stay
  unexported in the same file. If a sub-component needs exporting, move it to its
  own file.
- Co-locate styles with components (same directory).
- No barrel exports — import directly from the file, no `index.ts` re-exports.
