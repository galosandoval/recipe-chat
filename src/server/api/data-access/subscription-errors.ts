/**
 * Raised when recording a Stripe event's processed-event record collides with
 * one already stored — a concurrent redelivery that passed the dedupe read
 * before either delivery committed its record. The webhook path treats it as
 * the same no-op a sequential redelivery gets, so the loser of the race is not
 * surfaced as an error that tells Stripe to retry.
 *
 * It lives in its own module, not the data-access class, so the use-case and the
 * data-access layer can both reference it without the use-case importing Prisma
 * error shapes and without a circular import between the two.
 */
export class DuplicateStripeEventError extends Error {
  readonly eventId: string

  constructor(eventId: string) {
    super(`Stripe event ${eventId} was already processed`)
    this.name = 'DuplicateStripeEventError'
    this.eventId = eventId
  }
}
