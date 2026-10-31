import { describe, expect, test } from 'vitest'
import { buildSearchIndex } from './search-index.mjs'
const persons = [
    {
        id: 'profile-2',
        name: 'Alex Morgan',
        jobTitle: 'Frontend Engineer',
        location: {
            city: 'New York',
            state: 'NY',
            country: 'United States',
        },
        email: 'private@example.com',
        links: { github: 'https://github.com/private' },
    },
    {
        id: 'profile-1',
        name: 'Morgan Lee',
        jobTitle: 'Backend Developer',
        location: { city: 'Toronto', country: 'Canada' },
    },
]
describe('buildSearchIndex', () => {
    test('indexes searchable fields against profile IDs', () => {
        const index = buildSearchIndex(persons)
        expect(index.alex).toEqual(['profile-2'])
        expect(index.frontend).toEqual(['profile-2'])
        expect(index.new).toEqual(['profile-2'])
        expect(index.canada).toEqual(['profile-1'])
    })
    test('indexes each token once per profile', () => {
        const index = buildSearchIndex([
            {
                id: 'profile-1',
                name: 'Alex Alex',
                location: { city: 'Alex' },
            },
        ])
        expect(index.alex).toEqual(['profile-1'])
    })
    test('does not index email addresses or profile links', () => {
        const index = buildSearchIndex(persons)

        expect(index.private).toBeUndefined()
        expect(index.example).toBeUndefined()
        expect(index.github).toBeUndefined()
    })
    test('handles missing optional fields', () => {
        expect(
            buildSearchIndex([
                { id: 'profile-1', name: 'Taylor', location: {} },
            ])
        ).toEqual({ taylor: ['profile-1'] })
    })
    test('returns deterministic sorted tokens and IDs', () => {
        const index = buildSearchIndex([
            { id: 'z', name: 'React Developer' },
            { id: 'a', name: 'React Engineer' },
        ])
        expect(Object.keys(index)).toEqual([...Object.keys(index)].sort())
        expect(index.react).toEqual(['a', 'z'])
    })
    test('returns an empty index for no profiles', () => {
        expect(buildSearchIndex([])).toEqual({})
    })
})
