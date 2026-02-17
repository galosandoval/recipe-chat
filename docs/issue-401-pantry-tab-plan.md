# Issue #401: New pantry tab — Implementation plan

**Status:** DONE (polish completed)  
**Labels:** enhancement  
**Source:** [GitHub Issue #401](https://github.com/recipe-chat/recipe-chat-v1/issues/401)

---

## Summary

Add a **Pantry** tab where users can save what they have on hand (with quantities and units). Use that data in the existing chat so the AI suggests recipes based on available ingredients. Support unit math (e.g. 2 kg − 300 g), optional preferred units at onboarding, and easier entry (e.g. bulk paste + parse).

---

## Current implementation (what’s done)

Use this as the source of truth for what exists in the codebase when continuing work.

### Implemented

- **Schema & migration** — `Pantry` 1:1 with User; `Ingredient` has optional `pantryId`; `User.preferredWeightUnit`, `User.preferredVolumeUnit`. Migration: `prisma/migrations/20260213000000_add_pantry_and_user_preferred_units/`.
- **Unit conversion** — `src/lib/unit-conversion.ts`: `toCanonical`, `fromCanonical`, `getUnitKind`, `subtractQuantities`, `PREFERRED_WEIGHT_OPTIONS`, `PREFERRED_VOLUME_OPTIONS`.
- **Pantry API** — `pantry-router.ts` (byUserId, add, update, delete, bulkAdd); `pantry-use-case.ts`; `pantry-access.ts`. Update re-parses `rawString` when provided (so structured fields stay in sync).
- **Pantry tab UI** — `src/app/[lang]/pantry/page.tsx` (auth guard, prefetch), `pantry-by-user-id.tsx`, `add-to-pantry-form.tsx`, `bulk-add-pantry.tsx`.
- **List row UX** — Each item with quantity/unit shows: **[−] [number input] [Badge(unit)] [+] item name** then edit/delete. Unit appears **after** the number; unit is in `~/components/ui/badge` (variant outline). Decrease/increase buttons use app icons (Minus/Plus); step 1 for count, 0.25 for weight/volume. Display uses preferred units when set.
- **Display helpers** — `src/lib/ingredient-display.ts`: `getIngredientDisplayText`, `getIngredientDisplayTextInPreferredUnits`, `getIngredientDisplayQuantityAndUnit` (returns `{ displayQuantity, displayUnit, unitType }` or null).
- **Nav** — Pantry in `MENU_ITEMS` in `navbar.tsx` (PackageIcon).
- **Chat integration** — `buildSystemPrompt` in `src/constants/chat.ts` accepts `pantrySummary`; `src/app/api/chat/route.ts` loads pantry by `userId` and passes summary; chat client sends `userId` so backend gets pantry. Chat page reads `?prompt=` and prefills input (for “Use in chat” link).
- **“Use in chat”** — Button/link in pantry (and in empty state) to `/[lang]/chat?prompt=What+can+I+make+with+what+I+have?`.
- **Edit pantry item** — Edit (pencil) opens drawer with single raw-line input; save calls `pantry.update` with `rawString` (use-case re-parses and updates structured fields).
- **Preferred units** — `users.updatePreferredUnits` API; “Preferred units” in nav settings dropdown (dialog: weight g/oz, volume ml/cup). Pantry list and quantity controls display in preferred unit when set.
- **i18n** — `pantry.*` and `nav.menu.preferredUnits`, `common.decrease`/`increase` in en + es.

### Key files to know

| Area              | Path |
|-------------------|------|
| Pantry list/row   | `src/app/[lang]/pantry/pantry-by-user-id.tsx` |
| Add one           | `src/app/[lang]/pantry/add-to-pantry-form.tsx` |
| Bulk add          | `src/app/[lang]/pantry/bulk-add-pantry.tsx` |
| Parsing           | `src/lib/parse-ingredient.ts` (`parseIngredientName`, `ingredientStringToCreatePayload`) |
| Display/convert   | `src/lib/ingredient-display.ts`, `src/lib/unit-conversion.ts` |
| Pantry API        | `src/server/api/routers/pantry-router.ts`, `use-cases/pantry-use-case.ts` |
| Settings units    | `src/app/[lang]/navbar/settings-dropdown-menu.tsx` (PreferredUnitsDialog) |
| Chat + pantry     | `src/constants/chat.ts`, `src/app/api/chat/route.ts`, `src/app/[lang]/chat/chat.tsx` |

---

## Remaining work / Next steps

Do these in a new chat (or in order below). Each item is self-contained with enough context.

### 1. Hide browser number spinners on pantry quantity input

- **Problem:** The number input in the pantry row shows the browser’s default increase/decrease arrows; we want only the app’s [−] and [+] buttons.
- **Approach:** Hide the spinners via CSS. The input is in `pantry-by-user-id.tsx` inside `PantryRow` (`<Input type='number' ... />`). Add a class that hides spinners (e.g. `[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none` or equivalent in your Tailwind/setup). Apply to that input (or globally for `type="number"` if desired).

### 2. Parse “2kg” / “kg2” style input (quantity + unit with no space)

- **Problem:** Input like “2kg chicken breast” or “kg2 chicken” does not get quantity and unit parsed; the parser expects a space between number and unit (e.g. “2 kg”).
- **Where:** `src/lib/parse-ingredient.ts`, function `parseIngredientName`.
- **Current behavior:** It matches leading quantity with `^(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?)\s+` (number then space) and unit with `^(fl\s+oz|...|[a-zA-Z]+)\s+` (unit then space). So “2kg” and “kg2” are not split.
- **Approach:** Before or alongside the existing logic, try to strip a leading “quantity+unit” or “unit+quantity” token with no space:
  - Number then unit (no space): e.g. `(\d+(?:\.\d+)?)\s*([a-zA-Z]+)` at start, then space or end. Match unit against `UNIT_MAP` (same keys as weight/volume/count). If matched, set `result.quantity`, `result.unit`, `result.unitType`, and set `rest` to the remainder (e.g. “chicken breast”).
  - Unit then number (no space): e.g. `([a-zA-Z]+)\s*(\d+(?:\.\d+)?)` at start. Same: resolve unit from `UNIT_MAP`, then set quantity and remainder.
- **Test cases:** “2kg chicken breast”, “kg2 chicken”, “2.5kg rice”, “1lb beef”, “lb1 beef”, “200g cheese”.

### 3. “Use in chat” disabled when empty + alert when no pantry items

- **Requirements:**
  - “Use in chat” should be **disabled** when there are no items in the pantry (both in the empty state and if we ever show the button elsewhere when count is 0).
  - Show an **alert** on the page when there are no pantry items. Use the shadcn Alert component.
- **Shadcn Alert:** Run `npx shadcn@latest add alert` in the project root, then use the exported `Alert`, `AlertTitle`, `AlertDescription` (or as the CLI adds them) in the pantry UI.
- **Where:** `src/app/[lang]/pantry/pantry-by-user-id.tsx`.
  - **Empty state:** When `ingredients.length === 0`, render the Alert (e.g. “No items in your pantry. Add ingredients below or use bulk paste.”) and keep the existing empty-state CTA. The “Use in chat” link/button in that empty view should be disabled (e.g. `disabled` + not navigable, or render as a disabled button with the same label).
  - **Non-empty state:** The “Use in chat” button is only shown when there are items; no change needed there except to ensure it’s never clickable when count is 0 (e.g. if state can be stale).
- **i18n:** Add a string for the empty-pantry alert message (e.g. `pantry.emptyAlert` or reuse/expand `pantry.noItems`) in `public/translations/en.json` and `es.json`.

### 4. Clear add-item input after successful add (pantry and list; consider global)

- **Problem:** User reported that the input to add an item in the pantry doesn’t get cleared after adding. The code currently calls `form.reset()` inside `onSubmit` **before** the mutation completes, so the field may clear immediately but the pattern is fragile (e.g. if we only want to clear on success).
- **Current pattern:** In `add-to-pantry-form.tsx`, `onSubmit` does `addToPantry({ rawLine, id })` then `form.reset()`. So reset runs synchronously on submit, not on mutation success. If the goal is “clear only on success”, move the reset into the mutation’s `onSuccess` (e.g. pass a callback or call `form.reset()` from a ref/callback provided to the mutation hook).
- **Approach:**
  - **Pantry:** In `add-to-pantry-form.tsx`, do **not** call `form.reset()` in `onSubmit`. In the `useAddToPantry` mutation, add `onSuccess: () => { form.reset() }`. That requires passing `form` (or a reset callback) into the hook or calling reset from the component after mutate (e.g. `mutate(..., { onSuccess: () => form.reset() })`).
  - **List:** Same idea in `src/app/[lang]/list/add-to-list-form.tsx`: clear the form in the mutation’s `onSuccess` (or in the `mutate` call’s `onSuccess`).
  - **Global (optional):** If other forms in the app should “clear on success”, consider a small pattern: e.g. a wrapper or convention where “add” forms pass an `onSuccess` that includes `form.reset()`, or document that add-type forms should reset in mutation `onSuccess` rather than in `onSubmit`.

---

## Optional / future (from original plan)

- **Deduct from pantry** when “using” in a recipe (manual “used X” or link from generated recipe).
- **Photo upload:** “Add from photo” → vision API → raw lines → preview → `pantry.bulkAdd`. See original plan “10b” for flow and prompts.
- **Onboarding:** Add pantry or preferred-units step to onboarding if feature-gated.

---

## Acceptance criteria (reference)

- [x] New **Pantry** tab in the app nav (alongside Chat, List, Recipes).
- [x] Users can **save pantry items** (item + quantity + unit), view and edit them.
- [x] **AI suggests recipes** from chat using the user’s pantry (e.g. “what can I make with what I have?”).
- [x] **Unit handling**: same-type conversion and display; preferred units in settings and list.
- [x] **Preferred unit** option (settings: weight g/oz, volume ml/cup).
- [x] **Bulk / easy upload**: paste list + parse; add one.
- [x] **Polish:** Hide number spinners; parse “2kg”/“kg2”; empty-state alert + disabled “Use in chat”; clear add form on success.

---

## Notes (context for next session)

- **List vs Pantry:** List = shopping list (things to buy). Pantry = what you have. We reuse `Ingredient` with `pantryId`; same parsing and display helpers.
- **Parser:** `parseIngredientName` in `parse-ingredient.ts` is used for both list and pantry. Any change to support “2kg”/“kg2” benefits both.
- **Pantry row:** Items **with** quantity/unit use the [−] input [Badge(unit)] [+] row; items **without** (e.g. raw string only) show a single line of text with edit/delete only. Display uses `getIngredientDisplayQuantityAndUnit` and preferred units from `api.users.get`.
- **Performance:** Chat system prompt uses `pantrySummary.slice(0, 80)` to cap tokens.
