import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { useShortlist } from '../hooks/useShortlist'
import Person from '../interfaces/person'
import {
    parseShortlist,
    personHash,
    personIdFromHash,
    personUrl,
    shortlistCsv,
    SHORTLIST_STORAGE_KEY,
} from './shortlist'

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const site = {
    origin: 'https://zero-to-mastery.github.io',
    pathname: '/ZtM-Job-Board/',
    search: '',
}

const person = (overrides: Partial<Person>): Person => ({
    id: 'ada',
    img: '',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    jobTitle: 'Senior Back End Engineer',
    location: { city: 'London', country: 'UK' },
    links: {
        website: 'ada.dev',
        github: 'https://github.com/ada',
        linkedin: '',
    },
    normalized: {
        countries: ['GB'],
        roles: ['backend-developer'],
        seniority: 'senior',
        technologies: [],
        geo: null,
        timezone: null,
    },
    ...overrides,
})

describe('deep links', () => {
    test('round-trips ids through the hash', () => {
        expect(personHash('ruben-morera')).toBe('#person-ruben-morera')
        expect(personIdFromHash('#person-ruben-morera')).toBe('ruben-morera')
        expect(personIdFromHash(personHash('a b'))).toBe('a b')
    })

    test('ignores other hashes', () => {
        expect(personIdFromHash('')).toBeNull()
        expect(personIdFromHash('#top')).toBeNull()
        expect(personIdFromHash('#person-')).toBeNull()
        expect(personIdFromHash('#person-%E0%A4%A')).toBeNull()
    })

    test('builds a shareable URL', () => {
        expect(personUrl('ada', site)).toBe(
            'https://zero-to-mastery.github.io/ZtM-Job-Board/#person-ada'
        )
    })
})

describe('shortlist CSV', () => {
    test('has a header and one quoted row per developer', () => {
        const csv = shortlistCsv([person({})], site)
        const [header, row] = csv.split('\r\n')
        expect(header).toBe(
            '"Name","Title","Location","Email","Website","GitHub","LinkedIn","Profile link"'
        )
        expect(row).toBe(
            [
                'Ada Lovelace',
                'Senior Back End Engineer',
                'London, UK',
                'ada@example.com',
                'https://ada.dev/',
                'https://github.com/ada',
                '',
                'https://zero-to-mastery.github.io/ZtM-Job-Board/#person-ada',
            ]
                .map((value) => `"${value}"`)
                .join(',')
        )
    })

    test('escapes quotes, commas and newlines', () => {
        const csv = shortlistCsv(
            [person({ name: 'Ann "The Dev", Jr\nSmith', email: '' })],
            site
        )
        expect(csv.split('\r\n')[1]).toMatch(
            /^"Ann ""The Dev"", Jr\nSmith","Senior/
        )
    })

    test('neutralizes values a spreadsheet would run as formulas', () => {
        const csv = shortlistCsv([person({ name: '=HYPERLINK("x")' })], site)
        expect(csv.split('\r\n')[1]).toMatch(/^"'=HYPERLINK\(""x""\)"/)
    })
})

describe('useShortlist', () => {
    afterEach(() => localStorage.clear())

    const mount = () => {
        const result: { current?: ReturnType<typeof useShortlist> } = {}
        const Probe = () => {
            result.current = useShortlist()
            return null
        }
        const container = document.createElement('div')
        const root = createRoot(container)
        act(() => root.render(<Probe />))
        return { result, unmount: () => act(() => root.unmount()) }
    }

    test('persists starred ids across reloads', () => {
        const first = mount()
        act(() => first.result.current!.toggle('ada'))
        act(() => first.result.current!.toggle('grace'))
        act(() => first.result.current!.toggle('ada'))
        expect(first.result.current!.ids).toEqual(['grace'])
        first.unmount()

        const second = mount()
        expect(second.result.current!.ids).toEqual(['grace'])
        expect(second.result.current!.has('grace')).toBe(true)
        expect(localStorage.getItem(SHORTLIST_STORAGE_KEY)).toBe('["grace"]')
        second.unmount()
    })

    test('ignores corrupt stored data', () => {
        localStorage.setItem(SHORTLIST_STORAGE_KEY, '{not json')
        expect(parseShortlist('{not json')).toEqual([])
        expect(parseShortlist('[1,"a",null]')).toEqual(['a'])
        const { result, unmount } = mount()
        expect(result.current!.ids).toEqual([])
        unmount()
    })

    test('keeps working when storage is unavailable', () => {
        const spy = vi
            .spyOn(Storage.prototype, 'setItem')
            .mockImplementation(() => {
                throw new Error('QuotaExceededError')
            })
        const { result, unmount } = mount()
        act(() => result.current!.toggle('ada'))
        expect(result.current!.ids).toEqual(['ada'])
        unmount()
        spy.mockRestore()
    })
})
