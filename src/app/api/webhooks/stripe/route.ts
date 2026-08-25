import { type NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '~/lib/stripe'
import { subscriptionAccess } from '~/server/api/data-access/subscription-access'
import { handleStripeEvent } from '~/server/api/use-cases/subscription-use-case'
import { areSubscriptionsEnabled } from '~/lib/billing-config'

export async function POST(req: NextRequest) {
  // Stays mounted but inert while Subscriptions are off: a stray delivery gets a
  // clean response instead of an exception from an unset Stripe key, and nothing
  // is written to the database.
  if (!areSubscriptionsEnabled()) {
    return NextResponse.json({ ignored: true })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await handleStripeEvent(event, { stripe, access: subscriptionAccess })

  return NextResponse.json({ received: true })
}
