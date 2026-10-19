import { useCallback, useMemo, useState } from 'react'
import Person from '../interfaces/person'
import {
    DEFAULT_FILTERS,
    filterPeople,
    PeopleFilters,
} from '../util/filterPeople'
import { ContactSignal } from '../util/contactLinks'
import { shuffle } from '../util/shuffle'

const toggle = <T extends string>(values: T[], value: T): T[] =>
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
export function useDeveloperFilters(people: Person[], now: Date) {
    const [order, setOrder] = useState(() => shuffled(people))
    const [filters, setFilters] = useState<PeopleFilters>(DEFAULT_FILTERS)

    const results = useMemo(
        () => filterPeople(order, filters, now),
        [order, filters, now]
    )

    const update = useCallback(
        (change: Partial<PeopleFilters>) =>
            setFilters((current) => ({ ...current, ...change })),
        []
    )

    const toggleIn = useCallback(
        (key: 'countries' | 'roles', value: string) =>
            setFilters((current) => ({
                ...current,
                [key]: toggle(current[key], value),
            })),
        []
    )

    const toggleSignal = useCallback((signal: ContactSignal) => {
        setFilters((current) => ({
            ...current,
            signals: toggle(current.signals, signal),
        }))
    }, [])

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
        setLevel: useCallback(
            (level: string) => update({ levels: level ? [level] : [] }),
            [update]
        ),
        toggleSignal,
        setOverlap: useCallback(
            (overlap: Partial<PeopleFilters['overlap']>) =>
                setFilters((current) => ({
                    ...current,
                    overlap: { ...current.overlap, ...overlap },
                })),
            []
        ),
        setSort: useCallback((sort: string) => update({ sort }), [update]),
        // Clears search, filters and sort, but keeps the recruiter's own time zone
        clear: useCallback(
            () =>
                setFilters((current) => ({
                    ...DEFAULT_FILTERS,
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
