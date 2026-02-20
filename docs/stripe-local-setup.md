# Stripe Local Development Setup

Guide for running Stripe subscriptions locally.

## Prerequisites

- [Stripe CLI](https://docs.stripe.com/stripe-cli) installed and authenticated (`stripe login`)
- A Stripe account in **test mode**

## Setup

### 1. Create products and prices in Stripe Dashboard

In the [Stripe Dashboard](https://dashboard.stripe.com/test/products) (test mode), create two products with **monthly recurring** prices:

| Product | Price |
|---------|-------|
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
```

- `STRIPE_SECRET_KEY` — From [API keys](https://dashboard.stripe.com/test/apikeys)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — From the same page (publishable key)
- `STRIPE_STARTER_PRICE_ID` — Price ID for the Starter plan
- `STRIPE_PREMIUM_PRICE_ID` — Price ID for the Premium plan
- `STRIPE_WEBHOOK_SECRET` — Generated in the next step

### 3. Start the webhook listener

In a dedicated terminal:

```bash
npm run stripe:listen
```

This runs `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

On first run, it prints a webhook signing secret (`whsec_...`). Copy it into `STRIPE_WEBHOOK_SECRET` in your `.env`.

### 4. Start the dev server

In a separate terminal:

```bash
npm run dev
```

Both processes must be running for webhooks to work.

## Testing

### Test cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0341` | Payment failure (card declined) |

Use any future expiry date, any 3-digit CVC, and any billing ZIP.

### Verify subscription state

After a test checkout, confirm the data was written:

```bash
npm run studio
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
