import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
    collectUnknownCountryValues,
    formatCountryWarning,
    loadSubmissions,
} from './aggregate.ts'

const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..'
)
const AGGREGATE_CLI = path.join(REPO_ROOT, 'scripts', 'aggregate-json.ts')

const submission = (name: string, country: string) => ({
    name,
    jobTitle: 'Developer',
    links: {},
    location: { city: 'City', state: '', country },
})

let tmp: any
let sourceDir: string

const writeFixtures = (fixtures: Record<string, unknown>) => {
    for (const [file, data] of Object.entries(fixtures)) {
        fs.writeFileSync(
            path.join(sourceDir, file),
            typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        )
    }
}

const collectFromFixtures = (fixtures: Record<string, unknown>) => {
    writeFixtures(fixtures)
    return collectUnknownCountryValues(loadSubmissions(sourceDir))
}

beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'country-warning-test-'))
    sourceDir = path.join(tmp, 'Submissions')
    fs.mkdirSync(sourceDir)
})

afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
})

describe('collectUnknownCountryValues', () => {
    test('keeps only values whose issues contain an unknown type', () => {
        const entries = collectFromFixtures({
            'alpha.json': submission('Alpha', 'Atlantis'),
            'bravo.json': submission('Bravo', 'Georgia'),
            'charlie.json': submission('Charlie', 'Earth'),
            'delta.json': submission('Delta', 'Remote'),
            'echo.json': submission('Echo', 'Nigeria/Istanbul/North-Macedonia'),
            'foxtrot.json': submission('Foxtrot', 'USA/Belgium'),
        })

        expect(entries.map((entry) => entry.value)).toEqual([
            'Atlantis',
            'Nigeria/Istanbul/North-Macedonia',
        ])
    })

    test('groups every file that uses a value, sorted by value', () => {
        const entries = collectFromFixtures({
            'zebra.json': submission('Zebra', 'Zebrawhere'),
            'apple.json': submission('Apple', 'Appletonia'),
            'mango.json': submission('Mango', 'Zebrawhere'),
        })

        expect(entries).toEqual([
            { value: 'Appletonia', files: ['apple.json'] },
            { value: 'Zebrawhere', files: ['mango.json', 'zebra.json'] },
        ])
    })

    test('is empty when every value is resolved, ambiguous or statement-only', () => {
        const entries = collectFromFixtures({
            'alpha.json': submission('Alpha', 'USA'),
            'bravo.json': submission('Bravo', 'Georgia'),
            'charlie.json': submission('Charlie', 'Earth'),
            'delta.json': submission('Delta', 'Willing to relocate'),
            'echo.json': submission('Echo', ''),
        })

        expect(entries).toEqual([])
    })
})

describe('formatCountryWarning', () => {
    test('is an empty string when there is nothing to report', () => {
        expect(formatCountryWarning([])).toBe('')
    })

    test('prints the header and one line per value', () => {
        const warning = formatCountryWarning([
            { value: 'Azad Kashmir Pakistan', files: ['echo.json'] },
            {
                value: 'Nigeria/Istanbul/North-Macedonia',
                files: ['hotel.json'],
            },
        ])

        expect(warning).toBe(
            'Unrecognised country value(s) (add an alias, see docs/country-normalization.md):\n' +
                '- "Azad Kashmir Pakistan" (echo.json)\n' +
                '- "Nigeria/Istanbul/North-Macedonia" (hotel.json)'
        )
    })

    test('lists every file that uses a value on its line', () => {
        const warning = formatCountryWarning([
            { value: 'Dupeland', files: ['a.json', 'b.json'] },
        ])

        expect(warning).toContain('- "Dupeland" (a.json, b.json)')
    })

    test('caps at 10 value lines and reports the remainder', () => {
        const entries = Array.from({ length: 13 }, (_: unknown, i: number) => ({
            value: `Mysteryland ${String(i + 1).padStart(2, '0')}`,
            files: [`mystery-${i + 1}.json`],
        }))
        const lines = formatCountryWarning(entries).split('\n')

        expect(lines).toHaveLength(12) // header + 10 values + remainder
        expect(lines[10]).toBe('- "Mysteryland 10" (mystery-10.json)')
        expect(lines[11]).toBe('…and 3 more')
    })
})

describe('aggregate-json CLI warning', () => {
    let outputFile: any

    const runCli = () =>
        spawnSync(process.execPath, [AGGREGATE_CLI], {
            cwd: tmp,
            encoding: 'utf-8',
        })

    beforeEach(() => {
        outputFile = path.join(tmp, 'src', 'assets', 'persons.json')
        fs.mkdirSync(path.dirname(outputFile), { recursive: true })
    })

    test('prints the exact warning for unknown values and exits 0', () => {
        writeFixtures({
            'echo.json': submission('Echo', 'Azad Kashmir Pakistan'),
            'delta.json': submission('Delta', 'Georgia'),
            'alpha.json': submission('Alpha', 'USA'),
        })

        const result = runCli()

        expect(result.status).toBe(0)
        expect(result.stderr).toBe('')
        expect(result.stdout).toBe(
            'Unrecognised country value(s) (add an alias, see docs/country-normalization.md):\n' +
                '- "Azad Kashmir Pakistan" (echo.json)\n'
        )
        expect(fs.existsSync(outputFile)).toBe(true)
    })

    test('prints nothing when no value is unknown', () => {
        writeFixtures({
            'alpha.json': submission('Alpha', 'USA/Belgium'),
            'delta.json': submission('Delta', 'Georgia'),
            'echo.json': submission('Echo', 'Earth'),
        })

        const result = runCli()

        expect(result.status).toBe(0)
        expect(result.stdout).toBe('')
        expect(result.stderr).toBe('')
    })

    test('caps the warning at 10 value lines', () => {
        const fixtures: Record<string, unknown> = {}
        for (let i = 1; i <= 12; i += 1) {
            fixtures[`mystery-${String(i).padStart(2, '0')}.json`] = submission(
                `Mystery ${i}`,
                `Mysteryland ${String(i).padStart(2, '0')}`
            )
        }
        writeFixtures(fixtures)

        const result = runCli()
        const lines = result.stdout.split('\n').filter((line) => line !== '')

        expect(result.status).toBe(0)
        expect(lines).toHaveLength(12)
        expect(lines[0]).toBe(
            'Unrecognised country value(s) (add an alias, see docs/country-normalization.md):'
        )
        expect(lines[11]).toBe('…and 2 more')
    })
})
