import Person from '../interfaces/person'
import { personTimezone } from './mapGeometry'
import { filterProfiles, ProfileFilterOptions } from './profileFilters'
import { browserOffset, developerOffset, workdayOverlapHours } from './timezone'

// Level filter value for titles that do not state a seniority
export const LEVEL_NOT_STATED = 'not-stated'

export interface PeopleFilters extends ProfileFilterOptions {
    // Values from SENIORITY_LEVELS in src/util/roles/roleTaxonomy.js,
    // or LEVEL_NOT_STATED
    levels: string[]
    overlap: {
        // The recruiter's UTC offset in minutes
        offset: number
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
    overlap: { offset: browserOffset(), minHours: 0 },
}

/**
 * The single filter pipeline used by both the card view and the map:
 * search, countries, roles and sort from `filterProfiles`, then the
 * recruiter filters (seniority and working-hours overlap).
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

    if (filters.overlap.minHours > 0) {
        const { offset, minHours } = filters.overlap
        filtered = filtered.filter((person) => {
            const theirs = developerOffset(personTimezone(person), now)
            return (
                theirs !== null &&
                workdayOverlapHours(offset, theirs) >= minHours
            )
        })
    }

    return filtered
}
