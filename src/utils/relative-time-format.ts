const rtf = (locale?: string) =>
	new Intl.RelativeTimeFormat(locale, {
		numeric: 'auto'
	})

const DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
	{ amount: 60, name: 'seconds' },
	{ amount: 60, name: 'minutes' },
	{ amount: 24, name: 'hours' },
	{ amount: 7, name: 'days' },
	{ amount: 4.34524, name: 'weeks' },
	{ amount: 12, name: 'months' },
	{ amount: Number.POSITIVE_INFINITY, name: 'years' }
]

export function formatTimeAgo(date: Date, locale?: string) {
	let duration = (Number(date) - Number(new Date())) / 1000

	for (let i = 0; i < DIVISIONS.length; i++) {
		const division = DIVISIONS[i]

		if (!division) {
			throw new Error('Division is undefined')
		}

		if (Math.abs(duration) < division.amount) {
			return rtf(locale).format(Math.round(duration), division.name)
		}

		duration /= division.amount
	}

	throw new Error('Date is too far in the future or past')
}
