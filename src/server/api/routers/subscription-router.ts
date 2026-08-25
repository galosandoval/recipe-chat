import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionInfo
} from '~/server/api/use-cases/subscription-use-case'
import { createCheckoutSchema } from '~/schemas/subscription-schema'
import { getStripe } from '~/lib/stripe'
import { areSubscriptionsEnabled } from '~/lib/billing-config'
import { TRPCError } from '@trpc/server'

/**
 * Refuses the money path when this deployment has Subscriptions turned off.
 * Called before `getStripe()` so no Stripe client is built from unset keys.
 *
 * @throws A `PRECONDITION_FAILED` `TRPCError` when Subscriptions are disabled.
 */
function assertSubscriptionsEnabled() {
  if (!areSubscriptionsEnabled()) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'Subscriptions are not enabled.'
    })
  }
}

export const subscriptionRouter = createTRPCRouter({
  getInfo: protectedProcedure.query(async ({ ctx }) => {
    return await getSubscriptionInfo(ctx.session.user.id)
  }),

  createCheckout: protectedProcedure
    .input(createCheckoutSchema)
    .mutation(async ({ input, ctx }) => {
      assertSubscriptionsEnabled()

      return await createCheckoutSession(
        ctx.session.user.id,
        input,
        getStripe()
      )
    }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    assertSubscriptionsEnabled()

    return await createPortalSession(ctx.session.user.id, getStripe())
  })
})
