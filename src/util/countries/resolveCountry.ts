// Deterministic resolver from free-form `location.country` text to ISO 3166-1
// alpha-2 codes. Runs at JSON aggregation time (scripts/aggregate-json.mjs) and
// has no React, network or randomness dependencies.
//
// It deliberately does no fuzzy matching: a value is only resolved when it
// matches a canonical name or an explicit alias after normalisation. Anything
// else is reported (see `issues`) so a maintainer can add an alias.
//
// See docs/country-normalization.md for the full rules.

import { COUNTRY_NAMES } from './countryNames.ts'
import {
    COUNTRY_ALIASES,
    AMBIGUOUS_COUNTRY_TERMS,
    NON_LOCATION_TERMS,
} from './countryAliases.ts'

export type CountryStatus =
    | 'resolved'
    | 'partial'
    | 'ambiguous'
    | 'unresolved'
    | 'empty'

export interface CountryIssue {
    fragment: string
    type: 'ambiguous' | 'not-a-country' | 'statement-only' | 'unknown'
    reason: string
}

export interface CountryResolution {
    original: unknown
    countries: string[]
    status: CountryStatus
    issues: CountryIssue[]
}

const FLAGS_AND_EMOJI = /[\u{1F1E6}-\u{1F1FF}‍️]|\p{Extended_Pictographic}/gu

/**
 * Reduces a value to a comparison key: accents, emoji, punctuation, case and a
 * leading "the" are removed, "&" becomes "and" and whitespace is collapsed.
 *
 *   "  U.S.A "  -> "usa"
 *   "México"    -> "mexico"
 *   "Sri-Lanka" -> "sri lanka"
 *   "Thailand 🇹🇭" -> "thailand"
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeCountryKey(value: unknown): string {
    if (typeof value !== 'string') return ''
    return value
        .normalize('NFKD')
        .replace(FLAGS_AND_EMOJI, ' ')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[.'’‘`´]/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim()
        .replace(/^the /, '')
}

function buildIndex(entries: [string, string][], describe: string) {
    const index = new Map()
    for (const [name, value] of entries) {
        const key = normalizeCountryKey(name)
        if (!key) throw new Error(`Empty ${describe} key: "${name}"`)
        if (index.has(key) && index.get(key) !== value) {
            throw new Error(
                `Conflicting ${describe} for "${name}": ${index.get(key)} vs ${value}`
            )
        }
        index.set(key, value)
    }
    return index
}

for (const [alias, code] of Object.entries(COUNTRY_ALIASES)) {
    if (!(code in COUNTRY_NAMES)) {
        throw new Error(
            `Alias "${alias}" points to unknown country code ${code}`
        )
    }
}

const COUNTRY_INDEX = buildIndex(
    [
        ...Object.entries(COUNTRY_NAMES).map(
            ([code, name]): [string, string] => [name, code]
        ),
        ...Object.entries(COUNTRY_ALIASES),
    ],
    'country alias'
)
const AMBIGUOUS_INDEX = buildIndex(
    Object.entries(AMBIGUOUS_COUNTRY_TERMS),
    'ambiguous term'
)
const NON_LOCATION_INDEX = buildIndex(
    Object.entries(NON_LOCATION_TERMS),
    'non-location term'
)

const TWO_LETTER_REASON =
    'Bare two-letter codes are not accepted because they collide with state and province abbreviations'

// Phrases describing work preferences rather than where someone lives.
// Matched against normalised keys.
const STATEMENT_PATTERN =
    /\b(?:willing|willin|open to|relocat\w*|remote\w*|looking (?:forward|for|to)|move to|moving to|available|wfh|work from)\b/

// Separators between multiple locations: "USA/Belgium", "USA | Mexico",
// "Canada, China", "Poland <-> USA". "&" is handled separately because it
// also appears inside names such as "Bosnia & Herzegovina".
const LOCATION_SEPARATOR = /\s*(?:<->|<-|->|=>|[,/|;\\])\s*/

// Closed, non-nested "(...)" or "[...]" pairs.
const PARENTHETICAL = /[([]([^()[\]]*)[)\]]/g

/**
 * Exact lookup of a normalised key: canonical names, aliases, ambiguous and
 * non-location terms, then the two-letter rejection. Exact lookup always runs
 * before statement stripping.
 *
 * @param {string} key a normalised key
 * @returns {{ kind: 'country', code: string }
 *   | { kind: 'ambiguous' | 'not-a-country', reason: string }
 *   | undefined} undefined when nothing matched
 */
function lookupExact(
    key: string
):
    | { kind: 'country'; code: string }
    | { kind: 'ambiguous' | 'not-a-country'; reason: string }
    | undefined {
    if (AMBIGUOUS_INDEX.has(key)) {
        return { kind: 'ambiguous', reason: AMBIGUOUS_INDEX.get(key) }
    }
    if (NON_LOCATION_INDEX.has(key)) {
        return { kind: 'not-a-country', reason: NON_LOCATION_INDEX.get(key) }
    }
    if (COUNTRY_INDEX.has(key)) {
        return { kind: 'country', code: COUNTRY_INDEX.get(key) }
    }
    if (/^[a-z]{2}$/.test(key)) {
        return { kind: 'ambiguous', reason: TWO_LETTER_REASON }
    }
    return undefined
}

/**
 * Classifies a normalised key: exact lookup first, then the preference
 * statement rules. `endsScope` is true for a bare statement or a stripped
 * suffix statement ("India Remote" -> IN, endsScope): outside brackets such a
 * fragment ends the scope, so everything after it is dropped.
 *
 * @param {string} key a normalised key
 * @returns {{ kind: 'country', code?: string, reason?: string,
 *   endsScope: boolean }}
 */
