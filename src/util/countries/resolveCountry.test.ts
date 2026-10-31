import { describe, expect, test } from 'vitest'
import { resolveCountry, normalizeCountryKey } from './resolveCountry.ts'
import { COUNTRY_NAMES, getCountryName } from './countryNames.ts'
import { COUNTRY_ALIASES, AMBIGUOUS_COUNTRY_TERMS } from './countryAliases.ts'

const codesOf = (value: unknown) => resolveCountry(value).countries

describe('normalizeCountryKey', () => {
    test.each([
        ['  United   States ', 'united states'],
        ['U.S.A', 'usa'],
        ['México', 'mexico'],
        ['Sri-Lanka', 'sri lanka'],
        ['Thailand 🇹🇭', 'thailand'],
        ['🇲🇲Myanmar🇲🇲', 'myanmar'],
        ['Bosnia & Herzegovina', 'bosnia and herzegovina'],
        ['The Netherlands', 'netherlands'],
        ['Nigeria.', 'nigeria'],
        ['United States ', 'united states'],
    ])('%j -> %j', (input, expected) => {
        expect(normalizeCountryKey(input)).toBe(expected)
    })

    test('returns an empty key for non-strings', () => {
        expect(normalizeCountryKey(null)).toBe('')
        expect(normalizeCountryKey(undefined)).toBe('')
        expect(normalizeCountryKey(42)).toBe('')
    })
})

