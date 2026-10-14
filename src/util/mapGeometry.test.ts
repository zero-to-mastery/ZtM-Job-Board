import { describe, expect, test } from 'vitest'
import { contactLinks, safeUrl } from './contactLinks'
import { escapeHtml, initials, isInBounds, safeImageUrl } from './mapGeometry'

describe('isInBounds', () => {
    const europe = { south: 35, west: -10, north: 60, east: 30 }

    test('checks latitude and longitude', () => {
        expect(isInBounds(51.5, -0.1, europe)).toBe(true)
        expect(isInBounds(40.7, -74, europe)).toBe(false)
        expect(isInBounds(10, 0, europe)).toBe(false)
    })

    test('handles views across the antimeridian', () => {
        const pacific = { south: -50, west: 160, north: 10, east: 200 }
        expect(isInBounds(-17.7, 178.1, pacific)).toBe(true) // Fiji
        expect(isInBounds(-13.8, -171.8, pacific)).toBe(true) // Samoa
        expect(isInBounds(-33.9, 151.2, pacific)).toBe(false) // Sydney
    })

    test('treats a view wider than the world as covering every longitude', () => {
        const wide = { south: -80, west: -300, north: 80, east: 300 }
        expect(isInBounds(0, 179, wide)).toBe(true)
    })
})

describe('marker HTML helpers', () => {
    test('escapes names placed in marker HTML', () => {
        expect(escapeHtml(`<img src=x onerror="alert('x')">`)).toBe(
            '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;'
        )
    })

    test('only allows http(s) image URLs and encodes CSS-breaking characters', () => {
        expect(safeImageUrl('https://github.com/a.png')).toBe(
            'https://github.com/a.png'
        )
        expect(safeImageUrl("https://x.io/a').png")).toBe(
            'https://x.io/a%27%29.png'
        )
        expect(safeImageUrl('javascript:alert(1)')).toBeNull()
        expect(safeImageUrl('YOUR_IMG_URL')).toBeNull()
        expect(safeImageUrl('')).toBeNull()
        expect(safeImageUrl(undefined)).toBeNull()
    })

    test('builds initials', () => {
        expect(initials('Ada Lovelace')).toBe('AL')
        expect(initials('cher')).toBe('C')
        expect(initials('  ')).toBe('?')
    })
})

describe('contact links', () => {
    test('normalizes and rejects unsafe URLs', () => {
        expect(safeUrl('www.example.com')).toBe('https://www.example.com/')
        expect(safeUrl('https://example.com/me')).toBe('https://example.com/me')
        expect(safeUrl('javascript:alert(1)')).toBeNull()
        expect(safeUrl('   ')).toBeNull()
        expect(safeUrl(undefined)).toBeNull()
    })

    test('skips missing and empty values alike', () => {
        expect(
            contactLinks({
                email: '',
                links: { website: undefined, github: 'https://github.com/a' },
            })
        ).toEqual([{ kind: 'github', href: 'https://github.com/a' }])
        expect(
            contactLinks({
                email: 'a@b.co',
                links: { linkedin: 'https://linkedin.com/in/a' },
            }).map(({ kind }) => kind)
        ).toEqual(['email', 'linkedin'])
    })
})
