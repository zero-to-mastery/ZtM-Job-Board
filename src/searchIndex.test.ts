import { describe, it, expect } from 'vitest'
import { filterPersons } from './util/searchIndex'

describe('Static search index filter', () => {
    it('returns array when query is empty', () => {
        const result = filterPersons('')
        expect(Array.isArray(result)).toBe(true)
    })

    it('handles query filtering gracefully', () => {
        const result = filterPersons('Engineer')
        expect(Array.isArray(result)).toBe(true)
    })
})
