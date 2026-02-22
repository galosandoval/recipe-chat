# V2 Roadmap — AI Context Document

> Auto-generated from GitHub issues labeled `v2-roadmap` (21 issues, all OPEN).
> Generated: 2026-02-21

## Overview

V2 is a **"Market Readiness & Monetization"** release. The strategy is:

1. **Monetize** via Stripe with three tiers: Free, Starter ($1/mo), Premium ($3/mo).
2. **Reduce AI costs** by building a recipe cache architecture (vector DB + semantic search router) so most requests are served from cache or cheaply tweaked, not fully regenerated with GPT-4 Turbo.
3. **Add user-facing features** gated by tier to justify paid plans.

---

## Dependency Graph (Build Order)

```
#428 Stripe Tiered Billing          ─┐
#429 Feature Gating System          ─┤── Foundation (enables all gated features)
#430 Onboarding Quiz                ─┘

#431 Vector Database Implementation ─┐
#432 Semantic Search Router          ├── Recipe Cache Architecture (cost reduction)
#433 The 90% Tweak Logic             │
#434 Recipe Deduplication Engine     ─┘
#435 Cold-Start Data Ingestion      ── (depends on #431, #434)
#436 Cost-Observability Dashboard   ── (depends on #432, #433)

All tier-gated features depend on #428 + #429.
```

---

## Infrastructure Issues (Build First)

### #428 — Stripe Tiered Billing [Priority 1/15]
**What:** Implement Stripe subscription billing with Free / Starter ($1/mo) / Premium ($3/mo) tiers.
**Key work:**
- Stripe Checkout Sessions for signup
- Webhook handler for subscription lifecycle events (created, updated, deleted, payment failed)
- New schema fields: `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionTier` (enum: FREE, STARTER, PREMIUM)
- Subscription management page (view, upgrade, downgrade, cancel)
- Customer portal link, grace period on failed payments
**Files:** `prisma/schema.prisma`, new router/use-case/data-access following the three-layer pattern
**Blocks:** Every tier-gated feature

### #429 — Feature Gating System [Priority 2/15]
**What:** Evolve the existing `FeatureGate` component and `Feature` enum from boolean flags to a tier-based system.
**Key work:**
- Update `FeatureGate` component (`src/components/feature-gate.tsx`) to check subscription tier
- New tRPC middleware: `starterProcedure`, `premiumProcedure`
- Route-level gating in `src/middleware.ts`
- Upgrade prompts (not just blocks) when users hit gated features
- Graceful degradation when subscription lapses
**Depends on:** #428

### #430 — Onboarding Quiz [Priority 3/15]
**What:** "Taste Profile" multi-step quiz capturing dietary preferences, cooking skill, household size, goals.
**Key work:**
- 3-5 screen quiz flow in `src/components/onboarding/` (empty dir exists)
- Store results on User model (new fields or JSON blob)
- Feed results into AI system prompt (`src/constants/chat.ts`) for personalized recommendations
- Shown on first login, skippable, retakeable from settings
**Related:** #358 (feature highlighting on onboarding)

---

## Recipe Cache Architecture (Cost Reduction)

These 4 issues implement the core "data-heavy over AI-heavy" pivot. Currently every recipe request calls GPT-4 Turbo (~$10-30/1M tokens). The goal: serve most requests from cache (free) or cheap model tweaks (50x cheaper).

### #431 — Vector Database Implementation [Foundational]
**What:** Activate the existing `RecipeVector` model with pgvector for semantic similarity search.
**Key work:**
- Enable pgvector extension in PostgreSQL
- Migration to activate `RecipeVector.embedding` column (1536 dimensions, already defined in schema)
- New `RecipeVectorAccess` data-access class: `upsertEmbedding()`, `searchSimilar()`
- Embedding generation utility wrapping OpenAI `text-embedding-3-small`
- Auto-generate embeddings on every recipe creation
- HNSW index for fast approximate nearest-neighbor search
- `signature` field stores normalized text (name + ingredients + techniques)
**Integration points:** `ChatsAccess.createRecipesForMessage()`, `RecipesAccess.createRecipe()`
**Blocks:** #432, #433, #434, #435

### #432 — Semantic Search Router [Core]
**What:** Intercept recipe requests and vector-search BEFORE calling the LLM.
**Architecture:**
```
User message → /api/chat/route.ts
  → RecipeRouterUseCase.resolve(query, filters, pantryItems)
      ├─ Embed user query
      ├─ Vector search RecipeVector table
      ├─ ≥90% match → return cached recipe (no LLM call)
      ├─ 80-90% match → delegate to Tweak Logic (cheap model)
      └─ <80% match → fall through to full LLM generation
```
**Key work:**
- New `src/server/api/use-cases/recipe-router-use-case.ts`
- Insert before `streamObject()` in `src/app/api/chat/route.ts`
- Returns `{ source: 'cached' | 'tweaked' | 'generated', recipes: Recipe[] }`
- Configurable similarity thresholds (0.90 cached, 0.80 tweak)
- Post-filters: dietary restrictions, cuisine match, pantry overlap
**Depends on:** #431
**Blocks:** #433, #436

