// Offsets are minutes east of UTC (UTC+5:30 -> 330, UTC-5 -> -300).
const DAY = 24 * 60

export const WORKDAY_START = 9 * 60
export const WORKDAY_END = 17 * 60

/**
 * Hours shared by two local 9-5 workdays, including across the date line.
 * This models daily availability, not weekdays or personal working schedules.
 */
export function workdayOverlapHours(offsetA: number, offsetB: number) {
    const startA = WORKDAY_START - offsetA
    const endA = WORKDAY_END - offsetA
    let overlap = 0
    for (let day = -2; day <= 2; day++) {
        const startB = WORKDAY_START - offsetB + day * DAY
        const endB = WORKDAY_END - offsetB + day * DAY
        overlap += Math.max(0, Math.min(endA, endB) - Math.max(startA, startB))
    }
    return overlap / 60
}

const offsetFormatters = new Map<string, Intl.DateTimeFormat | null>()

/** UTC offset at `date`, including DST; null when Intl does not know the zone. */
export function zoneOffsetMinutes(timeZone: string, date: Date) {
    let formatter = offsetFormatters.get(timeZone)
    if (formatter === undefined) {
        try {
            formatter = new Intl.DateTimeFormat('en-US', {
                timeZone,
                timeZoneName: 'longOffset',
            })
        } catch (error) {
            if (!(error instanceof RangeError)) throw error
            formatter = null
        }
        offsetFormatters.set(timeZone, formatter)
    }
    if (!formatter) return null
    const name = formatter
        .formatToParts(date)
        .find((part) => part.type === 'timeZoneName')?.value
    if (!name) return null
    if (name === 'GMT') return 0
    const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name)
    if (!match) return null
    const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0)
    return match[1] === '-' ? -minutes : minutes
}

/** Current offset for a developer, falling back to the stored standard offset. */
export function developerOffset(
    timezone: { name: string; utcOffset: number } | null,
    date: Date
) {
    if (!timezone) return null
    return zoneOffsetMinutes(timezone.name, date) ?? timezone.utcOffset
}

/** Format minutes east of UTC, retaining fractional-hour offsets. */
export function formatOffset(offset: number) {
    if (offset === 0) return 'UTC'
    const sign = offset > 0 ? '+' : '-'
    const hours = Math.floor(Math.abs(offset) / 60)
    const minutes = Math.abs(offset) % 60
    return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`
}