function classify(key: string): {
    kind: string
    code?: string
    reason?: string
    endsScope: boolean
} {
    if (!key) return { kind: 'empty', endsScope: false }
    const exact = lookupExact(key)
    if (exact) return { ...exact, endsScope: false }

    const statement = STATEMENT_PATTERN.exec(key)
    if (!statement) return { kind: 'unknown', endsScope: false }
    if (statement.index === 0) return { kind: 'statement', endsScope: true }

    // "India Remote", "USA willing to relocate": keep only the text before
    // the statement, and only if that text is itself recognised. The prefix
    // contains no statement by construction, so an exact lookup is enough.
    const head = lookupExact(
        key
            .slice(0, statement.index)
            .replace(/\b(?:and|or|but|with)\s*$/, '')
            .trim()
    )
    if (head) return { ...head, endsScope: true }
    return { kind: 'unknown', endsScope: true }
}

/**
 * Splits one bracket-free segment on list separators, and each part on "&",
 * but only where the key is still unknown after classification — so exact
 * names ("Bosnia & Herzegovina") and statement-carrying parts stay whole.
 *
 * @param {string} segment
 * @param {boolean} inBracket
 * @returns {{ text: string, inBracket: boolean }[]}
 */
function splitSegment(
    segment: string,
    inBracket: boolean
): { text: string; inBracket: boolean }[] {
    const key = normalizeCountryKey(segment)
    if (classify(key).kind !== 'unknown') {
        return [{ text: segment, inBracket }]
    }

    const parts = segment.split(LOCATION_SEPARATOR)
    return parts.flatMap((part) => {
        if (
            part.includes('&') &&
            classify(normalizeCountryKey(part)).kind === 'unknown'
        ) {
            return part.split('&').map((text) => ({ text, inBracket }))
        }
        return [{ text: part, inBracket }]
    })
}

/**
 * Splits a value into the ordered fragments to classify. The whole text wins
 * when it is an exact name. Otherwise every closed, non-nested "(...)" or
 * "[...]" pair is extracted (matchAll) into alternating outside/inside
 * segments, and each segment goes through the separator/"&" splitting above.
 * A preference statement found in an outside segment ends the scope (the
 * caller breaks); inside brackets it only ends that bracket's fragment.
 *
 * @param {string} text
 * @returns {{ text: string, inBracket: boolean }[]}
 */
function fragments(text: string): { text: string; inBracket: boolean }[] {
    if (lookupExact(normalizeCountryKey(text))) {
        return [{ text, inBracket: false }]
    }

    const pairs = [...text.matchAll(PARENTHETICAL)]
    if (pairs.length === 0) {
        return splitSegment(text, false)
    }

    const result = []
    let offset = 0
    for (const pair of pairs) {
        result.push(...splitSegment(text.slice(offset, pair.index), false))
        result.push(...splitSegment(pair[1], true))
        offset = pair.index + pair[0].length
    }
    result.push(...splitSegment(text.slice(offset), false))
    return result
}

/**
 * Resolves a free-form country value to ISO 3166-1 alpha-2 codes.
 *
 * @param {unknown} value
 * @returns {CountryResolution}
 */
export function resolveCountry(value: unknown): CountryResolution {
    const original = value === undefined ? null : value

    if (value === null || value === undefined) {
        return { original, countries: [], status: 'empty', issues: [] }
    }
    if (typeof value !== 'string') {
        return {
            original,
            countries: [],
            status: 'unresolved',
            issues: [
                {
                    fragment: String(value),
                    type: 'unknown',
                    reason: 'Country is not a text value',
                },
            ],
        }
    }
    if (normalizeCountryKey(value) === '') {
        return { original, countries: [], status: 'empty', issues: [] }
    }

    const acc: { countries: string[]; issues: CountryIssue[] } = {
        countries: [],
        issues: [],
    }
    for (const { text, inBracket } of fragments(value)) {
        const classification = classify(normalizeCountryKey(text))
        const fragment = text.trim()

        if (classification.kind === 'country' && classification.code) {
            if (!acc.countries.includes(classification.code)) {
                acc.countries.push(classification.code)
            }
        } else if (
            classification.kind === 'ambiguous' ||
            classification.kind === 'not-a-country'
        ) {
            acc.issues.push({
                fragment,
                type: classification.kind as 'ambiguous' | 'not-a-country',
                reason: classification.reason ?? '',
            })
        } else if (classification.kind === 'unknown') {
            acc.issues.push({
                fragment,
                type: 'unknown',
                reason: 'Not a recognised country name or alias',
            })
        }
        // 'empty' and 'statement' append nothing.

        // A statement ends the scope — except inside brackets, where it only
        // ends the bracket content, and later segments keep going.
        if (classification.endsScope && !inBracket) break
    }

    if (acc.countries.length === 0 && acc.issues.length === 0) {
        acc.issues.push({
            fragment: value.trim(),
            type: 'statement-only',
            reason: 'Describes relocation or remote-work preferences, not a current country',
        })
    }

    let status: CountryStatus
    if (acc.countries.length > 0) {
        status = acc.issues.length > 0 ? 'partial' : 'resolved'
    } else if (acc.issues.some((issue) => issue.type === 'ambiguous')) {
        status = 'ambiguous'
    } else {
        status = 'unresolved'
    }

    return { original, countries: acc.countries, status, issues: acc.issues }
}
