// Deterministic resolver from free-form `location.country` text to ISO 3166-1
// alpha-2 codes. Runs at JSON aggregation time (scripts/aggregate-json.mjs) and
// has no React, network or randomness dependencies.
//
// It deliberately does no fuzzy matching: a value is only resolved when it
// matches a canonical name or an explicit alias after normalisation. Anything
// else is reported (see `issues`) so a maintainer can add an alias.
//
// See docs/country-normalization.md for the full rules.

import { COUNTRY_NAMES } from './countryNames.js'
import {
    COUNTRY_ALIASES,
    AMBIGUOUS_COUNTRY_TERMS,
    NON_LOCATION_TERMS,
} from './countryAliases.js'

/**
 * @typedef {'resolved' | 'partial' | 'ambiguous' | 'unresolved' | 'empty'} CountryStatus
 *
 * @typedef {object} CountryIssue
 * @property {string} fragment The part of the original text that was not resolved.
 * @property {'ambiguous' | 'not-a-country' | 'statement-only' | 'unknown'} type
 * @property {string} reason
 *
 * @typedef {object} CountryResolution
 * @property {unknown} original The value exactly as submitted.
 * @property {string[]} countries ISO codes, in order of appearance, without duplicates.
 * @property {CountryStatus} status
 * @property {CountryIssue[]} issues
 */

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
export function normalizeCountryKey(value) {
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

function buildIndex(entries, describe) {
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
        ...Object.entries(COUNTRY_NAMES).map(([code, name]) => [name, code]),
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

// "(...)" or "[...]", including an unclosed one at the end of the string.
const PARENTHETICAL = /[([]([^()[\]]*)(?:[)\]]|$)/g

/**
 * @param {string} key a normalised key
 * @returns {{ kind: 'country', code: string }
 *   | { kind: 'ambiguous' | 'not-a-country', reason: string }
 *   | { kind: 'statement' | 'unknown' | 'empty' }}
 */
function classifyKey(key) {
    if (!key) return { kind: 'empty' }
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

    const statement = STATEMENT_PATTERN.exec(key)
    if (statement) {
        if (statement.index === 0) return { kind: 'statement' }
        // "India Remote", "USA willing to relocate": keep only the text
        // before the statement, and only if that text is itself recognised.
        const prefix = key
            .slice(0, statement.index)
            .replace(/\b(?:and|or|but|with)\s*$/, '')
            .trim()
        const head = classifyKey(prefix)
        if (head.kind !== 'statement' && head.kind !== 'empty') return head
    }

    return { kind: 'unknown' }
}

function collect(text, acc) {
    const classification = classifyKey(normalizeCountryKey(text))
    const fragment = text.trim()

    switch (classification.kind) {
        case 'empty':
            return
        case 'country':
            if (!acc.countries.includes(classification.code)) {
                acc.countries.push(classification.code)
            }
            return
        case 'statement':
            acc.statements += 1
            return
        case 'ambiguous':
        case 'not-a-country':
            acc.issues.push({
                fragment,
                type: classification.kind,
                reason: classification.reason,
            })
            return
    }

    // Unknown as a whole: try to split it into smaller pieces.
    const parentheticals = [...text.matchAll(PARENTHETICAL)]
    if (parentheticals.length > 0) {
        collect(text.replace(PARENTHETICAL, ' '), acc)
        for (const match of parentheticals) collect(match[1], acc)
        return
    }

    const parts = text.split(LOCATION_SEPARATOR)
    if (parts.length > 1) {
        for (const part of parts) collect(part, acc)
        return
    }

    if (text.includes('&')) {
        for (const part of text.split('&')) collect(part, acc)
        return
    }

    acc.issues.push({
        fragment,
        type: 'unknown',
        reason: 'Not a recognised country name or alias',
    })
}

/**
 * Resolves a free-form country value to ISO 3166-1 alpha-2 codes.
 *
 * @param {unknown} value
 * @returns {CountryResolution}
 */
export function resolveCountry(value) {
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

    const acc = { countries: [], issues: [], statements: 0 }
    collect(value, acc)

    if (acc.countries.length === 0 && acc.issues.length === 0) {
        acc.issues.push({
            fragment: value.trim(),
            type: 'statement-only',
            reason: 'Describes relocation or remote-work preferences, not a current country',
        })
    }

    let status
    if (acc.countries.length > 0) {
        status = acc.issues.length > 0 ? 'partial' : 'resolved'
    } else if (acc.issues.some((issue) => issue.type === 'ambiguous')) {
        status = 'ambiguous'
    } else {
        status = 'unresolved'
    }

    return { original, countries: acc.countries, status, issues: acc.issues }
}
