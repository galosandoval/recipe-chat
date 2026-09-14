import {
  Prisma,
  type SubscriptionTier,
  type SubscriptionStatus
} from '~/generated/prisma/client'
import { DataAccess } from './data-access'
import { DuplicateStripeEventError } from './subscription-errors'

/** The user fields the Stripe webhook path reads to resolve and update a subscription. */
export type SubscriptionEventUser = {
  id: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus | null
  /** When the last Stripe event applied to this user was created, for ordering. */
  lastStripeEventAt: Date | null
  /**
   * The id of the last Stripe event applied to this user. Idempotency is keyed
   * on the `ProcessedStripeEvent` record, not this field; kept as a breadcrumb
   * of the most recent write.
   */
  lastStripeEventId: string | null
}

export type UpdateSubscriptionData = {
  stripeSubscriptionId?: string | null
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus | null
  currentPeriodEnd?: Date | null
  /** The `created` time of the Stripe event that produced this write. */
  lastStripeEventAt?: Date | null
  /** The `id` of the Stripe event that produced this write. */
  lastStripeEventId?: string | null
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
  /** True when this Stripe event id was already applied — a duplicate delivery. */
  hasProcessedEvent(eventId: string): Promise<boolean>
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
        subscriptionStatus: true,
        lastStripeEventAt: true,
        lastStripeEventId: true
      }
    })
  }

  async updateStripeCustomerId(userId: string, customerId: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId }
    })
  }

  async hasProcessedEvent(eventId: string): Promise<boolean> {
    const processed = await this.prisma.processedStripeEvent.findUnique({
      where: { id: eventId },
      select: { id: true }
    })
    return processed !== null
  }

  /**
   * Apply the subscription change and record the event id in one transaction, so
   * a crash can never leave a state change without its idempotency record (which
   * would let the same event re-apply on retry). Recording the id is what makes
   * a later redelivery of any past event — not just the last — a no-op.
   */
  async updateSubscription(userId: string, data: UpdateSubscriptionData) {
    const { lastStripeEventId } = data
    try {
      return await this.transaction(async (tx) => {
        if (lastStripeEventId) {
          await tx.processedStripeEvent.create({
            data: { id: lastStripeEventId }
          })
        }
        return await tx.user.update({ where: { id: userId }, data })
      })
    } catch (error) {
      // A concurrent delivery that recorded this event id first makes the insert
      // collide on the primary key (P2002). Translate that race into the domain
      // duplicate so the use case can treat it as the no-op it is; the whole
      // transaction has rolled back, so nothing was written.
      if (
        lastStripeEventId &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new DuplicateStripeEventError(lastStripeEventId)
      }
      throw error
    }
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