describe('resolveCountry', () => {
    // Every value below appears in Submissions/
    test.each([
        'USA',
        'US',
        'U.S.',
        'U.S.A',
        'United States',
        'United State',
        'United States of America',
        'United States Of America',
        'United States America',
        'UNited States',
        'USA (Willing to relocate!)',
        'USA (willing to relocate!)',
        'USA (Willing to relocate)',
    ])('%j resolves to US', (input) => {
        expect(resolveCountry(input)).toEqual({
            original: input,
            countries: ['US'],
            status: 'resolved',
            issues: [],
        })
    })

    test.each([
        ['Brasil', 'BR'],
        ['Brazil', 'BR'],
        ['Deutschland', 'DE'],
        ['México', 'MX'],
        ['Nederland', 'NL'],
        ['The Netherlands', 'NL'],
        ['Turkiye', 'TR'],
        ['Turkey', 'TR'],
        ['Thailand 🇹🇭', 'TH'],
        ['Thailand🇹🇭', 'TH'],
        ['🇲🇲Myanmar🇲🇲', 'MM'],
        ['Nigeria.', 'NG'],
        ['NIGERIA', 'NG'],
        ['india', 'IN'],
        [' Australia', 'AU'],
        ['eygpt', 'EG'],
        ['Sri-Lanka', 'LK'],
        ['Viet Nam', 'VN'],
        ['VietNam', 'VN'],
        ['Bosnia & Herzegovina', 'BA'],
        ['Bosnia and Herzegovina (Willing to relocate!)', 'BA'],
        ['UK', 'GB'],
        ['The United Kingdom', 'GB'],
        ['England', 'GB'],
        ['Northern Ireland', 'GB'],
        ['UAE', 'AE'],
        ['United Arab Emirate', 'AE'],
        ['South Korea', 'KR'],
        ['Korea (Republic of)', 'KR'],
        ['North Macedonia', 'MK'],
        ['Macedonia', 'MK'],
        ['Perú', 'PE'],
        ['Czech Republic', 'CZ'],
        ['Russia', 'RU'],
        ['Brunei Darussalam', 'BN'],
        ['Democratic Republic of the Congo', 'CD'],
        ['Hong Kong', 'HK'],
        ['ARUBA', 'AW'],
        ['Canada 🇨🇦 (Willing to relocate)', 'CA'],
        ['India Remote', 'IN'],
        ['India (Willing to Relocate!)', 'IN'],
        ['Algeria (willin to relocate)', 'DZ'],
        ['Nigeria (Open to Remote & Willing to Relocate)', 'NG'],
        ['Bolivia (Willing to Relocate or Work Remotely)', 'BO'],
        ['United Kingdom & Open to work remotely', 'GB'],
    ])('%j resolves to %s', (input, code) => {
        const result = resolveCountry(input)
        expect(result.countries).toEqual([code])
        expect(result.status).toBe('resolved')
    })

    test('every canonical name resolves to its own code', () => {
        for (const [code, name] of Object.entries(COUNTRY_NAMES)) {
            if (name in AMBIGUOUS_COUNTRY_TERMS) continue
            expect(codesOf(name)).toEqual([code])
        }
    })

    test('ambiguous terms take precedence over canonical names', () => {
        expect(COUNTRY_NAMES.GE).toBe('Georgia')
        expect(resolveCountry('Georgia').status).toBe('ambiguous')
    })

    test('every alias resolves to its declared code', () => {
        for (const [alias, code] of Object.entries(COUNTRY_ALIASES)) {
            expect(codesOf(alias)).toEqual([code])
        }
    })

    test('the original value is preserved exactly', () => {
        const input = '  USA (Willing to relocate!) '
        expect(resolveCountry(input).original).toBe(input)
    })

    test('is deterministic', () => {
        const input = 'Nigeria/Istanbul/North-Macedonia'
        expect(resolveCountry(input)).toEqual(resolveCountry(input))
    })

    describe('empty values', () => {
        test.each([[''], ['   '], ['🇹🇭']])('%j is empty', (input) => {
            expect(resolveCountry(input)).toEqual({
                original: input,
                countries: [],
                status: 'empty',
                issues: [],
            })
        })

        test('null and undefined are empty', () => {
            expect(resolveCountry(null).status).toBe('empty')
            expect(resolveCountry(undefined)).toEqual({
                original: null,
                countries: [],
                status: 'empty',
                issues: [],
            })
        })

        test('non-string values are unresolved, not thrown', () => {
            expect(resolveCountry(42).status).toBe('unresolved')
        })
    })

    describe('ambiguous values are never assigned a country', () => {
        test.each([
            'CH',
            'IN',
            'RU',
            'Georgia',
            'Korea',
            'Jerusalem',
            'Congo',
            'Georgia (Remote or Willing to Relocate)',
        ])('%j is ambiguous', (input) => {
            const result = resolveCountry(input)
            expect(result.countries).toEqual([])
            expect(result.status).toBe('ambiguous')
            expect(result.issues[0].type).toBe('ambiguous')
            expect(result.issues[0].reason).toBeTruthy()
        })
    })

    describe('non-locations and preference statements', () => {
        test.each([
            ['Earth', 'not-a-country'],
            ['Anywhere (Remotely) ', 'not-a-country'],
            ['Remote', 'statement-only'],
            ['Willing to relocate internationally', 'statement-only'],
            ['(Willing to relocate!)', 'statement-only'],
        ])('%j is unresolved (%s)', (input, type) => {
            const result = resolveCountry(input)
            expect(result.countries).toEqual([])
            expect(result.status).toBe('unresolved')
            expect(result.issues.map((issue) => issue.type)).toEqual([type])
        })

        test('unknown places are unresolved, not guessed', () => {
            expect(resolveCountry('Azad Kashmir Pakistan')).toMatchObject({
                countries: [],
                status: 'unresolved',
                issues: [
                    { fragment: 'Azad Kashmir Pakistan', type: 'unknown' },
                ],
            })
            // No fuzzy matching
            expect(codesOf('Germanyy')).toEqual([])
            expect(codesOf('Nigerria')).toEqual([])
        })
    })

    describe('compound values', () => {
        test.each([
            ['Canada, China', ['CA', 'CN']],
            ['USA/Belgium', ['US', 'BE']],
            ['USA | Mexico', ['US', 'MX']],
            ['Poland <-> USA', ['PL', 'US']],
        ])('%j resolves to %j', (input, codes) => {
            expect(resolveCountry(input)).toMatchObject({
                countries: codes,
                status: 'resolved',
                issues: [],
            })
        })

        test('aliases of the same country are not duplicated', () => {
            expect(resolveCountry('United Kingdom, UK')).toMatchObject({
                countries: ['GB'],
                status: 'resolved',
            })
        })

        test('a relocation destination is not a current country', () => {
            expect(
                resolveCountry('Spain | Looking forward to move to New Zealand')
            ).toMatchObject({ countries: ['ES'], status: 'resolved' })
            expect(codesOf('Relocating to Canada')).toEqual([])
        })

        test.each([
            ['USA (remote), Belgium', ['US', 'BE']],
            ['USA (Willing to relocate), Canada', ['US', 'CA']],
            ['USA (Willing to relocate to Canada) / Belgium', ['US', 'BE']],
            ['USA [remote]; Belgium', ['US', 'BE']],
            ['USA (remote), Belgium (remote), Canada', ['US', 'BE', 'CA']],
            [
                'USA (Willing to relocate to Canada, China), Belgium',
                ['US', 'BE'],
            ],
        ])('keeps countries outside a scoped note: %j', (input, countries) => {
            expect(resolveCountry(input)).toEqual({
                original: input,
                countries,
                status: 'resolved',
                issues: [],
            })
        })

        test.each([
            [
                'Canada, USA, willing to relocate to Germany, France',
                ['CA', 'US'],
            ],
            ['USA/Belgium willing to relocate to Canada, China', ['US', 'BE']],
            ['USA; open to remote work in Belgium / Germany', ['US']],
            ['USA & willing to relocate to Canada & China', ['US']],
            [
                'USA (remote), Belgium willing to relocate to Canada, China',
                ['US', 'BE'],
            ],
            ['USA willing to relocate to Canada (China)', ['US']],
            ['USA, willing to relocate to Germany (France), China', ['US']],
        ])(
            'excludes the entire preference destination list: %j',
            (input, countries) => {
                expect(resolveCountry(input)).toEqual({
                    original: input,
                    countries,
                    status: 'resolved',
                    issues: [],
                })
            }
        )

        test.each([
            'Relocating to Canada, China',
            'Remote (USA), Belgium',
            'Willing to relocate to Canada (China) / Belgium',
        ])(
            'does not extract countries from a statement-only list: %j',
            (input) => {
                expect(resolveCountry(input)).toMatchObject({
                    countries: [],
                    status: 'unresolved',
                    issues: [{ type: 'statement-only' }],
                })
            }
        )

        test.each([
            ['Bosnia & Herzegovina Remote', ['BA']],
            [
                'Bosnia & Herzegovina & willing to relocate to Canada, China',
                ['BA'],
            ],
            ['Korea, Republic of willing to relocate to Canada, China', ['KR']],
        ])(
            'keeps a punctuated country name before a preference: %j',
            (input, countries) => {
                expect(resolveCountry(input)).toEqual({
                    original: input,
                    countries,
                    status: 'resolved',
                    issues: [],
                })
            }
        )

        test('unresolved fragments are reported alongside resolved ones', () => {
            expect(resolveCountry('Nigeria/Istanbul/North-Macedonia')).toEqual({
                original: 'Nigeria/Istanbul/North-Macedonia',
                countries: ['NG', 'MK'],
                status: 'partial',
                issues: [
                    {
                        fragment: 'Istanbul',
                        type: 'unknown',
                        reason: 'Not a recognised country name or alias',
                    },
                ],
            })
        })

        test('an ambiguous fragment does not block the rest', () => {
            expect(resolveCountry('Georgia / Germany')).toMatchObject({
                countries: ['DE'],
                status: 'partial',
                issues: [{ fragment: 'Georgia', type: 'ambiguous' }],
            })
        })

        test('mixed city and country values keep only the country', () => {
            expect(resolveCountry('Canada (Toronto)')).toMatchObject({
                countries: ['CA'],
                status: 'partial',
                issues: [{ fragment: 'Toronto', type: 'unknown' }],
            })
        })
    })
})

describe('getCountryName', () => {
    test('returns canonical labels', () => {
        expect(getCountryName('US')).toBe('United States')
        expect(getCountryName('TR')).toBe('Türkiye')
        expect(getCountryName('KR')).toBe('South Korea')
    })

    test('falls back to the code for unknown codes', () => {
        expect(getCountryName('ZZ')).toBe('ZZ')
    })

    test('covers all 249 ISO 3166-1 codes', () => {
        const codes = Object.keys(COUNTRY_NAMES)
        expect(codes).toHaveLength(249)
        codes.forEach((code) => expect(code).toMatch(/^[A-Z]{2}$/))
    })
})
