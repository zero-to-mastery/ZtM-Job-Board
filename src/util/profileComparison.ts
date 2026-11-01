
import tzLookup from 'tz-lookup'
import Person from '../interfaces/person'

export const MAX_COMPARE_PROFILES = 3

export function toggleProfileComparison(
    currentIds: string[],
    profileId: string
): string[] {
    if (currentIds.includes(profileId)) {
        return currentIds.filter((id) => id !== profileId)
    }

    if (currentIds.length >= MAX_COMPARE_PROFILES) {
        return currentIds
    }

    return [...currentIds, profileId]
}

function formatUtcOffset(offset: string): string {
    if (offset === 'GMT') {
        return 'UTC+00:00'
    }

    const match = offset.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/)

    if (!match) {
        return offset.replace('GMT', 'UTC')
    }

    const [, sign, hours, minutes = '00'] = match

    return `UTC${sign}${hours.padStart(2, '0')}:${minutes}`
}

export function getProfileTimezone(
    location: Person['location'],
    date: Date = new Date()
): string {
    const country = location.country?.trim()

    if (!location.coordinates) {
        return country || 'Not available'
    }

    const { lat, lng } = location.coordinates

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return country || 'Not available'
    }

    try {
        const timezone = tzLookup(lat, lng)

        const offset = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'shortOffset',
        })
            .formatToParts(date)
            .find((part) => part.type === 'timeZoneName')?.value

        return offset
            ? `${timezone} (${formatUtcOffset(offset)})`
            : timezone
    } catch {
        return country || 'Not available'
    }
}
