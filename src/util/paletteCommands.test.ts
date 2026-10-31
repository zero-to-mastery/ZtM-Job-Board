// @vitest-environment node
import { describe, expect, test, vi } from 'vitest'
import {
    buildPaletteCommands,
    filterPaletteCommands,
    isPaletteShortcut,
    PaletteSource,
    searchCommand,
} from './paletteCommands'

const keyEvent = (init: Partial<KeyboardEvent>) =>
    ({
        key: '',
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        repeat: false,
        ...init,
    }) as KeyboardEvent

const source = (overrides: Partial<PaletteSource> = {}): PaletteSource => ({
    countries: [
        { code: 'DE', label: 'Germany' },
        { code: 'CA', label: 'Canada' },
    ],
    selectedCountries: [],
    onCountryChange: vi.fn(),
    jobTitles: ['Frontend Developer', 'Backend Developer'],
    selectedJobTitles: [],
    onJobTitleChange: vi.fn(),
    skills: ['React', 'TypeScript'],
    selectedSkills: [],
    onSkillChange: vi.fn(),
    sortOption: 'default',
    onSortChange: vi.fn(),
    onClear: vi.fn(),
    onSearch: vi.fn(),
    ...overrides,
})

describe('isPaletteShortcut', () => {
    test.each([
        ['Cmd+K', { key: 'k', metaKey: true }],
        ['Ctrl+K', { key: 'k', ctrlKey: true }],
        ['Ctrl+uppercase K', { key: 'K', ctrlKey: true }],
    ])('accepts %s', (_, init) => {
        expect(isPaletteShortcut(keyEvent(init))).toBe(true)
    })

    test.each([
        ['a plain k', { key: 'k' }],
        ['Ctrl+J', { key: 'j', ctrlKey: true }],
        ['Ctrl+Shift+K', { key: 'k', ctrlKey: true, shiftKey: true }],
        ['Ctrl+Alt+K', { key: 'k', ctrlKey: true, altKey: true }],
        ['an auto-repeat', { key: 'k', ctrlKey: true, repeat: true }],
    ])('ignores %s', (_, init) => {
        expect(isPaletteShortcut(keyEvent(init))).toBe(false)
    })
})

describe('buildPaletteCommands', () => {
    test('lists skills, countries, roles, sorts, then clear', () => {
        expect(buildPaletteCommands(source()).map((c) => c.label)).toEqual([
            'React',
            'TypeScript',
            'Germany',
            'Canada',
            'Frontend Developer',
            'Backend Developer',
            'Default',
            'Name A–Z',
            'Name Z–A',
            'Clear all filters',
        ])
    })

    test('applies each command through the matching existing callback', () => {
        const props = source()
        const byId = (id: string) =>
            buildPaletteCommands(props).find((c) => c.id === id)!

        byId('country:DE').apply()
        expect(props.onCountryChange).toHaveBeenCalledWith('DE')
        byId('skill:React').apply()
        expect(props.onSkillChange).toHaveBeenCalledWith('React')
        byId('role:Frontend Developer').apply()
        expect(props.onJobTitleChange).toHaveBeenCalledWith(
            'Frontend Developer'
        )
        byId('sort:name-asc').apply()
        expect(props.onSortChange).toHaveBeenCalledWith('name-asc')
        byId('action:clear').apply()
        expect(props.onClear).toHaveBeenCalledTimes(1)
    })

    test('marks the rows that are already applied', () => {
        const commands = buildPaletteCommands(
            source({
                selectedSkills: ['React'],
                selectedCountries: ['CA'],
                sortOption: 'name-desc',
            })
        )
        expect(commands.filter((c) => c.selected).map((c) => c.label)).toEqual([
            'React',
            'Canada',
            'Name Z–A',
        ])
    })
})

describe('buildPaletteCommands without skills', () => {
    test('adds no skill rows when no profile declares skills', () => {
        const categories = buildPaletteCommands(source({ skills: [] })).map(
            (c) => c.category
        )
        expect(categories).not.toContain('Skill')
    })
})

describe('filterPaletteCommands', () => {
    const commands = buildPaletteCommands(source())
    const labels = (query: string) =>
        filterPaletteCommands(commands, query).map((c) => c.label)

    test('returns every command for a blank query', () => {
        expect(labels('   ')).toHaveLength(10)
    })

    test('matches labels ignoring case and extra spacing', () => {
        expect(labels('  GERMANY ')).toEqual(['Germany'])
    })

    test('matches an en dash typed as a plain hyphen, and the reverse', () => {
        expect(labels('name a-z')).toEqual(['Name A–Z'])
        expect(labels('name a–z')).toEqual(['Name A–Z'])
    })

    test('matches role spelling variants the way the role search does', () => {
        expect(labels('front-end')).toEqual(['Frontend Developer'])
    })

    test('requires every term and can match on the category name', () => {
        expect(labels('country canada')).toEqual(['Canada'])
        expect(labels('country react')).toEqual([])
    })

    test('returns nothing for an unmatched query', () => {
        expect(labels('zzz')).toEqual([])
    })
})

describe('searchCommand', () => {
    test('is offered only for a non-blank query', () => {
        expect(searchCommand('   ', vi.fn())).toBeNull()
    })

    test('sets the text search to the normalized query', () => {
        const onSearch = vi.fn()
        const command = searchCommand('  react   native ', onSearch)!
        expect(command.label).toBe('Search developers for “react native”')
        command.apply()
        expect(onSearch).toHaveBeenCalledWith('react native')
    })
})
