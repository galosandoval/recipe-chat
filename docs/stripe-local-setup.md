# Stripe Local Development Setup

Guide for running Stripe subscriptions locally.

## Prerequisites

- [Stripe CLI](https://docs.stripe.com/stripe-cli) installed and authenticated (`stripe login`)
- A Stripe account in **test mode**

## Setup

### 1. Create products and prices in Stripe Dashboard

In the [Stripe Dashboard](https://dashboard.stripe.com/test/products) (test mode), create two products with **monthly recurring** prices:

| Product | Price    |
| ------- | -------- |
| Starter | $1/month |
| Premium | $3/month |

After creating each product, copy the **price ID** (starts with `price_...`), not the product ID.

### 2. Configure environment variables

Add these to your `.env` (or `.env.local`):

```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PREMIUM_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED="true"
```

- `STRIPE_SECRET_KEY` — From [API keys](https://dashboard.stripe.com/test/apikeys)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — From the same page (publishable key)
- `STRIPE_STARTER_PRICE_ID` — Price ID for the Starter plan
- `STRIPE_PREMIUM_PRICE_ID` — Price ID for the Premium plan
- `STRIPE_WEBHOOK_SECRET` — Generated in the next step
- `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` — Master switch for the whole Subscription surface. `"true"` enables it; **anything else — unset, empty, `"1"`, `"TRUE"` — means disabled**. Set it to `"true"` in development; it is **off in production**.

### The Subscriptions flag

`NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED` is read in exactly one place, `src/lib/billing-config.ts`, and every surface asks that module instead of the environment. When the flag is off:

- The settings menu omits the Subscription entry, and `/subscription` renders a "not available yet" message instead of the Tier grid.
- `createCheckout` and `createPortalSession` throw before any Stripe client is constructed.
- The Stripe webhook route returns an inert `ignored` response without verifying signatures or touching the database.
- Tier gating is bypassed — `hasTierAccess` and `hasFeatureAccess` grant access to everyone, so `FeatureGate`, `TierGate`, and the tier tRPC middleware all pass through.

It fails closed on purpose: a new environment that forgets the variable hides a broken money path rather than exposing one. Flip it locally to see both states — no other variable needs changing.

Subscription state already stored on a user (`subscriptionTier`, `subscriptionStatus`, `stripeCustomerId`, `stripeSubscriptionId`, `currentPeriodEnd`) is untouched by the flag in either direction.

### 3. Start the webhook listener

In a dedicated terminal:

```bash
bun run stripe:listen
```

This runs `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

On first run, it prints a webhook signing secret (`whsec_...`). Copy it into `STRIPE_WEBHOOK_SECRET` in your `.env`.

### 4. Start the dev server

In a separate terminal:

```bash
bun run dev
```

Both processes must be running for webhooks to work.

## Testing

### Test cards

| Card Number           | Scenario                        |
| --------------------- | ------------------------------- |
| `4242 4242 4242 4242` | Successful payment              |
| `4000 0000 0000 0341` | Payment failure (card declined) |

Use any future expiry date, any 3-digit CVC, and any billing ZIP.

### Verify subscription state

After a test checkout, confirm the data was written:

```bash
bun run studio
```

Open the `User` table in Prisma Studio and check:

- `stripeCustomerId` — should be set
- `stripeSubscriptionId` — should be set
- `subscriptionTier` — `STARTER` or `PREMIUM`
- `subscriptionStatus` — `ACTIVE`
- `currentPeriodEnd` — future date

### Webhook events handled

The webhook endpoint (`src/app/api/webhooks/stripe/route.ts`) processes:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## Common gotchas

1. **Using product IDs instead of price IDs** — The env vars need `price_...` IDs, not `prod_...` IDs. Product IDs won't work for checkout sessions.

2. **Forgetting to run `stripe listen`** — Without the CLI forwarding webhooks, subscription state won't update in the database after checkout.

3. **Webhook secret mismatch** — The `whsec_...` secret changes each time you run `stripe listen`. If you restart the CLI, update `STRIPE_WEBHOOK_SECRET` in `.env` and restart the dev server.

4. **Not using test mode** — Make sure the Stripe Dashboard is in test mode (toggle in the top bar). Test API keys start with `sk_test_` and `pk_test_`.

## Re-enabling subscriptions

Subscriptions are disabled in production. Turning them back on is **the last step** of the Phase 2 go-live checklist in [#623](https://github.com/galosandoval/recipe-chat/issues/623), not the first — flipping the flag before the plumbing is proven puts a pricing page in front of customers it cannot serve.

That checklist covers, in order:

1. **Stripe account artifacts** — live-mode products and prices, live keys, a registered live webhook endpoint plus its signing secret, and a configured billing portal.
2. **Code gaps** — the locale-prefixed billing-portal return URL, re-enabling env validation (flag-aware, plus `NEXTAUTH_URL`), webhook idempotency and event ordering, `checkout.session.completed` handling, session Tier freshness, and downgrade/lapse behavior.
3. **Product gaps** — at least one genuinely gated feature, defined Free-Tier limits, and pricing copy reviewed in both locales.
4. **Production variables**, then a manual live-mode smoke test, then `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED="true"`.

See #623 for the full context behind each item.
