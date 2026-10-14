import { useCallback, useMemo, useState } from 'react'
import Person from '../interfaces/person'
import {
    DEFAULT_FILTERS,
    filterPeople,
    PeopleFilters,
} from '../util/filterPeople'
import { shuffle } from '../util/shuffle'

const toggle = (values: string[], value: string) =>
    values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]

const shuffled = (people: Person[]) => {
    const copy = [...people]
    shuffle(copy)
    return copy
}

/**
 * Search, filter, sort and shuffle state shared by the card view and the map,
 * so both always show the same set of developers.
 */
export function useDeveloperFilters(people: Person[]) {
    const [order, setOrder] = useState(() => shuffled(people))
    const [filters, setFilters] = useState<PeopleFilters>(DEFAULT_FILTERS)

    const results = useMemo(
        () => filterPeople(order, filters),
        [order, filters]
    )

    const update = useCallback(
        (change: Partial<PeopleFilters>) =>
            setFilters((current) => ({ ...current, ...change })),
        []
    )

    const toggleIn = useCallback(
        (key: 'countries' | 'roles' | 'levels', value: string) =>
            setFilters((current) => ({
                ...current,
                [key]: toggle(current[key], value),
            })),
        []
    )

    return {
        filters,
        results,
        setSearch: useCallback(
            (search: string) => update({ search }),
            [update]
        ),
        toggleCountry: useCallback(
            (code: string) => toggleIn('countries', code),
            [toggleIn]
        ),
        toggleRole: useCallback(
            (id: string) => toggleIn('roles', id),
            [toggleIn]
        ),
        toggleLevel: useCallback(
            (level: string) => toggleIn('levels', level),
            [toggleIn]
        ),
        setOverlap: useCallback(
            (overlap: Partial<PeopleFilters['overlap']>) =>
                setFilters((current) => ({
                    ...current,
                    overlap: { ...current.overlap, ...overlap },
                })),
            []
        ),
        setSort: useCallback((sort: string) => update({ sort }), [update]),
        // Same as the old "Clear" button: keeps the search text
        // (and the recruiter's own time zone)
        clear: useCallback(
            () =>
                setFilters((current) => ({
                    ...DEFAULT_FILTERS,
                    search: current.search,
                    overlap: { ...current.overlap, minHours: 0 },
                })),
            []
        ),
        // Shows everyone again, e.g. before opening a #person-<id> link
        reset: useCallback(
            () =>
                setFilters((current) => ({
                    ...DEFAULT_FILTERS,
                    overlap: { ...current.overlap, minHours: 0 },
                })),
            []
        ),
        shuffle: useCallback(() => setOrder(shuffled), []),
    }
}

export type DeveloperFilters = ReturnType<typeof useDeveloperFilters>
