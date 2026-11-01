import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { resolveCountry } from '../../src/util/countries/resolveCountry.ts'
import type {
    CountryIssue,
    CountryStatus,
} from '../../src/util/countries/resolveCountry.ts'
import { validateSkills } from '../../src/util/skills.ts'

export interface Submission {
    file: string
    data: Record<string, any>
}

export interface SubmissionFailure {
    file: string
    message: string
}

export interface Person {
    id: string
    normalized: { countries: string[] }
    [key: string]: any
}

export interface CountryDiagnosticsSummary {
    submissions: number
    distinctRawCountryValues: number
    distinctCanonicalCountries: number
    byStatus: Record<CountryStatus, number>
}

export interface CountryDiagnosticEntry {
    original: unknown
    status: CountryStatus
    countries: string[]
    issues: CountryIssue[]
    submissions: string[]
}

export interface CountryDiagnostics {
    summary: CountryDiagnosticsSummary
    entries: CountryDiagnosticEntry[]
}

export interface UnknownCountryValue {
    value: unknown
    files: string[]
}

export class SubmissionLoadError extends Error {
    failures: SubmissionFailure[]
    /** @param {SubmissionFailure[]} failures */
    constructor(failures: SubmissionFailure[]) {
        super(
            `Failed to load ${failures.length} submission(s):\n` +
                failures.map((f) => `  ${f.file}: ${f.message}`).join('\n')
        )
        this.name = 'SubmissionLoadError'
        this.failures = failures
    }
}
function validateCoordinates(coordinates: unknown) {
    if (coordinates === undefined) return

    const fail = (message: string): never => {
        throw new Error(`Invalid location.coordinates: ${message}`)
    }

    if (
        coordinates === null ||
        typeof coordinates !== 'object' ||
        Array.isArray(coordinates)
    ) {
        fail('must be an object containing exactly lat and lng')
    }

    const record = coordinates as Record<string, unknown>
    const keys = Object.keys(record)

    if (keys.length !== 2 || !keys.includes('lat') || !keys.includes('lng')) {
        fail('must contain exactly lat and lng')
    }

    const { lat, lng } = record

    const checkAxis = (
        name: string,
        value: unknown,
        min: number,
        max: number
    ) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            fail(`${name} must be a finite number`)
        }
        const numeric = value as number
        if (numeric < min || numeric > max) {
            fail(`${name} must be between ${min} and ${max}`)
        }
        if (decimalPlaces(numeric) > 2) {
            fail(`${name} must have at most 2 decimal places for privacy`)
        }
    }

    checkAxis('lat', lat, -90, 90)
    checkAxis('lng', lng, -180, 180)
}

function decimalPlaces(value: number): number {
    const text = String(value).toLowerCase()
    if (text.includes('e-')) {
        const [coefficient, exponent] = text.split('e-')
        return Number(exponent) + (coefficient.split('.')[1]?.length ?? 0)
    }
    return text.split('.')[1]?.length ?? 0
}

/**
 * Reads every submission file in `sourceDir`, sorted by filename so the result
 * does not depend on filesystem ordering. Hidden files and directories are
 * skipped. All failures are collected and thrown together.
 *
 * @param {string} sourceDir
 * @returns {Submission[]}
 */
