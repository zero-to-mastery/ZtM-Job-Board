// Deterministic resolver from free-form `jobTitle` text to canonical role ids,
// an explicit seniority level and explicitly named technologies. Runs at JSON
// aggregation time (scripts/aggregate-json.mjs) and has no React, network or
// randomness dependencies.
//
// Like the country resolver it does no fuzzy matching: a title is only
// classified by the explicit rules in roleAliases.js. Anything else is left
// unclassified and reported by `npm run role-diagnostics`.
//
// See docs/role-normalization.md for the full rules.

import { ROLE_IDS, SENIORITY_LEVELS } from './roleTaxonomy.js'
import {
    TOKEN_TYPOS,
    PHRASE_REWRITES,
    DEVELOPER_HEADS,
    OTHER_HEADS,
    ASPIRATION_TERMS,
    STUDENT_TERMS,
    EMPLOYMENT_TERMS,
    SENIORITY_TERMS,
    SPECIFIC_ROLE_RULES,
    FRAMEWORK_ROLE_RULES,
    GENERIC_ROLE_RULES,
    LANGUAGE_ROLE_RULE,
    TECHNOLOGY_ALIASES,
} from './roleAliases.js'

/**
 * @typedef {'classified' | 'partial' | 'unclassified' | 'empty'} RoleStatus
 * @typedef {'explicit' | 'unspecified' | 'conflicting'} SeniorityStatus
 *
 * @typedef {object} RoleResolution
 * @property {unknown} original The value exactly as submitted.
 * @property {string[]} roles Role ids in taxonomy order, without duplicates.
 * @property {string | null} seniority One of SENIORITY_LEVELS, or null.
 * @property {SeniorityStatus} seniorityStatus
 * @property {string[]} technologies Technology ids in order of appearance.
 * @property {RoleStatus} status
 * @property {string | null} reason Why the title is unclassified.
 * @property {string[]} unmatched Parts of a classified title that named no
 *   known role, e.g. "Project Manager" in "Frontend Developer/Project Manager".
 */

const ALL_RULES = [
    ...SPECIFIC_ROLE_RULES,
    ...FRAMEWORK_ROLE_RULES,
    ...GENERIC_ROLE_RULES,
    LANGUAGE_ROLE_RULE,
]
for (const rule of ALL_RULES) {
    if (!ROLE_IDS.includes(rule.role)) {
        throw new Error(`Role rule points to unknown role id ${rule.role}`)
    }
}

const DEVELOPER_HEAD_SET = new Set(DEVELOPER_HEADS)
const HEAD_SET = new Set([...DEVELOPER_HEADS, ...OTHER_HEADS])
const ASPIRATION_SET = new Set(ASPIRATION_TERMS)
const STUDENT_SET = new Set(STUDENT_TERMS)
const EMPLOYMENT_SET = new Set(EMPLOYMENT_TERMS)
const SENIORITY_BY_TERM = new Map(
    Object.entries(SENIORITY_TERMS).flatMap(([level, terms]) => {
        if (!SENIORITY_LEVELS.includes(level)) {
            throw new Error(`Unknown seniority level ${level}`)
        }
        return terms.map((term) => [term, level])
    })
)
const TECHNOLOGIES = new Map(
    Object.entries(TECHNOLOGY_ALIASES).map(([alias, ids]) => [
        alias,
        Array.isArray(ids) ? ids : [ids],
    ])
)
const MAX_TECHNOLOGY_WORDS = Math.max(
    ...[...TECHNOLOGIES.keys()].map((alias) => alias.split(' ').length)
)

const FLAGS_AND_EMOJI = /[\u{1F1E6}-\u{1F1FF}‍️]|\p{Extended_Pictographic}/gu

// Separators between roles in one title. "/", "&", "+" and "and" join closely
// related parts ("Mobile/Web Developer"), so a part without a job-title noun
// borrows the next one. The others separate independent parts.
const SEPARATOR = /(\|+|,|;|\.\s+|\/+|&+|\+|\band\b)/i
const TIGHT_SEPARATOR = /^(?:\/+|&+|\+|and)$/i

