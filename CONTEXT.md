# Recipe Chat

An AI recipe assistant: users chat to get recipe ideas, keep the ones they like, turn them into a shopping list, track what's in their pantry, and pay for higher tiers. This glossary is the project's ubiquitous language — the canonical word for each concept, with discouraged synonyms under _Avoid_.

## Recipes

**Recipe Option**:
A lightweight recipe proposal surfaced in chat — name, description, and facets only, before it is expanded into full ingredients and steps. The assistant proposes several at once for the user to choose from.
_Avoid_: suggestion, candidate, draft, idea

**Recipe**:
A fully expanded dish with ingredients, instructions, and servings. Begins life as a chosen Recipe Option, can be saved into the user's collection, edited, and annotated with notes.
_Avoid_: meal, dish

**Facets**:
The structured classification of a recipe used to power filtering, dedupe, and semantic search — cuisine, course, diet tags, flavor tags, main ingredients, and techniques.
_Avoid_: tags, categories, metadata, labels

**Ingredient**:
A single component of a recipe, shopping list, or pantry — a parsed quantity, unit, and item name derived from a raw string.
_Avoid_: item, food

**Instruction**:
One ordered step in preparing a recipe.
_Avoid_: step, direction

## Chat

**Chat**:
One ongoing conversation between a user and the recipe assistant. Holds the messages and any active filters.
_Avoid_: conversation, thread, session

**Message**:
A single turn in a chat, authored by the user, the assistant, the system, or carrying data.
_Avoid_: turn, reply

## Collections

**Shopping List**:
A user's single list of ingredients they intend to buy. One per user.
_Avoid_: grocery list, list, cart, basket

**Pantry**:
A user's single collection of ingredients they have on hand, used to bias recipe suggestions toward what they already own. One per user.
_Avoid_: inventory, stock, fridge

## Preferences

**Filter**:
An ephemeral, per-chat preference toggle (e.g. "vegan") the user flips to steer suggestions in one conversation. Does not persist as the user's identity.
_Avoid_: preference, tag, facet

**Taste Profile**:
A user's durable preferences — dietary restrictions, cuisine preferences, cooking skill, household size, and health goals — typically captured via the onboarding quiz and applied across all chats.
_Avoid_: preferences, profile, settings

## Recipe Cache & Search

**Recipe Vector**:
The stored semantic representation of a recipe (one per recipe) that enables semantic search and the recipe cache, so most requests are served or cheaply tweaked rather than fully regenerated.
_Avoid_: embedding (the raw value), signature

## Monetization

**Subscription**:
A user's paid relationship, managed through Stripe, carrying a tier and a status.
_Avoid_: membership, plan

**Tier**:
The level of access a subscription grants: Free, Starter, or Premium. Gates which features a user can reach.
_Avoid_: plan, level

## Onboarding

**Onboarding Step**:
A discrete milestone in the new-user onboarding tour that has been completed (e.g. first generated chat, first saved recipe). Distinct from tier-gated features.
_Avoid_: feature, tour step, flag
