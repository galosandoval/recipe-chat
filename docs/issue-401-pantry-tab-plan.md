# Issue #401: New pantry tab — Implementation plan

**Status:** OPEN  
**Labels:** enhancement  
**Source:** [GitHub Issue #401](https://github.com/recipe-chat/recipe-chat-v1/issues/401)

---

## Summary

Add a **Pantry** tab where users can save what they have on hand (with quantities and units). Use that data in the existing chat so the AI suggests recipes based on available ingredients. Support unit math (e.g. 2 kg − 300 g), optional preferred units at onboarding, and easier entry (e.g. bulk paste + parse).

---

## Acceptance criteria

- [ ] New **Pantry** tab in the app nav (alongside Chat, List, Recipes).
- [ ] Users can **save pantry items** (item + quantity + unit), view and edit them.
- [ ] **AI suggests recipes** from chat using the user’s pantry (e.g. “what can I make with what I have?”).
- [ ] **Unit handling**: support math across same-type units (e.g. 2 kg − 300 g); consider cross-type (e.g. 2 kg − 1 oz) via conversion or clear UX.
- [ ] **Preferred unit** option for users (e.g. during onboarding or settings): weight (g vs oz) and/or volume (ml vs cup).
- [ ] **Bulk / easy upload**: avoid one-by-one only; support pasted list and/or AI parse of “items and amounts”.

---

## Changes required

### 1. `prisma/schema.prisma`

- Add **Pantry** model: 1:1 with User (e.g. `id`, `userId` unique).
- Either add **PantryItem** (quantity, unit, unitType, itemName, pantryId) or reuse **Ingredient** with optional `pantryId` and keep `listId`/`recipeId` nullable. Reusing Ingredient reuses parsing and display; a dedicated PantryItem keeps list vs pantry semantics clearer.
- Optional: add `User.preferredWeightUnit` and `User.preferredVolumeUnit` (e.g. `String?`) for display/conversion.
- Optional: add `pantry` to **Feature** enum if onboarding includes pantry/preferred-units step.

### 2. `src/app/[lang]/navbar/navbar.tsx`

- Add a fourth nav item (e.g. `{ value: '/pantry', icon: <PantryIcon />, label: 'pantry' }`) to `MENU_ITEMS` and ensure active state uses `pathname.includes('/pantry')`.

### 3. `src/app/[lang]/pantry/page.tsx` (new)

- Auth guard (redirect if no session), prefetch pantry data, render a client component that lists pantry items, add one, bulk add (paste + parse), edit/delete, and optionally “use in chat” or deep link to chat with pantry context.

### 4. Pantry API (new router + use-cases + data-access)

- **Router**: e.g. `pantry.byUserId`, `pantry.add`, `pantry.update`, `pantry.delete`, `pantry.bulkAdd` (accept array of parsed or raw strings). Mirror patterns from `lists-router.ts` and `lists-use-case.ts`.
- **Data access**: get pantry by userId, CRUD pantry items (or ingredients with `pantryId`). Reuse `ingredientStringToCreatePayload` and `parseIngredientName` from `src/lib/parse-ingredient.ts` for single and bulk add.

### 5. `src/constants/chat.ts` — `buildSystemPrompt`

- Extend to accept optional `pantrySummary: string[]` or structured pantry lines (e.g. “2 kg chicken”, “300 g rice”). Add a line to the system prompt such as: “User’s pantry (what they have on hand): … Prefer suggesting recipes that use mainly these ingredients when the user asks what to make or similar.”

### 6. `src/app/api/chat/route.ts`

- Parse `chatParams` to include optional `pantryItems` or `pantrySummary` (e.g. from request body). Load pantry for `userId` if not provided in the request, then pass a short summary (e.g. array of display strings) into `buildSystemPrompt({ filters, savedRecipes, pantrySummary })`.

### 7. Chat client (e.g. `generate-message-form.tsx` or where submit is built)

- When calling the chat API, include pantry in the payload: e.g. prefetch `pantry.byUserId` and send a summary (or flag “use pantry”) so the backend or route can inject pantry into the system prompt.

### 8. Unit conversion and preferred units

- **New lib** (e.g. `src/lib/unit-conversion.ts`): define canonical base units (e.g. grams for weight, ml for volume). Implement `toCanonical(quantity, unit)` and `fromCanonical(amount, toUnit)` for weight and volume; count units pass through. Use in pantry when subtracting (e.g. “used 300 g” from “2 kg”) and when displaying in preferred unit.
- **Preferred units**: read `User.preferredWeightUnit` / `preferredVolumeUnit` where needed (pantry display, optional chat recipe output). If not set, keep current behavior (e.g. display in stored unit).

### 9. Onboarding / settings for preferred unit

- Where onboarding or profile/settings are implemented, add a step or section: “Preferred weight unit: g / oz” and “Preferred volume unit: ml / cup (or tbsp)” and persist on User. If onboarding is feature-gated, add a `pantry` or `preferredUnits` feature and show this when that feature is introduced.

### 10. Bulk add / AI parse

- **Option A (simpler):** “Paste list” textarea; split by newlines, run `parseIngredientName` (or `ingredientStringToCreatePayload`) per line; show preview, then call `pantry.bulkAdd` with parsed items.
- **Option B:** New API route or tRPC procedure that accepts a block of text and returns parsed ingredients (same parsing or an AI call that returns structured lines); then call `pantry.bulkAdd` with the result. Use Option A first; add Option B if UX demands it.

### 10b. Photo and other upload methods (enhanced UX)

Beyond paste + parse, consider these ways to get pantry items in with less friction:

| Method | Description | Implementation idea |
|--------|-------------|---------------------|
| **Photo of fridge / pantry shelf** | User takes or uploads a photo; AI extracts visible food/ingredients. | **Vision API** (e.g. OpenAI GPT-4o or similar with image input): send image + prompt like “List every food or ingredient you can see. For each, output one line: quantity and unit if visible (e.g. 2 kg chicken), otherwise just the item name (e.g. milk). One ingredient per line, no numbering.” Return plain text lines → feed into existing `pantry.bulkAdd({ rawLines })` and show preview so user can edit before saving. Reuses all current parsing and unit handling. |
| **Voice / dictation** | User speaks “I have milk, two kilos of rice, and a bag of onions.” | **Speech-to-text** (browser `SpeechRecognition` or provider API) → single string or paragraph → same as Option B: AI or rule-based parse into one-line-per-ingredient → `pantry.bulkAdd`. Good for “I’m in the kitchen” flow. |
| **Receipt scan** | Photo of a grocery receipt. | Same as fridge photo but with a **receipt-specific prompt**: “From this receipt, list each food/grocery item as one line. Include quantity and unit if shown (e.g. 1 lb tomatoes). One item per line.” Then same pipeline: lines → preview → `pantry.bulkAdd`. |
| **Barcode scan** (future) | Scan product barcode, lookup product name (and optionally size). | Requires barcode API or DB; add item by name (and optional quantity/unit). Lower priority; can be a later enhancement. |

**Recommended first enhancement: photo of fridge/pantry**

- **Why:** One tap (camera or gallery) instead of typing or pasting; fits “I’m standing in front of the fridge” use case.
- **Flow:** Pantry tab → “Add from photo” → capture/upload image → call new API (e.g. `POST /api/pantry/parse-image` or tRPC `pantry.parseImage`) that uses vision model → returns `{ rawLines: string[] }` → UI shows preview (same as bulk paste) → user confirms/edits → `pantry.bulkAdd({ rawLines })`.
- **Tech:** Reuse existing OpenAI setup; use a vision-capable model (e.g. `gpt-4o` or `gpt-4-turbo` with image part). Keep image out of tRPC if payloads get large; a dedicated API route that returns only the extracted lines is simpler. No schema changes; no change to `bulkAdd` contract.
- **Cost/privacy:** Vision calls cost more than text; consider file size limits and optional “don’t store image” (process and discard). Add i18n for “Add from photo”, “Take picture of your fridge or pantry”, “Review and add to pantry”.

### 11. Translations

- **`public/translations/en.json`** (and any other locale): under `nav`, add `"pantry": "Pantry"`. Add a `pantry` section (e.g. `noItems`, `addItem`, `bulkAdd`, `useInChat`, `preferredUnit`, etc.) for all new UI strings.

### 12. `src/server/api/routers/root.ts`

- Add `pantry: pantryRouter` so the new router is mounted.

---

## Implementation steps

1. **Schema and migration** — Add Pantry (and optionally PantryItem or reuse Ingredient with pantryId). Add optional preferredWeightUnit / preferredVolumeUnit on User. Run migration.
2. **Unit conversion** — Implement `src/lib/unit-conversion.ts` with weight/volume conversion and use it where quantities are updated or displayed (e.g. pantry deduct).
3. **Pantry API** — Data-access layer for pantry (by user, CRUD items). Use-cases for add, update, delete, bulkAdd (using parse-ingredient). tRPC router and mount in root.
4. **Pantry tab UI** — Create `[lang]/pantry/page.tsx` and client components: list, add-one form, bulk paste + parse, edit/delete. Use existing ingredient display/parsing and new conversion lib for display in preferred unit if desired.
5. **Nav and i18n** — Add Pantry to MENU_ITEMS, add translations for nav and pantry screen.
6. **Chat integration** — Extend chatParams and chat API to accept/load pantry; extend buildSystemPrompt with pantry summary; from chat client send pantry (or “use my pantry”) when user is asking for recipes from what they have.
7. **Preferred units** — Add onboarding/settings step for preferred weight/volume; persist on User and use in pantry (and optionally in chat) for display/conversion.
8. **Polish** — Deduct from pantry when “using” in a recipe (optional): either manual “used X” or future link from generated recipe to pantry deduction. Handle edge cases (e.g. 2 kg − 1 oz) via conversion or “different unit” UX.
9. **Photo upload (optional)** — Add “Add from photo” on pantry: API route or tRPC that accepts an image, calls vision model to extract ingredient lines, returns `rawLines`; UI preview → `pantry.bulkAdd`. Receipt scan can reuse the same pipeline with a different prompt.

---

## Testing

- **Pantry CRUD**: Add, edit, delete pantry items; bulk add from pasted list; list shows correct quantities and units.
- **Unit conversion**: Subtract 300 g from 2 kg → 1.7 kg; display in oz when user prefers oz.
- **Chat**: With pantry populated, ask “What can I make with what I have?” and confirm suggestions align with pantry; with empty pantry, behavior unchanged.
- **Nav**: Pantry tab appears and is active on `/pantry`; all four tabs work.
- **Preferred units**: Set g vs oz (and ml vs cup) and confirm pantry and any converted displays respect it.
- **i18n**: All new strings exist in en (and other locales) and render correctly.
- **Photo upload** (if implemented): Upload fridge/pantry image → preview shows plausible ingredient lines → confirm adds them to pantry; invalid/empty image handled gracefully.

---

## Notes

- **List vs Pantry**: List = shopping list (things to buy). Pantry = what you have. Reusing Ingredient with pantryId avoids duplicate parsing/display but blurs “list” vs “pantry”; a separate PantryItem keeps them distinct and may simplify queries (e.g. “only list ingredients”).
- **Cross-unit math (2 kg − 1 oz)**: Implement via conversion to a canonical unit (e.g. grams), subtract, then convert back to display unit. The conversion lib should support oz ↔ g and similar.
- **AI parse**: Starting with line-by-line parsing keeps scope smaller; an AI-based “paste a paragraph” parser can be a follow-up.
- **Performance**: If pantry is large, send a summarized or truncated list to the system prompt (e.g. top 50 items or by category) to stay within token limits.
