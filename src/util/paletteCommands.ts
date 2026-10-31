import { jobTitleKey, SortOption } from './filterProfiles'
import { CountryOption } from './personCountries'

export type PaletteCategory =
    | 'Skill'
    | 'Country'
    | 'Role'
    | 'Sort'
    | 'Action'
    | 'Search'

export interface PaletteCommand {
    id: string
    category: PaletteCategory
    label: string
    selected: boolean
    apply: () => void
}

export interface PaletteSource {
    countries: CountryOption[]
    selectedCountries: string[]
    onCountryChange: (countryCode: string) => void
    jobTitles: string[]
    selectedJobTitles: string[]
    onJobTitleChange: (jobTitle: string) => void
    skills: string[]
    selectedSkills: string[]
    onSkillChange: (skill: string) => void
    sortOption: SortOption
    onSortChange: (sortOption: SortOption) => void
    onClear: () => void
    onSearch: (search: string) => void
}

const sortLabels: [SortOption, string][] = [
    ['default', 'Default'],
    ['name-asc', 'Name A–Z'],
    ['name-desc', 'Name Z–A'],
]

// Same folding as the role search, plus en dash to hyphen so "a-z" matches
// "Name A–Z". Applied to queries and labels alike, so both sides agree.
export const paletteKey = (text: string) => jobTitleKey(text.replace(/–/g, '-'))

export function buildPaletteCommands(source: PaletteSource): PaletteCommand[] {
    const skills = source.skills.map(
        (skill): PaletteCommand => ({
            id: `skill:${skill}`,
            category: 'Skill',
            label: skill,
            selected: source.selectedSkills.includes(skill),
            apply: () => source.onSkillChange(skill),
        })
    )
    const countries = source.countries.map(
        (country): PaletteCommand => ({
            id: `country:${country.code}`,
            category: 'Country',
            label: country.label,
            selected: source.selectedCountries.includes(country.code),
            apply: () => source.onCountryChange(country.code),
        })
    )
    const roles = source.jobTitles.map(
        (jobTitle): PaletteCommand => ({
            id: `role:${jobTitle}`,
            category: 'Role',
            label: jobTitle,
            selected: source.selectedJobTitles.includes(jobTitle),
            apply: () => source.onJobTitleChange(jobTitle),
        })
    )
    const sorts = sortLabels.map(
        ([value, label]): PaletteCommand => ({
            id: `sort:${value}`,
            category: 'Sort',
            label,
            selected: source.sortOption === value,
            apply: () => source.onSortChange(value),
        })
    )
    const clear: PaletteCommand = {
        id: 'action:clear',
        category: 'Action',
        label: 'Clear all filters',
        selected: false,
        apply: source.onClear,
    }
    return [...skills, ...countries, ...roles, ...sorts, clear]
}

// Every whitespace-separated term must appear in the category plus label.
export function filterPaletteCommands(
    commands: PaletteCommand[],
    query: string
): PaletteCommand[] {
    const terms = paletteKey(query)
        .split(' ')
        .filter((term) => term !== '')
    if (terms.length === 0) return commands
    return commands.filter((command) => {
        const haystack = paletteKey(`${command.category} ${command.label}`)
        return terms.every((term) => haystack.includes(term))
    })
}

// Offered only for a non-blank query. It sets the shared text search, so the
// cards and count update the same way the header search box does.
export function searchCommand(
    query: string,
    onSearch: (search: string) => void
): PaletteCommand | null {
    const search = query.trim().replace(/\s+/g, ' ')
    if (search === '') return null
    return {
        id: 'search:text',
        category: 'Search',
        label: `Search developers for “${search}”`,
        selected: false,
        apply: () => onSearch(search),
    }
}

// Cmd+K on macOS or Ctrl+K elsewhere. Either modifier is accepted on every
// platform, so this needs no platform sniffing.
export function isPaletteShortcut(event: KeyboardEvent): boolean {
    return (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        !event.repeat &&
        event.key.toLowerCase() === 'k'
    )
}
