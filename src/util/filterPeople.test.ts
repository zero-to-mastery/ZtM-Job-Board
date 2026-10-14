import { describe, expect, test } from 'vitest'
import Person from '../interfaces/person'
import {
    DEFAULT_FILTERS,
    filterPeople,
    LEVEL_NOT_STATED,
    OVERLAP_SORT,
} from './filterPeople'

// Search, country, role and sort behaviour is covered by the
// filterProfiles tests; these cover what filterPeople adds on top.

const person = (
    id: string,
    normalized: Partial<NonNullable<Person['normalized']>>,
    contact: Pick<Person, 'email' | 'links'> = { links: {} }
): Person => ({
    id,
    img: '',
    name: id,
    jobTitle: '',
    location: {},
    ...contact,
    normalized: {
        countries: [],
        roles: [],
        seniority: null,
        technologies: [],
        ...normalized,
    },
})

const people = [
    person(
        'bea',
        {
            countries: ['NG'],
            roles: ['frontend-developer'],
            seniority: 'junior',
            timezone: { name: 'Africa/Lagos', utcOffset: 60 },
        },
        {
            email: 'bea@example.com',
            links: {
                website: 'https://bea.example.com',
                linkedin: 'https://linkedin.com/in/bea',
            },
        }
    ),
    person(
        'abe',
        {
            countries: ['IN'],
            roles: ['data-scientist'],
            seniority: 'senior',
            timezone: { name: 'Asia/Kolkata', utcOffset: 330 },
        },
        { links: { linkedin: 'https://linkedin.com/in/abe' } }
    ),
    person('cy', { roles: ['frontend-developer'] }),
]

const ids = (list: Person[]) => list.map(({ id }) => id)
const july = new Date('2026-07-15T12:00:00Z')

describe('filterPeople', () => {
    test('passes search, countries, roles and sort through to filterProfiles', () => {
        expect(ids(filterPeople(people, DEFAULT_FILTERS))).toEqual([
            'bea',
            'abe',
            'cy',
        ])
        expect(
            ids(filterPeople(people, { ...DEFAULT_FILTERS, countries: ['IN'] }))
        ).toEqual(['abe'])
        expect(
            ids(
                filterPeople(people, {
                    ...DEFAULT_FILTERS,
                    roles: ['frontend-developer'],
                    sort: 'name-desc',
                })
            )
        ).toEqual(['cy', 'bea'])
    })

    test('filters by stated seniority, including titles without one', () => {
        const levels = (values: string[]) =>
            ids(filterPeople(people, { ...DEFAULT_FILTERS, levels: values }))
        expect(levels(['senior'])).toEqual(['abe'])
        expect(levels([LEVEL_NOT_STATED])).toEqual(['cy'])
        expect(levels(['junior', 'senior'])).toEqual(['bea', 'abe'])
    })

    test('combines seniority with roles', () => {
        expect(
            ids(
                filterPeople(people, {
                    ...DEFAULT_FILTERS,
                    roles: ['frontend-developer'],
                    levels: ['junior'],
                })
            )
        ).toEqual(['bea'])
    })

    test('filters by available contact signals, requiring all selected signals', () => {
        expect(
            ids(
                filterPeople(people, { ...DEFAULT_FILTERS, signals: ['email'] })
            )
        ).toEqual(['bea'])
        expect(
            ids(
                filterPeople(people, {
                    ...DEFAULT_FILTERS,
                    signals: ['portfolio', 'linkedin'],
                })
            )
        ).toEqual(['bea'])
    })

    test('filters by working-hours overlap and drops unknown time zones', () => {
        const overlap = (timeZone: string, minHours: number, now: Date) =>
            ids(
                filterPeople(
                    people,
                    {
                        ...DEFAULT_FILTERS,
                        overlap: { timeZone, minHours },
                    },
                    now
                )
            )
        const january = new Date('2026-01-15T12:00:00Z')
        // The browser's New York zone uses UTC-5 in winter, UTC-4 in summer.
        expect(overlap('America/New_York', 0, july)).toEqual([
            'bea',
            'abe',
            'cy',
        ])
        expect(overlap('America/New_York', 2, january)).toEqual(['bea'])
        expect(overlap('America/New_York', 3, july)).toEqual(['bea'])
        // A fixed offset stays UTC-5 even during daylight-saving time.
        expect(overlap('GMT-5', 2, july)).toEqual(['bea'])
    })

    test('sorts by working-hours overlap, unknown time zones last', () => {
        const sorted = (timeZone: string) =>
            ids(
                filterPeople(
                    [people[2], people[1], people[0]],
                    {
                        ...DEFAULT_FILTERS,
                        sort: OVERLAP_SORT,
                        overlap: { timeZone, minHours: 0 },
                    },
                    july
                )
            )
        expect(sorted('America/New_York')).toEqual(['bea', 'abe', 'cy'])
        expect(sorted('Asia/Kolkata')).toEqual(['abe', 'bea', 'cy'])
    })

    test('does not mutate the input', () => {
        const before = ids(people)
        filterPeople(people, { ...DEFAULT_FILTERS, sort: 'name-asc' })
        expect(ids(people)).toEqual(before)
    })
})
