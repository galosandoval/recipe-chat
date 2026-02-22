import { type SubscriptionTier, type SubscriptionStatus } from '@prisma/client'
import { DataAccess } from './data-access'

export class SubscriptionAccess extends DataAccess {
  async getUserByStripeCustomerId(customerId: string) {
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

  async updateSubscription(
    userId: string,
    data: {
      stripeSubscriptionId?: string | null
      subscriptionTier: SubscriptionTier
      subscriptionStatus: SubscriptionStatus | null
      currentPeriodEnd?: Date | null
    }
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data
    })
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
