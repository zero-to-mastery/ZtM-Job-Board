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

/**
 * Parses a fixed GMT/UTC offset such as "UTC-5" or "GMT+5:30".
 * Returns null for text that is not a valid fixed offset.
 */
export function parseUtcOffset(value: string): number | null {
    const normalized = normalizeTimeZoneSearch(value)
    if (normalized === 'utc' || normalized === 'gmt') return 0
    const match = /^(?:utc|gmt)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?$/i.exec(
        normalized
    )
    if (!match) return null

    const hours = Number(match[2])
    const minutes = Number(match[3] ?? 0)
    if (hours > 14 || minutes >= 60 || (hours === 14 && minutes !== 0)) {
        return null
    }
    const offset = hours * 60 + minutes
    return match[1] === '-' ? -offset : offset
}

/** Resolves either an IANA zone or a fixed UTC/GMT offset selection. */
export function selectedTimeZoneOffsetMinutes(timeZone: string, date: Date) {
    return parseUtcOffset(timeZone) ?? zoneOffsetMinutes(timeZone, date)
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

const normalizeTimeZoneSearch = (value: string) =>
    value
        .replace(/_/g, ' ')
        .replace(/−/g, '-')
        .replace(/＋/g, '+')
        .trim()
        .toLowerCase()

export const timeZoneLabel = (timeZone: string) => {
    const offset = parseUtcOffset(timeZone)
    if (offset !== null) return formatOffset(offset)
    const parts = timeZone.replace(/_/g, ' ').split('/')
    const city = parts.pop() ?? timeZone
    const region = parts.join('/')
    return region ? `${city} · ${region}` : city
}

export interface TimeZoneSearchResult {
    value: string
    label: string
    detail: string
}

const FIXED_OFFSETS = [
    ...Array.from({ length: 27 }, (_, index) => (index - 12) * 60),
    -570,
    -210,
    210,
    270,
    330,
    345,
    390,
    525,
    570,
    630,
    765,
].sort((a, b) => Math.abs(a) - Math.abs(b) || a - b)

/** Searches cities and fixed offsets, treating UTC and GMT as aliases. */
export function searchTimeZones(
    query: string,
    timeZones: string[],
    limit = 12
): TimeZoneSearchResult[] {
    const searchTerm = normalizeTimeZoneSearch(query)
    if (searchTerm.length < 2) return []

    const compact = searchTerm.replace(/\s/g, '')
    if (/^(?:ut|gm|(?:utc|gmt)(?:[+-].*)?)$/.test(compact)) {
        const prefix =
            compact === 'gm'
                ? 'ut'
                : compact
                      .replace(/^gmt/, 'utc')
                      .replace(/^(utc[+-])0(?=\d)/, '$1')
        const exact = parseUtcOffset(searchTerm)
        const offsets = [
            ...(exact === null ? [] : [exact]),
            ...FIXED_OFFSETS.filter((offset) => {
                const formatted = formatOffset(offset).toLowerCase()
                return (
                    formatted.startsWith(prefix) ||
                    formatted.replace(':', '').startsWith(prefix)
                )
            }),
        ]
        return Array.from(new Set(offsets))
            .slice(0, limit)
            .map((offset) => {
                const utc = formatOffset(offset)
                return {
                    value: utc,
                    label: `${utc} / ${utc.replace('UTC', 'GMT')} fixed offset`,
                    detail: 'No daylight-saving changes',
                }
            })
    }

    return timeZones
        .filter((timeZone) =>
            normalizeTimeZoneSearch(timeZone).includes(searchTerm)
        )
        .sort((a, b) => {
            const cityA = normalizeTimeZoneSearch(a.split('/').pop() ?? a)
            const cityB = normalizeTimeZoneSearch(b.split('/').pop() ?? b)
            const matchA = cityA.startsWith(searchTerm) ? 0 : 1
            const matchB = cityB.startsWith(searchTerm) ? 0 : 1
            return matchA - matchB || a.localeCompare(b)
        })
        .slice(0, limit)
        .map((timeZone) => ({
            value: timeZone,
            label: timeZoneLabel(timeZone),
            detail: timeZone.replace(/_/g, ' '),
        }))
}

/** The browser's current IANA time zone, or UTC when it is unavailable. */
export const browserTimeZone = () =>
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const FALLBACK_TIME_ZONES = [
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Lagos',
    'America/Anchorage',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Mexico_City',
    'America/New_York',
    'America/Phoenix',
    'America/Sao_Paulo',
    'America/Toronto',
    'America/Vancouver',
    'Asia/Dubai',
    'Asia/Hong_Kong',
    'Asia/Kolkata',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Perth',
    'Australia/Sydney',
    'Europe/Berlin',
    'Europe/London',
    'Europe/Paris',
    'Pacific/Auckland',
    'UTC',
]

export interface TimeZoneGroup {
    region: string
    zones: string[]
}

/** IANA zones grouped by region for a readable, keyboard-searchable select. */
export function getTimeZoneGroups(
    currentTimeZone = browserTimeZone()
): TimeZoneGroup[] {
    const supportedValuesOf = (
        Intl as typeof Intl & {
            supportedValuesOf?: (key: 'timeZone') => string[]
        }
    ).supportedValuesOf
    const zones = supportedValuesOf
        ? supportedValuesOf('timeZone')
        : FALLBACK_TIME_ZONES
    const allZones = new Set([...zones, currentTimeZone, 'UTC'])
    const groups = new Map<string, string[]>()

    allZones.forEach((timeZone) => {
        const separator = timeZone.indexOf('/')
        const region = separator === -1 ? 'Other' : timeZone.slice(0, separator)
        const cities = groups.get(region) ?? []
        cities.push(timeZone)
        groups.set(region, cities)
    })

    return Array.from(groups.entries())
        .sort(([regionA], [regionB]) => regionA.localeCompare(regionB))
        .map(([region, timeZones]) => ({
            region,
            zones: timeZones.sort((a, b) => a.localeCompare(b)),
        }))
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