export function loadSubmissions(sourceDir: string): Submission[] {
    const entries = fs
        .readdirSync(sourceDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
        .map((entry) => entry.name)
        .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

    const submissions: Submission[] = []
    const failures: SubmissionFailure[] = []

    for (const file of entries) {
        try {
            const raw = fs.readFileSync(path.join(sourceDir, file), 'utf-8')
            let data: Record<string, any>
            try {
                data = JSON.parse(raw)
            } catch (e) {
                throw new Error(
                    `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
                    { cause: e }
                )
            }
            if (
                data === null ||
                typeof data !== 'object' ||
                Array.isArray(data)
            ) {
                throw new Error('Submission must be a JSON object')
            }
            validateSkills(data.skills, file)
            validateCoordinates(data.location?.coordinates)
            submissions.push({ file, data })
        } catch (e) {
            failures.push({
                file,
                message: e instanceof Error ? e.message : String(e),
            })
        }
    }

    if (failures.length > 0) throw new SubmissionLoadError(failures)
    return submissions
}

/**
 * Stable profile id derived from the submission filename, so ids do not change
 * between aggregation runs.
 *
 * @param {string} file
 * @returns {string}
 */
export function profileId(file: string): string {
    return crypto.createHash('sha256').update(file).digest('hex').slice(0, 32)
}

/**
 * Builds the persons.json array. Original fields are kept as submitted; `id`
 * and `normalized` are added.
 *
 * @param {Submission[]} submissions
 * @returns {Person[]}
 */
export function buildPersons(submissions: Submission[]): Person[] {
    const ids = new Map<string, string>()

    return submissions.map(({ file, data }) => {
        const id = profileId(file)
        if (ids.has(id)) {
            throw new Error(
                `Profile id collision between ${ids.get(id)} and ${file}`
            )
        }
        ids.set(id, file)

        return {
            ...data,
            id,
            normalized: {
                countries: resolveCountry(data.location?.country).countries,
            },
        }
    })
}

/**
 * Writes via a temporary file and rename, so an interrupted write never leaves
 * a truncated file in place of a previously valid one.
 *
 * @param {string} file
 * @param {string} content
 */
export function writeFileAtomic(file: string, content: string): void {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    const tmp = `${file}.${process.pid}.tmp`
    try {
        fs.writeFileSync(tmp, content, 'utf-8')
        fs.renameSync(tmp, file)
    } catch (e) {
        fs.rmSync(tmp, { force: true })
        throw e
    }
}

/**
 * Aggregates all submissions into a single JSON file. Nothing is written if
 * any submission fails to load. The loaded submissions are returned so callers
 * can reuse them instead of reading every file again.
 *
 * @param {{ sourceDir: string, outputFile: string }} options
 * @returns {{ count: number, submissions: Submission[] }}
 */
export function aggregate({
    sourceDir,
    outputFile,
}: {
    sourceDir: string
    outputFile: string
}): { count: number; submissions: Submission[] } {
    const submissions = loadSubmissions(sourceDir)
    const persons = buildPersons(submissions)
    writeFileAtomic(outputFile, JSON.stringify(persons, null, 2))
    return { count: persons.length, submissions }
}

/**
 * Lists every country value that could not be fully resolved, grouped by the
 * original text, with the submissions that use it. Contains no personal data
 * beyond submission filenames.
 *
 * @param {Submission[]} submissions
 */
export function buildCountryDiagnostics(
    submissions: Submission[]
): CountryDiagnostics {
    const statusOrder: CountryStatus[] = ['partial', 'ambiguous', 'unresolved']
    const byStatus: Record<CountryStatus, number> = {
        resolved: 0,
        partial: 0,
        ambiguous: 0,
        unresolved: 0,
        empty: 0,
    }
    const rawValues = new Set<unknown>()
    const canonical = new Set<string>()
    const grouped = new Map<string, CountryDiagnosticEntry>()

    for (const { file, data } of submissions) {
        const country = data.location?.country
        const resolution = resolveCountry(country)
        byStatus[resolution.status] += 1
        if (resolution.status !== 'empty') rawValues.add(country)
        resolution.countries.forEach((code) => canonical.add(code))

        if (!statusOrder.includes(resolution.status)) continue
        const key = JSON.stringify(country)
        let entry = grouped.get(key)
        if (!entry) {
            entry = {
                original: country,
                status: resolution.status,
                countries: resolution.countries,
                issues: resolution.issues,
                submissions: [],
            }
            grouped.set(key, entry)
        }
        entry.submissions.push(file)
    }

    const entries = [...grouped.values()].sort(
        (a, b) =>
            statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) ||
            (String(a.original) < String(b.original) ? -1 : 1)
    )

    return {
        summary: {
            submissions: submissions.length,
            distinctRawCountryValues: rawValues.size,
            distinctCanonicalCountries: canonical.size,
            byStatus,
        },
        entries,
    }
}

/**
 * Distinct country values whose resolution produced an `unknown` issue — the
 * only actionable case (add an alias). Ambiguous, non-location and
 * statement-only issues are deliberate policy and stay in the diagnostics
 * report instead. Each value lists every submission that uses it; values are
 * sorted, files keep filename order, so the result is deterministic.
 *
 * @param {Submission[]} submissions
 * @returns {UnknownCountryValue[]}
 */
export function collectUnknownCountryValues(
    submissions: Submission[]
): UnknownCountryValue[] {
    const grouped = new Map<string, UnknownCountryValue>()

    for (const { file, data } of submissions) {
        const country = data.location?.country
        const resolution = resolveCountry(country)
        if (!resolution.issues.some((issue) => issue.type === 'unknown')) {
            continue
        }

        const key = JSON.stringify(country)
        let entry = grouped.get(key)
        if (!entry) {
            entry = { value: country, files: [] }
            grouped.set(key, entry)
        }
        entry.files.push(file)
    }

    return [...grouped.values()].sort((a, b) => {
        const left = String(a.value)
        const right = String(b.value)
        return left < right ? -1 : left > right ? 1 : 0
    })
}

/**
 * Formats the aggregation-time warning for unknown country values: header,
 * one line per distinct value, capped at `cap` value lines plus a remainder
 * line. Returns an empty string when there is nothing to report, so a
 * successful run with no unrecognised values still prints nothing.
 *
 * @param {UnknownCountryValue[]} entries
 * @param {number} [cap] maximum number of value lines
 * @returns {string}
 */
export function formatCountryWarning(
    entries: UnknownCountryValue[],
    cap = 10
): string {
    if (entries.length === 0) return ''

    const lines = entries
        .slice(0, cap)
        .map(
            (entry) =>
                `- ${JSON.stringify(String(entry.value))} (${entry.files.join(', ')})`
        )
    if (entries.length > cap) {
        lines.push(`…and ${entries.length - cap} more`)
    }

    return (
        'Unrecognised country value(s) (add an alias, see docs/country-normalization.md):\n' +
        lines.join('\n')
    )
}
