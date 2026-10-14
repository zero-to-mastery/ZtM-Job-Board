import Person from '../interfaces/person'
import { ContactSignal, contactSignals } from './contactLinks'
import { personTimezone } from './mapGeometry'
import { filterProfiles, ProfileFilterOptions } from './profileFilters'
import {
    browserTimeZone,
    developerOffset,
    selectedTimeZoneOffsetMinutes,
    workdayOverlapHours,
} from './timezone'

// Sort value that orders developers by shared 9–5 hours with the recruiter
export const OVERLAP_SORT = 'overlap-desc'

// Level filter value for titles that do not state a seniority
export const LEVEL_NOT_STATED = 'not-stated'

export interface PeopleFilters extends ProfileFilterOptions {
    // Values from SENIORITY_LEVELS in src/util/roles/roleTaxonomy.js,
    // or LEVEL_NOT_STATED
    levels: string[]
    signals: ContactSignal[]
    overlap: {
        // IANA zone or fixed UTC/GMT offset selected by the recruiter
        timeZone: string
        // Minimum hours of 9–5 overlap; 0 turns the filter off
        minHours: number
    }
}

export const DEFAULT_FILTERS: PeopleFilters = {
    search: '',
    countries: [],
    roles: [],
    sort: 'default',
    levels: [],
    signals: [],
    overlap: { timeZone: browserTimeZone(), minHours: 0 },
}

/**
 * The single filter pipeline used by both the card view and the map:
 * search, countries, roles and sort from `filterProfiles`, then the
 * recruiter filters (seniority, contact signals and working-hours overlap).
 */
export function filterPeople(
    people: Person[],
    filters: PeopleFilters,
    now: Date = new Date()
) {
    let filtered = filterProfiles(people, filters)

    if (filters.levels.length > 0) {
        filtered = filtered.filter((person) =>
            filters.levels.includes(
                person.normalized?.seniority ?? LEVEL_NOT_STATED
            )
        )
    }

    if (filters.signals.length > 0) {
        filtered = filtered.filter((person) => {
            const available = contactSignals(person)
            return filters.signals.every((signal) => available.includes(signal))
        })
    }

    const { timeZone, minHours } = filters.overlap
    const sortByOverlap = filters.sort === OVERLAP_SORT
    if (minHours > 0 || sortByOverlap) {
        const offset =
            selectedTimeZoneOffsetMinutes(timeZone, now) ??
            selectedTimeZoneOffsetMinutes(browserTimeZone(), now) ??
            0
        // Unknown time zones get -1 so they sort last and fail any minimum
        const overlapHours = new Map(
            filtered.map((person) => {
                const theirs = developerOffset(personTimezone(person), now)
                return [
                    person,
                    theirs === null ? -1 : workdayOverlapHours(offset, theirs),
                ] as const
            })
        )
        const hours = (person: Person) => overlapHours.get(person) ?? -1

        if (minHours > 0) {
            filtered = filtered.filter((person) => hours(person) >= minHours)
        }
        if (sortByOverlap) {
            // Stable sort keeps the shuffled order within equal overlap
            filtered = [...filtered].sort((a, b) => hours(b) - hours(a))
        }
    }

    return filtered
}
