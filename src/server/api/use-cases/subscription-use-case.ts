import { type PrismaClient } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import type Stripe from 'stripe'
import { SubscriptionAccess } from '~/server/api/data-access/subscription-access'
import { stripe } from '~/lib/stripe'
import { PRICE_ID_TO_TIER, TIER_TO_PRICE_ID } from '~/lib/stripe-config'
import { type CreateCheckoutSchema } from '~/schemas/subscription-schema'

export async function createCheckoutSession(
  userId: string,
  input: CreateCheckoutSchema,
  prisma: PrismaClient
) {
  const access = new SubscriptionAccess(prisma)
  const info = await access.getSubscriptionInfo(userId)

  if (info.subscriptionStatus === 'ACTIVE') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'You already have an active subscription. Use the billing portal to manage it.'
    })
  }

  let customerId = info.stripeCustomerId

  if (!customerId) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { username: true }
    })

    const customer = await stripe.customers.create({
      email: user.username,
      metadata: { userId }
    })

    await access.updateStripeCustomerId(userId, customer.id)
    customerId = customer.id
  }

  const priceId = TIER_TO_PRICE_ID[input.tier]
  if (!priceId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid tier' })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/subscription?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/subscription?canceled=true`
  })

  return { url: session.url }
}

export async function createPortalSession(userId: string, prisma: PrismaClient) {
  const access = new SubscriptionAccess(prisma)
  const info = await access.getSubscriptionInfo(userId)

  if (!info.stripeCustomerId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No billing account found.'
    })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: info.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/en/subscription`
  })

  return { url: session.url }
}

export async function getSubscriptionInfo(userId: string, prisma: PrismaClient) {
  const access = new SubscriptionAccess(prisma)
  return await access.getSubscriptionInfo(userId)
}

function getFirstItem(subscription: Stripe.Subscription) {
  return subscription.items.data[0]
}

function resolveTierFromSubscription(subscription: Stripe.Subscription) {
  const priceId = getFirstItem(subscription)?.price.id
  if (!priceId) return 'FREE' as const
  return PRICE_ID_TO_TIER[priceId] ?? ('FREE' as const)
}

export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  prisma: PrismaClient
) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  const access = new SubscriptionAccess(prisma)
  const user = await access.getUserByStripeCustomerId(customerId)
  if (!user) return

  const tier = resolveTierFromSubscription(subscription)
  const periodEnd = getFirstItem(subscription)?.current_period_end
  await access.updateSubscription(user.id, {
    stripeSubscriptionId: subscription.id,
    subscriptionTier: tier,
    subscriptionStatus: 'ACTIVE',
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null
  })
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  prisma: PrismaClient
) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  const access = new SubscriptionAccess(prisma)
  const user = await access.getUserByStripeCustomerId(customerId)
  if (!user) return

  const tier = resolveTierFromSubscription(subscription)
  const status = subscription.status === 'active' ? 'ACTIVE' : 'INCOMPLETE'
  const periodEnd = getFirstItem(subscription)?.current_period_end

  await access.updateSubscription(user.id, {
    stripeSubscriptionId: subscription.id,
    subscriptionTier: tier,
    subscriptionStatus: status,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null
  })
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  prisma: PrismaClient
) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  const access = new SubscriptionAccess(prisma)
  const user = await access.getUserByStripeCustomerId(customerId)
  if (!user) return

  await access.updateSubscription(user.id, {
    stripeSubscriptionId: null,
    subscriptionTier: 'FREE',
    subscriptionStatus: 'CANCELED',
    currentPeriodEnd: null
  })
}

export async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  prisma: PrismaClient
) {
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id

  if (!customerId) return

  const access = new SubscriptionAccess(prisma)
  const user = await access.getUserByStripeCustomerId(customerId)
  if (!user) return

  await access.updateSubscription(user.id, {
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: 'PAST_DUE'
  })
}
