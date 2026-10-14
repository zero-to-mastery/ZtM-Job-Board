// Time-zone helpers for the recruiter overlap filter.
// Offsets are minutes east of UTC (UTC+5:30 -> 330, UTC-5 -> -300).

const DAY = 24 * 60

export const WORKDAY_START = 9 * 60
export const WORKDAY_END = 17 * 60

/**
 * Hours both people are inside their local 9–5 on the same moment.
 * Handles workdays that fall on different calendar dates, e.g. UTC+13
 * morning overlapping UTC-8 afternoon of the previous day.
 */
export function workdayOverlapHours(offsetA: number, offsetB: number) {
    // Each workday as an interval in UTC minutes
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

/**
 * The zone's UTC offset at `date`, including daylight saving time.
 * Returns null when the browser does not know the zone.
 */
export function zoneOffsetMinutes(timeZone: string, date: Date) {
    let formatter = offsetFormatters.get(timeZone)
    if (formatter === undefined) {
        try {
            formatter = new Intl.DateTimeFormat('en-US', {
                timeZone,
                timeZoneName: 'longOffset',
            })
        } catch {
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

/** Current offset for a developer, falling back to the standard offset. */
export function developerOffset(
    timezone: { name: string; utcOffset: number } | null,
    date: Date
) {
    if (!timezone) return null
    return zoneOffsetMinutes(timezone.name, date) ?? timezone.utcOffset
}

// 330 -> "UTC+5:30", -300 -> "UTC-5", 0 -> "UTC"
export function formatOffset(offset: number) {
    if (offset === 0) return 'UTC'
    const sign = offset > 0 ? '+' : '-'
    const hours = Math.floor(Math.abs(offset) / 60)
    const minutes = Math.abs(offset) % 60
    return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`
}

/**
 * Local time at an offset, with the weekday so day boundaries are visible:
 * "Tue 9:05 PM".
 */
export function localTimeLabel(offset: number, date: Date) {
    const shifted = new Date(date.getTime() + offset * 60 * 1000)
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
    }).format(shifted)
}

// Every offset in use worldwide, for the "my time zone" picker
export const UTC_OFFSETS = [
    -720, -660, -600, -570, -540, -480, -420, -360, -300, -240, -210, -180,
    -120, -60, 0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420,
    480, 525, 540, 570, 600, 630, 660, 720, 765, 780, 840,
]

export const browserOffset = (date = new Date()) => -date.getTimezoneOffset()