/**
 * Removes noise and turns symbols that would otherwise be lost as punctuation
 * into words: "C#" -> "csharp", "C++" -> "cpp", ".NET" -> "dotnet",
 * "Node.js" -> "Nodejs".
 *
 * @param {string} value
 */
function cleanTitle(value) {
    return value
        .normalize('NFKD')
        .replace(/\p{M}/gu, '')
        .replace(/[•◆▫·]/g, '|') // before emoji removal, which includes ▫
        .replace(/&#\d+;?/g, ' ') // stray HTML entities, e.g. "&#128522"
        .replace(/\bU\+[0-9A-F]{4,6}\b/gi, ' ') // "U+1F4BB"
        .replace(FLAGS_AND_EMOJI, ' ')
        .replace(/c#/gi, ' csharp ')
        .replace(/c\+\+/gi, ' cpp ')
        .replace(/(^|[^\p{L}\p{N}])\.net\b/giu, '$1 dotnet ')
        .replace(/(\p{L})\.js\b/giu, '$1js')
}

/**
 * Reduces text to a comparison key: lowercase, no accents or punctuation,
 * single spaces, known typos fixed and multi-word terms joined.
 *
 *   "Front-End Developer"  -> "frontend developer"
 *   "Sr. Full-Stack Dev"   -> "sr fullstack dev"
 *   "Fronted Web Developer" -> "frontend web developer"
 *   "C# / .NET Developer"  -> "csharp dotnet developer"
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeRoleKey(value) {
    if (typeof value !== 'string') return ''
    let key = cleanTitle(value)
        .toLowerCase()
        .replace(/['’‘`´.]/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim()
        .split(' ')
        .map((word) => TOKEN_TYPOS[word] ?? word)
        .join(' ')
    for (const [pattern, replacement] of PHRASE_REWRITES) {
        key = key.replace(pattern, replacement)
    }
    return key.replace(/\s+/g, ' ').trim()
}

const wordsOf = (key) => (key ? key.split(' ') : [])

function ruleMatches(rule, key, heads) {
    if (!rule.pattern.test(key)) return false
    if (rule.heads === 'any') return true
    const hasDeveloperHead = heads.some((h) => DEVELOPER_HEAD_SET.has(h))
    if (rule.heads === 'developer') return hasDeveloperHead
    if (rule.heads === 'developer-or-none') {
        return hasDeveloperHead || heads.length === 0
    }
    return heads.some((h) => rule.heads.includes(h))
}

/**
 * Splits a title into segments, then lets a segment without a job-title noun
 * borrow one across a tight separator:
 *
 *   "Mobile/Web Developer"        -> "mobile developer", "web developer"
 *   "Web Designer and Developer"  -> "web designer", "web developer"
 *   "AI Engineer | DevOps and Cloud Enthusiast"
 *       -> "ai engineer", "devops enthusiast" (aspiration), "cloud enthusiast"
 *
 * @param {string} text Cleaned title text, without parentheses.
 */
function segmentTitle(text) {
    const parts = text.split(SEPARATOR)
    const segments = []
    for (let i = 0; i < parts.length; i += 2) {
        // Drop "at <company>" and "@ <place>"
        const raw = parts[i].replace(/(?:@|\bat\b).*$/i, '').trim()
        const key = normalizeRoleKey(raw)
        const words = wordsOf(key)
        segments.push({
            raw,
            key,
            heads: words.filter((w) => HEAD_SET.has(w)),
            aspirational: words.some((w) => ASPIRATION_SET.has(w)),
            tightNext: TIGHT_SEPARATOR.test((parts[i + 1] ?? '').trim()),
        })
    }

    const nonEmpty = segments.filter((s) => s.key)

    // Forward: "Mobile" in "Mobile/Web Developer" -> "mobile developer".
    for (let i = 0; i < nonEmpty.length; i++) {
        const segment = nonEmpty[i]
        if (segment.heads.length > 0 || segment.aspirational) continue
        for (let j = i; j < nonEmpty.length - 1 && nonEmpty[j].tightNext; j++) {
            const next = nonEmpty[j + 1]
            if (next.aspirational) {
                segment.aspirational = true
                break
            }
            if (next.heads.length > 0) {
                const head = next.heads[next.heads.length - 1]
                segment.key = `${segment.key} ${head}`
                segment.heads = [head]
                break
            }
        }
    }

    // Backward: "Developer" in "Web Designer and Developer" -> "web developer".
    for (let i = 1; i < nonEmpty.length; i++) {
        const segment = nonEmpty[i]
        const previous = nonEmpty[i - 1]
        const words = wordsOf(segment.key)
        if (
            !previous.tightNext ||
            previous.heads.length === 0 ||
            !words.every((w) => HEAD_SET.has(w))
        ) {
            continue
        }
        const qualifiers = wordsOf(previous.key).filter(
            (w) => !HEAD_SET.has(w) && !SENIORITY_BY_TERM.has(w)
        )
        if (qualifiers.length === 0) continue
        segment.key = [...qualifiers, ...words].join(' ')
        segment.aspirational = segment.aspirational || previous.aspirational
    }

    return nonEmpty
}

const matchingRoles = (rules, { key, heads }) =>
    rules.filter((rule) => ruleMatches(rule, key, heads)).map((r) => r.role)

/**
 * Scans words for technology aliases, longest alias first.
 *
 * @param {string[]} words
 * @returns {{ ids: string[], uncovered: string[] }}
 */
function scanTechnologies(words) {
    const ids = []
    const uncovered = []
    for (let i = 0; i < words.length; ) {
        let length = Math.min(MAX_TECHNOLOGY_WORDS, words.length - i)
        for (; length > 0; length--) {
            const found = TECHNOLOGIES.get(words.slice(i, i + length).join(' '))
            if (found) {
                ids.push(...found)
                break
            }
        }
        if (length === 0) uncovered.push(words[i])
        i += Math.max(length, 1)
    }
    return { ids: [...new Set(ids)], uncovered }
}

// Segments with nothing to report: technologies, seniority words and bare
// job-title nouns ("React", "Junior Developer", "Engineer", "MERN stack").
const isDescriptiveOnly = (key) =>
    scanTechnologies(wordsOf(key)).uncovered.every(
        (w) =>
            SENIORITY_BY_TERM.has(w) ||
            DEVELOPER_HEAD_SET.has(w) ||
            w === 'stack'
    )

/**
 * Rule tiers, strongest first:
 *
 *   1. specific  every match counts ("Frontend Developer | UX Designer")
 *   2. framework "React Developer" -> frontend, only if no segment of the
 *                title matched a specific rule
 *   3. generic   web developer / software engineer, first match only
 *   4. language  "Python Developer" -> software engineer, only if the title
 *                has no other role at all
 *
 * @param {string} text Cleaned title text.
 */
function classifyText(text) {
    const allSegments = segmentTitle(text)
    const segments = allSegments.filter((s) => !s.aspirational)

    const matches = segments.map((segment) => ({
        segment,
        specific: matchingRoles(SPECIFIC_ROLE_RULES, segment),
        framework: matchingRoles(FRAMEWORK_ROLE_RULES, segment),
        generic: matchingRoles(GENERIC_ROLE_RULES, segment).slice(0, 1),
        language: ruleMatches(LANGUAGE_ROLE_RULE, segment.key, segment.heads),
    }))
    const titleHasSpecific = matches.some((m) => m.specific.length > 0)

    const roles = new Set()
    const unmatched = []
    let languageOnly = false
    for (const m of matches) {
        let found = m.specific
        if (found.length === 0 && !titleHasSpecific) found = m.framework
        if (found.length === 0) found = m.generic
        found.forEach((role) => roles.add(role))

        if (found.length > 0 || m.framework.length > 0) continue
        if (m.language) languageOnly = true
        else if (!isDescriptiveOnly(m.segment.key))
            unmatched.push(m.segment.raw)
    }
    if (roles.size === 0 && languageOnly) roles.add(LANGUAGE_ROLE_RULE.role)

    return {
        roles: ROLE_IDS.filter((id) => roles.has(id)),
        unmatched,
        aspirational: segments.length < allSegments.length,
    }
}

/**
 * @param {string} key Normalised key of the whole title.
 * @returns {{ seniority: string | null, seniorityStatus: SeniorityStatus }}
 */
function resolveSeniority(key) {
    const levels = new Set()
    for (const word of wordsOf(key)) {
        if (SENIORITY_BY_TERM.has(word)) levels.add(SENIORITY_BY_TERM.get(word))
    }
    if (levels.size === 0) {
        return { seniority: null, seniorityStatus: 'unspecified' }
    }
    if (levels.size > 1) {
        return { seniority: null, seniorityStatus: 'conflicting' }
    }
    return { seniority: [...levels][0], seniorityStatus: 'explicit' }
}

/**
 * Removes parenthesised text, including nested and unclosed parentheses:
 * "Engineer (JS, AEM UI(Sightly), Bootstrap)" -> "Engineer".
 *
 * @param {string} text
 */
function withoutParentheses(text) {
    let previous
    do {
        previous = text
        text = text.replace(/\([^()]*\)/g, ' ')
    } while (text !== previous)
    return text.replace(/\(.*$/, ' ').replace(/\)/g, ' ')
}

function unclassifiedReason(key, aspirational) {
    const words = wordsOf(key)
    if (aspirational) {
        return 'Describes an interest or aspiration, not a current role'
    }
    if (words.some((w) => STUDENT_SET.has(w))) {
        return 'Student or academic status, not a professional role'
    }
    if (
        words.some((w) => DEVELOPER_HEAD_SET.has(w)) &&
        words.every(
            (w) =>
                DEVELOPER_HEAD_SET.has(w) ||
                SENIORITY_BY_TERM.has(w) ||
                EMPLOYMENT_SET.has(w)
        )
    ) {
        return 'Generic title without a specialization'
    }
    return 'No recognized professional role'
}

/**
 * Resolves a submitted `jobTitle` to canonical metadata. The original value is
 * never modified.
 *
 *   resolveRole('Senior Front-End React Developer')
 *   // { roles: ['frontend-developer'], seniority: 'senior',
 *   //   technologies: ['react'], status: 'classified', ... }
 *
 * @param {unknown} value
 * @returns {RoleResolution}
 */
export function resolveRole(value) {
    const base = {
        original: value,
        roles: [],
        seniority: null,
        seniorityStatus: /** @type {SeniorityStatus} */ ('unspecified'),
        technologies: [],
        unmatched: [],
    }
    if (typeof value !== 'string' || !normalizeRoleKey(value)) {
        return { ...base, status: 'empty', reason: null }
    }

    const cleaned = cleanTitle(value)
    const fullKey = normalizeRoleKey(value)

    // Parenthesised text usually lists technologies ("Full Stack Developer
    // (React, Node)"), so it is ignored for roles unless the title has no
    // role without it: "(Full Stack/Game) Developer".
    let result = classifyText(withoutParentheses(cleaned))
    if (result.roles.length === 0 && /[()]/.test(cleaned)) {
        const unwrapped = classifyText(cleaned.replace(/[()]/g, ' '))
        if (unwrapped.roles.length > 0) result = unwrapped
    }

    const classified = result.roles.length > 0
    return {
        ...base,
        roles: result.roles,
        ...resolveSeniority(fullKey),
        technologies: scanTechnologies(wordsOf(fullKey)).ids,
        unmatched: classified ? result.unmatched : [],
        status: !classified
            ? 'unclassified'
            : result.unmatched.length > 0
              ? 'partial'
              : 'classified',
        reason: classified
            ? null
            : unclassifiedReason(fullKey, result.aspirational),
    }
}
