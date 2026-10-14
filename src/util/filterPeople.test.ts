import { describe, expect, test } from 'vitest'
import Person from '../interfaces/person'
import { DEFAULT_FILTERS, filterPeople, LEVEL_NOT_STATED } from './filterPeople'

// Search, country, role and sort behaviour is covered by the
// filterProfiles tests; these cover what filterPeople adds on top.

const person = (
    id: string,
    normalized: Partial<NonNullable<Person['normalized']>>
): Person => ({
    id,
    img: '',
    name: id,
    jobTitle: '',
    location: {},
    links: {},
    normalized: {
        countries: [],
        roles: [],
        seniority: null,
        technologies: [],
        ...normalized,
    },
})

const people = [
    person('bea', {
        countries: ['NG'],
        roles: ['frontend-developer'],
        seniority: 'junior',
        timezone: { name: 'Africa/Lagos', utcOffset: 60 },
    }),
    person('abe', {
        countries: ['IN'],
        roles: ['data-scientist'],
        seniority: 'senior',
        timezone: { name: 'Asia/Kolkata', utcOffset: 330 },
    }),
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

    test('filters by working-hours overlap and drops unknown time zones', () => {
        const overlap = (offset: number, minHours: number) =>
            ids(
                filterPeople(
                    people,
                    { ...DEFAULT_FILTERS, overlap: { offset, minHours } },
                    july
                )
            )
        // Off at zero hours
        expect(overlap(0, 0)).toEqual(['bea', 'abe', 'cy'])
        // A recruiter at UTC+1: Lagos 8h, Kolkata (UTC+5:30) 3.5h
        expect(overlap(60, 4)).toEqual(['bea'])
        expect(overlap(60, 3.5)).toEqual(['bea', 'abe'])
    })

    test('does not mutate the input', () => {
        const before = ids(people)
        filterPeople(people, { ...DEFAULT_FILTERS, sort: 'name-asc' })
        expect(ids(people)).toEqual(before)
    })
})
