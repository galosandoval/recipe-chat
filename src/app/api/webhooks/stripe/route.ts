import { type NextRequest, NextResponse } from 'next/server'
import { getStripe } from '~/lib/stripe'
import { prisma } from '~/server/db'
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handlePaymentFailed
} from '~/server/api/use-cases/subscription-use-case'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  console.log('event.type', event.type)
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(
        event.data.object as Stripe.Subscription,
        prisma
      )
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription,
        prisma
      )
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
        prisma
      )
      break

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice, prisma)
      break
  }

  return NextResponse.json({ received: true })
}
