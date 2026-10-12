import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { resolveCountry } from '../../src/util/countries/resolveCountry.js'
import { validateSkills } from '../../src/util/skills.js'

export class SubmissionLoadError extends Error {
    /** @param {{ file: string, message: string }[]} failures */
    constructor(failures) {
        super(
            `Failed to load ${failures.length} submission(s):\n` +
                failures.map((f) => `  ${f.file}: ${f.message}`).join('\n')
        )
        this.name = 'SubmissionLoadError'
        this.failures = failures
    }
}

/**
 * Reads every submission file in `sourceDir`, sorted by filename so the result
 * does not depend on filesystem ordering. Hidden files and directories are
 * skipped. All failures are collected and thrown together.
 *
 * @param {string} sourceDir
 * @returns {{ file: string, data: Record<string, any> }[]}
 */
export function loadSubmissions(sourceDir) {
    const entries = fs
        .readdirSync(sourceDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
        .map((entry) => entry.name)
        .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

    const submissions = []
    const failures = []

    for (const file of entries) {
        try {
            const raw = fs.readFileSync(path.join(sourceDir, file), 'utf-8')
            const data = JSON.parse(raw)
            if (
                data === null ||
                typeof data !== 'object' ||
                Array.isArray(data)
            ) {
                throw new Error('Submission must be a JSON object')
            }
            validateSkills(data.skills, file)
            submissions.push({ file, data })
        } catch (e) {
            failures.push({ file, message: e.message })
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
export function profileId(file) {
    return crypto.createHash('sha256').update(file).digest('hex').slice(0, 32)
}

/**
 * Builds the persons.json array. Original fields are kept as submitted; `id`
 * and `normalized` are added.
 *
 * @param {{ file: string, data: Record<string, any> }[]} submissions
 */
export function buildPersons(submissions) {
    const ids = new Map()

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
export function writeFileAtomic(file, content) {
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
 * any submission fails to load.
 *
 * @param {{ sourceDir: string, outputFile: string }} options
 * @returns {{ count: number }}
 */
export function aggregate({ sourceDir, outputFile }) {
    const persons = buildPersons(loadSubmissions(sourceDir))
    writeFileAtomic(outputFile, JSON.stringify(persons, null, 2))
    return { count: persons.length }
}

/**
 * Lists every country value that could not be fully resolved, grouped by the
 * original text, with the submissions that use it. Contains no personal data
 * beyond submission filenames.
 *
 * @param {{ file: string, data: Record<string, any> }[]} submissions
 */
export function buildCountryDiagnostics(submissions) {
    const statusOrder = ['partial', 'ambiguous', 'unresolved']
    const byStatus = {
        resolved: 0,
        partial: 0,
        ambiguous: 0,
        unresolved: 0,
        empty: 0,
    }
    const rawValues = new Set()
    const canonical = new Set()
    const grouped = new Map()

    for (const { file, data } of submissions) {
        const country = data.location?.country
        const resolution = resolveCountry(country)
        byStatus[resolution.status] += 1
        if (resolution.status !== 'empty') rawValues.add(country)
        resolution.countries.forEach((code) => canonical.add(code))

        if (!statusOrder.includes(resolution.status)) continue
        const key = JSON.stringify(country)
        if (!grouped.has(key)) {
            grouped.set(key, {
                original: country,
                status: resolution.status,
                countries: resolution.countries,
                issues: resolution.issues,
                submissions: [],
            })
        }
        grouped.get(key).submissions.push(file)
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
