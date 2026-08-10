import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionInfo
} from '~/server/api/use-cases/subscription-use-case'
import { createCheckoutSchema } from '~/schemas/subscription-schema'
import { getStripe } from '~/lib/stripe'

export const subscriptionRouter = createTRPCRouter({
  getInfo: protectedProcedure.query(async ({ ctx }) => {
    return await getSubscriptionInfo(ctx.session.user.id)
  }),

  createCheckout: protectedProcedure
    .input(createCheckoutSchema)
    .mutation(async ({ input, ctx }) => {
      return await createCheckoutSession(
        ctx.session.user.id,
        input,
        getStripe()
      )
    }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    return await createPortalSession(ctx.session.user.id, getStripe())
  })
})