### #433 — The 90% Tweak Logic [Cost Optimizer]
**What:** When a cached recipe is an 80-90% match, use a cheap model (GPT-4o-mini, ~50x cheaper) to "repair" it instead of full regeneration.
**Key work:**
- `TweakService` that takes cached recipe + user query
- Detect the diff (missing ingredient, dietary swap, serving size)
- Build minimal repair prompt focused only on the delta
- Call GPT-4o-mini (not GPT-4 Turbo)
- Output must conform to `generatedRecipeSchema` (drop-in replacement)
- Fallback to full generation if repair fails
- Target: <2s vs 5-8s for full generation
**Depends on:** #431, #432

### #434 — Recipe Deduplication Engine [Data Quality]
**What:** Prevent 50 near-identical "Chicken Tacos" — group variations under master recipes.
**Key work:**
- Populate `nameNorm` field (exists but empty) on all recipe creates/updates
- Master Recipe concept: `masterRecipeId` self-referencing FK or separate model
- On creation: check for same `nameNorm` or vector similarity >0.95
- Link near-duplicates to master recipe, preserve user variations
- UI: show grouped variations ("Chicken Tacos — 3 variations")
- Migration to backfill `nameNorm` for existing recipes
**Hook points:** `ChatsAccess.createRecipesForMessage()`, `RecipesAccess.createRecipe()`
**Depends on:** #431

---

## Data Hygiene & Performance

### #435 — Cold-Start Data Ingestion [Data Quality]
**What:** Pre-generate ~500 "Essential Base Recipes" so the vector DB isn't empty on launch.
**Key work:**
- Seed script generating ~500 recipes across diverse categories (proteins, cuisines, dietary, quick meals, basics)
- Each recipe gets full metadata + vector embedding
- Created as system-level recipes (no userId) — shared cache
- Idempotent, uses `nameNorm` dedup
- Batch generation using cheaper model
- Document total cost estimate (tokens for generation + embedding)
**Depends on:** #431, #434

### #436 — Cost-Observability Dashboard [Performance]
**What:** Request-level tracing showing cache hit rate and cost per request.
**Key work:**
- New `RequestLog` model capturing: userId, source (cached/tweaked/generated), model, tokens, latency, similarity score, timestamp
- Log every `/api/chat` request's resolution path
- Admin dashboard at `/admin/costs` showing:
  - Cache hit rate over time
  - Average cost per request by source type
  - Per-user cost breakdown
  - Daily/weekly/monthly cost trends
- Alert if cache hit rate drops below target (<70%)
**Depends on:** #432, #433

---

## Free Tier Features

### #416 — Basic Conversational Planner [Priority 4/15]
**What:** 3-day meal plan generation through the existing AI chat interface.
**Scope:** Prompt engineering + structured output parsing. No new endpoints needed.
**Key work:**
- Extend chat to handle meal plan requests ("Plan my meals for 3 days")
- Structured response: breakfast, lunch, dinner per day, linked to recipes
- Respect dietary preferences/filters and pantry items
- Clean rendering in chat UI (not raw text)
**Files:** `src/app/api/chat/route.ts`, `src/constants/chat.ts`

### #417 — Smart Shopping List [Priority 6/15]
**What:** Enhance ingredient aggregation — merge duplicates across recipes intelligently.
**Scope:** `aggregateIngredients` in `src/lib/ingredient-display.ts` already exists. This is enhancement.
**Key work:**
- Merge same ingredients with compatible units
- Sum quantities correctly (1 cup + 2 cups = 3 cups)
- Unit conversions where possible (tbsp → cups)
- Manual adjustment, source tracking, edge case handling ("to taste", optional)

### #418 — Community Recipe Access [Priority 11/15]
**What:** Public community recipe index — browse, search, save recipes from other users.
**Key work:**
- New concept of "public" recipes (currently all private)
- Discovery/search UI by name, cuisine, dietary tags, ingredients
- Save community recipes to personal cookbook
- Opt-in sharing, author attribution
- Integration with shopping list and meal planning

---

## Starter Tier ($1/mo) Features

### #419 — Unlimited Personal Cookbook [Priority 12/15]
**What:** Remove recipe save/import limits for paid users (implies adding limits to Free tier first).
**Key work:**
- Introduce Free tier limits (e.g., 10 saves, 5 imports/month)
- Starter+ gets unlimited
- UI messaging on approaching/hitting limits, upgrade prompts
- Existing users' recipes unaffected
**Depends on:** #428, #429

### #420 — Aisle-Sorted Lists [Priority 7/15]
**What:** Auto-categorize shopping list items by store section (produce, dairy, meat, etc.).
**Key work:**
- AI classification or lookup table for ingredient categorization
- Default categories: Produce, Dairy, Meat/Seafood, Bakery, Frozen, Pantry, Beverages, Other
- Customizable categories, persistent learned preferences
- Collapsible section headers, check-off within sections

