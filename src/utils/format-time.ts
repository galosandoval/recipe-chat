/**
 * Converts minutes to a user-friendly, translatable time format
 *
 * @param minutes - The number of minutes to format
 * @param t - Translation function containing time units
 * @returns Formatted time string (e.g., "2 hours 30 minutes" or "45 minutes")
 *
 * @example
 * ```typescript
 * const t = useTranslations()
 * formatTimeFromMinutes(90, t)  // Returns "1 hour 30 minutes" (English)
 * formatTimeFromMinutes(45, t)  // Returns "45 minutes" (English)
 * formatTimeFromMinutes(120, t) // Returns "2 hours" (English)
 * ```
 *
 * The function automatically handles singular/plural forms based on the translation keys:
 * - t.time.hour (singular) vs t.time.hours (plural)
 * - t.time.minute (singular) vs t.time.minutes (plural)
 */
export function formatTimeFromMinutes(
  minutes: number,
  t: {
    time: {
      hour: string
      hours: string
      minute: string
      minutes: string
    }
  }
) {
  if (minutes <= 0) return '0 ' + t.time.minutes

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes} ${remainingMinutes === 1 ? t.time.minute : t.time.minutes}`
  }

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? t.time.hour : t.time.hours}`
  }

  return `${hours} ${hours === 1 ? t.time.hour : t.time.hours} ${remainingMinutes} ${remainingMinutes === 1 ? t.time.minute : t.time.minutes}`
}
