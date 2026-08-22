import {
  type SubscriptionTier,
  type SubscriptionStatus
} from '~/generated/prisma/client'
import { DataAccess } from './data-access'

/** The user fields the Stripe webhook path reads to resolve and update a subscription. */
export type SubscriptionEventUser = {
  id: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus | null
}

export type UpdateSubscriptionData = {
  stripeSubscriptionId?: string | null
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus | null
  currentPeriodEnd?: Date | null
}

/**
 * The data-access seam the Stripe webhook path depends on. Production uses the
 * Prisma-backed `SubscriptionAccess`; tests substitute an in-memory fake so the
 * subscription money path is exercised with no database and no network.
 */
export interface SubscriptionEventAccess {
  getUserByStripeCustomerId(
    customerId: string
  ): Promise<SubscriptionEventUser | null>
  updateSubscription(
    userId: string,
    data: UpdateSubscriptionData
  ): Promise<unknown>
}

export class SubscriptionAccess
  extends DataAccess
  implements SubscriptionEventAccess
{
  async getUserByStripeCustomerId(
    customerId: string
  ): Promise<SubscriptionEventUser | null> {
    return await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionTier: true,
        subscriptionStatus: true
      }
    })
  }

  async updateStripeCustomerId(userId: string, customerId: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId }
    })
  }

  async updateSubscription(userId: string, data: UpdateSubscriptionData) {
    return await this.prisma.user.update({
      where: { id: userId },
      data
    })
  }

  /** The email Stripe bills to — usernames are email addresses. */
  async getUsername(userId: string) {
    const { username } = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { username: true }
    })
    return username
  }

  async getSubscriptionInfo(userId: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        currentPeriodEnd: true
      }
    })
  }
}

export const subscriptionAccess = new SubscriptionAccess()