### #421 — Staples Management [Priority 8/15]
**What:** Mark pantry items as "staples" (always in stock) to auto-exclude from shopping lists.
**Key work:**
- "Staple" flag on pantry items
- Auto-exclude staples from generated shopping lists
- Toggle to show/hide, default suggestions (salt, pepper, oil)
- Works with manual and AI-generated lists

### #422 — Cook Mode [Priority 5/15]
**What:** Distraction-free cooking UI with large text, step-by-step navigation.
**Scope:** Mostly UI polish. `nosleep.js` already active on recipe detail page.
**Key work:**
- "Cook Mode" button on recipe detail page
- Full-screen UI, step-by-step prev/next navigation
- Ingredient list as side panel/overlay
- Timer integration for steps mentioning cook times

---

## Premium Tier ($3/mo) Features

### #423 — Full Week AI Automation [Priority 10/15]
**What:** 7-day meal plan with goal-based optimization (calories, macros, budget).
**Extends:** Basic Conversational Planner (#416) from 3 days to full week.
**Key work:**
- Complete 7-day plans (breakfast, lunch, dinner, snacks)
- Optimize for user goals, avoid repetition
- One-click regeneration of individual days/meals
- Auto-generate shopping list from full week
**Related:** #404

### #424 — Fridge-First Logic [Priority 9/15]
**What:** "Use it Up" mode that prioritizes recipes using ingredients the user already has.
**Context:** Pantry-aware chat already exists. This extends it to proactively suggest.
**Key work:**
- "Use it Up" button/mode
- AI prioritizes maximizing pantry ingredient usage
- Show pantry coverage per suggested recipe
- Highlight additional ingredients needed
- "Fridge-first" day in weekly plans
**Related:** #397

### #425 — Direct-to-Cart Integration [Priority 15/15]
**What:** Sync shopping lists to grocery delivery (Walmart, Instacart, Amazon Fresh).
**Complexity:** Highest — requires external API partnerships.
**Key work:**
- Connect grocery service accounts
- One-click "Send to Cart" from shopping lists
- Ingredient name → store product mapping
- Handle unavailable items with substitutions

### #426 — Real-time Nutrition Sync [Priority 14/15]
**What:** Sync meal plan nutrition data with Apple Health / Google Fit.
**Complexity:** External API integration (HealthKit, Google Fit).
**Key work:**
- Connect health accounts, auto-log calories/macros from meals
- Sync daily/weekly nutrition summaries
- Privacy-respecting data permissions UI
- In-app nutrition dashboard

### #427 — Multi-User Household Sync [Priority 13/15]
**What:** Shared meal plans, shopping lists, and pantry for families/roommates.
**Complexity:** Major schema change — currently all data is single-user (`userId` on all models).
**Key work:**
- Create/join household (invite via email/link)
- Shared shopping lists, pantry, meal plans with real-time sync
- Individual preferences preserved
- Activity feed, household admin controls
**Related:** #404

---

## Recommended Build Order

| Phase | Issues | Goal |
|-------|--------|------|
| **1. Foundation** | #428, #429, #430 | Billing + gating + onboarding |
| **2. Cache Infra** | #431, #432, #433, #434 | Vector DB + search router + dedup (cost reduction) |
| **3. Data Seeding** | #435, #436 | Cold-start recipes + observability |
| **4. Free Features** | #416, #417 | Meal planning + smart lists (user value) |
| **5. Starter Features** | #422, #420, #421, #419 | Cook mode + shopping enhancements |
| **6. Premium Features** | #423, #424 | Full week + fridge-first |
| **7. Community** | #418 | Public recipe index |
| **8. Integrations** | #425, #426, #427 | External APIs + multi-user (highest complexity) |

---

## Key Codebase Integration Points

| Area | Files | Notes |
|------|-------|-------|
| AI Chat Entry | `src/app/api/chat/route.ts` | Semantic router inserts before `streamObject()` |
| System Prompt | `src/constants/chat.ts` | Onboarding quiz + meal planning extend this |
| Recipe Creation | `src/server/api/data-access/chats-access.ts` | Dedup + embedding hooks here |
| Recipe CRUD | `src/server/api/data-access/recipes-access.ts` | Secondary hook for dedup + embeddings |
| Schema | `prisma/schema.prisma` | `RecipeVector` exists; needs billing fields, master recipe, request log |
| Feature Gate | `src/components/feature-gate.tsx` | Exists but unused; evolve to tier-based |
| Auth | `src/server/api/trpc.ts` | Add `starterProcedure`, `premiumProcedure` |
| Shopping List | `src/server/api/routers/lists-router.ts` | Aisle sorting, staples, aggregation |
| Pantry | `src/server/api/routers/pantry-router.ts` | Staples flag, fridge-first |
| Onboarding | `src/components/onboarding/` | Empty dir, ready for quiz |
| Recipe Schemas | `src/schemas/messages-schema.ts` | `generatedRecipeSchema` — tweak output must match |
