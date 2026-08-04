import { type NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '~/lib/stripe'
import { prisma } from '~/server/db'
import { SubscriptionAccess } from '~/server/api/data-access/subscription-access'
import { handleStripeEvent } from '~/server/api/use-cases/subscription-use-case'

export async function POST(req: NextRequest) {
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

  await handleStripeEvent(event, {
    stripe,
    access: new SubscriptionAccess(prisma)
  })

  return NextResponse.json({ received: true })
}
