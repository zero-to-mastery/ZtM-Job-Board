import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
    aggregate,
    buildCountryDiagnostics,
    buildPersons,
    loadSubmissions,
    profileId,
    SubmissionLoadError,
} from './aggregate.ts'

const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..'
)
const AGGREGATE_CLI = path.join(REPO_ROOT, 'scripts', 'aggregate-json.ts')

interface SubmissionFixture {
    name: string
    img: string
    email: string
    links: { website: string; linkedin: string; github: string }
    jobTitle: string
    location: {
        city: string
        state: string
        country: string
        coordinates?: unknown
    }
}

const submission = (name: string, country: string): SubmissionFixture => ({
    name,
    img: '',
    email: '',
    links: { website: '', linkedin: '', github: '' },
    jobTitle: 'Web Developer',
    location: { city: 'City', state: '', country },
})

// Country values taken from real submissions
const FIXTURES: Record<string, Record<string, any>> = {
    'alpha.json': submission('Alpha', 'USA (Willing to relocate!)'),
    'bravo.json': submission('Bravo', 'United States of America'),
    'charlie.json': submission('Charlie', 'USA/Belgium'),
    'delta.json': submission('Delta', 'Georgia'),
    'echo.json': submission('Echo', 'Azad Kashmir Pakistan'),
    'foxtrot.json': submission('Foxtrot', ''),
    'golf.json': { name: 'Golf', jobTitle: 'Developer', links: {} },
    'hotel.json': submission('Hotel', 'Nigeria/Istanbul/North-Macedonia'),
    'india.json': submission(
        'India',
        'Spain | Looking forward to move to New Zealand'
    ),
}

let tmp: string
let sourceDir: string
let outputFile: string

const writeFixtures = (fixtures: Record<string, unknown>) => {
    for (const [file, data] of Object.entries(fixtures)) {
        fs.writeFileSync(
            path.join(sourceDir, file),
            typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        )
    }
}

const hashDir = (dir: string) =>
    fs
        .readdirSync(dir)
        .sort()
        .map((file) => {
            const content = fs.readFileSync(path.join(dir, file))
            return `${file}:${crypto.createHash('sha256').update(content).digest('hex')}`
        })
        .join('\n')

beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aggregate-test-'))
    sourceDir = path.join(tmp, 'Submissions')
    outputFile = path.join(tmp, 'persons.json')
    fs.mkdirSync(sourceDir)
})

afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
})

describe('aggregate', () => {
    test('creates a missing output directory (fresh checkout has no src/assets)', () => {
        writeFixtures(FIXTURES)
        const nested = path.join(tmp, 'src', 'assets', 'persons.json')
        const { count } = aggregate({ sourceDir, outputFile: nested })
        expect(count).toBe(Object.keys(FIXTURES).length)
        expect(JSON.parse(fs.readFileSync(nested, 'utf-8'))).toHaveLength(
            Object.keys(FIXTURES).length
        )
    })

    test('keeps every submission and its original fields', () => {
        writeFixtures(FIXTURES)
        const { count } = aggregate({ sourceDir, outputFile })
        const persons = JSON.parse(fs.readFileSync(outputFile, 'utf-8'))

        expect(count).toBe(Object.keys(FIXTURES).length)
        expect(persons).toHaveLength(Object.keys(FIXTURES).length)

        const files = Object.keys(FIXTURES).sort()
        persons.forEach((person: Record<string, any>, i: number) => {
            const { id, normalized, ...original } = person
            expect(original).toEqual(FIXTURES[files[i]])
            expect(id).toBe(profileId(files[i]))
        })
    })

    test('accepts valid optional coordinates and preserves them', () => {
        const profile = submission('Coordinates', 'United States')
        profile.location.coordinates = { lat: 39.29, lng: -79.34 }

        writeFixtures({ 'coordinates.json': profile })
        aggregate({ sourceDir, outputFile })

        const [person] = JSON.parse(fs.readFileSync(outputFile, 'utf-8'))
        expect(person.location.coordinates).toEqual({
            lat: 39.29,
            lng: -79.34,
        })
    })

    test('accepts submissions without coordinates', () => {
        writeFixtures({
            'no-coordinates.json': submission('No coordinates', 'India'),
        })

        expect(() => aggregate({ sourceDir, outputFile })).not.toThrow()
    })

    test.each([
        ['minimum latitude and longitude', { lat: -90, lng: -180 }],
        ['maximum latitude and longitude', { lat: 90, lng: 180 }],
        ['integer coordinates', { lat: 40, lng: -74 }],
        ['one decimal place', { lat: 40.7, lng: -74.1 }],
        ['negative coordinates', { lat: -79.34, lng: -39.29 }],
    ])('accepts valid coordinates: %s', (_label, coordinates) => {
        const profile = submission('Valid coordinates', 'United States')
        profile.location.coordinates = coordinates

        writeFixtures({ 'valid-coordinates.json': profile })

        expect(() => aggregate({ sourceDir, outputFile })).not.toThrow()

        const [person] = JSON.parse(fs.readFileSync(outputFile, 'utf-8'))
        expect(person.location.coordinates).toEqual(coordinates)
    })

    test.each([
        [
            'latitude out of range',
            { lat: 90.01, lng: 20 },
            /lat must be between/,
        ],
        [
            'longitude out of range',
            { lat: 20, lng: 180.01 },
            /lng must be between/,
        ],
        [
            'too many latitude decimals',
            { lat: 39.291, lng: -79.34 },
            /lat must have at most 2 decimal places/,
        ],
        [
            'too many longitude decimals',
            { lat: 39.29, lng: -79.341 },
            /lng must have at most 2 decimal places/,
        ],
        [
            'string latitude',
            { lat: '39.29', lng: -79.34 },
            /lat must be a finite number/,
        ],
        [
            'extra coordinate key',
            { lat: 39.29, lng: -79.34, address: 'private' },
            /must contain exactly lat and lng/,
        ],
        [
            'missing longitude',
            { lat: 39.29 },
            /must contain exactly lat and lng/,
        ],
        [
            'null coordinates',
            null,
            /must be an object containing exactly lat and lng/,
        ],
        [
            'array coordinates',
            [39.29, -79.34],
            /must be an object containing exactly lat and lng/,
        ],
        [
            'latitude below minimum',
            { lat: -90.01, lng: 20 },
            /lat must be between/,
        ],
        [
            'longitude below minimum',
            { lat: 20, lng: -180.01 },
            /lng must be between/,
        ],
        [
            'boolean latitude',
            { lat: true, lng: 20 },
            /lat must be a finite number/,
        ],
        [
            'null latitude',
            { lat: null, lng: 20 },
            /lat must be a finite number/,
        ],
        ['missing latitude', { lng: -74 }, /must contain exactly lat and lng/],
    ])('rejects invalid coordinates: %s', (_label, coordinates, message) => {
        const profile = submission('Invalid coordinates', 'United States')
        profile.location.coordinates = coordinates

        writeFixtures({ 'invalid-coordinates.json': profile })

        expect(() => loadSubmissions(sourceDir)).toThrow(message)
        expect(() => loadSubmissions(sourceDir)).toThrow(
            /invalid-coordinates\.json/
        )
    })

    test('adds normalized country codes', () => {
        writeFixtures(FIXTURES)
        aggregate({ sourceDir, outputFile })
        const persons = JSON.parse(fs.readFileSync(outputFile, 'utf-8'))
        const byName = Object.fromEntries(
            persons.map((p: Record<string, any>) => [
                p.name,
                p.normalized.countries,
            ])
        )

        expect(byName).toEqual({
            Alpha: ['US'],
            Bravo: ['US'],
            Charlie: ['US', 'BE'],
            Delta: [],
            Echo: [],
            Foxtrot: [],
            Golf: [],
            Hotel: ['NG', 'MK'],
            India: ['ES'],
        })
        // Original text is kept for display
        expect(persons[0].location.country).toBe('USA (Willing to relocate!)')
    })

    test('preserves scoped country notes and excludes relocation destination lists', () => {
        const fixtures: Record<string, SubmissionFixture> = {
            'alpha.json': submission('Alpha', 'USA (remote), Belgium'),
            'bravo.json': submission(
                'Bravo',
                'USA (Willing to relocate), Canada'
            ),
            'charlie.json': submission(
                'Charlie',
                'Canada, USA, willing to relocate to Germany, France'
            ),
            'delta.json': submission(
                'Delta',
                'USA/Belgium willing to relocate to Canada, China'
            ),
        }
        writeFixtures(fixtures)
        aggregate({ sourceDir, outputFile })
        const first = fs.readFileSync(outputFile, 'utf-8')
        const persons = JSON.parse(first)

        expect(
            persons.map(
                (person: Record<string, any>) => person.normalized.countries
            )
        ).toEqual([
            ['US', 'BE'],
            ['US', 'CA'],
            ['CA', 'US'],
            ['US', 'BE'],
        ])
        persons.forEach((person: Record<string, any>, i: number) => {
            const { id, normalized, ...original } = person
            expect(original).toEqual(fixtures[Object.keys(fixtures).sort()[i]!])
        })
        aggregate({ sourceDir, outputFile })
        expect(fs.readFileSync(outputFile, 'utf-8')).toBe(first)
    })

    test('does not modify source submissions', () => {
        writeFixtures(FIXTURES)
        const before = hashDir(sourceDir)
        aggregate({ sourceDir, outputFile })
        expect(hashDir(sourceDir)).toBe(before)
    })

    test('produces identical output across runs', () => {
        writeFixtures(FIXTURES)
        aggregate({ sourceDir, outputFile })
        const first = fs.readFileSync(outputFile)
        aggregate({ sourceDir, outputFile })
        expect(fs.readFileSync(outputFile).equals(first)).toBe(true)
    })

    test('ids are stable, unique and independent of other submissions', () => {
        writeFixtures(FIXTURES)
        const ids = buildPersons(loadSubmissions(sourceDir)).map((p) => p.id)
        expect(new Set(ids).size).toBe(ids.length)

        fs.rmSync(path.join(sourceDir, 'alpha.json'))
        writeFixtures({ 'zulu.json': submission('Zulu', 'Canada') })
        const after = buildPersons(loadSubmissions(sourceDir))
        expect(after.find((p) => p.name === 'Bravo')!.id).toBe(ids[1]!)
        ids.forEach((id) => expect(id).toMatch(/^[0-9a-f]{32}$/))
    })

    test('unknown countries do not fail aggregation', () => {
        writeFixtures({ 'x.json': submission('X', 'Atlantis') })
        expect(() => aggregate({ sourceDir, outputFile })).not.toThrow()
    })

    test('invalid JSON fails with the filename and leaves existing output intact', () => {
        writeFixtures({ ...FIXTURES, 'broken.json': '{ "name": "Broken", ' })
        fs.writeFileSync(outputFile, '["previous valid output"]')

        expect(() => aggregate({ sourceDir, outputFile })).toThrow(
            SubmissionLoadError
        )
        try {
            aggregate({ sourceDir, outputFile })
        } catch (e) {
            expect(e).toBeInstanceOf(SubmissionLoadError)
            const error = e as SubmissionLoadError
            expect(error.failures.map((f) => f.file)).toEqual(['broken.json'])
            expect(error.message).toContain('broken.json')
        }
        expect(fs.readFileSync(outputFile, 'utf-8')).toBe(
            '["previous valid output"]'
        )
        expect(fs.readdirSync(tmp).sort()).toEqual([
            'Submissions',
            'persons.json',
        ])
    })

    test('non-object JSON is rejected', () => {
        writeFixtures({ 'array.json': '[]', 'null.json': 'null' })
        expect(() => loadSubmissions(sourceDir)).toThrow(
            /array\.json[\s\S]*null\.json/
        )
    })

    test('a missing source directory fails', () => {
        expect(() =>
            aggregate({ sourceDir: path.join(tmp, 'missing'), outputFile })
        ).toThrow()
        expect(fs.existsSync(outputFile)).toBe(false)
    })
})

describe('aggregate-json CLI', () => {
    const runCli = () =>
        spawnSync(process.execPath, [AGGREGATE_CLI], {
            cwd: tmp,
            encoding: 'utf-8',
        })

    beforeEach(() => {
        fs.mkdirSync(path.join(tmp, 'src', 'assets'), { recursive: true })
    })

    test('prints nothing on success', () => {
        // Warning-free fixtures: values with `unknown` issues now make the CLI
        // print the unrecognised-country warning (covered in
        // countryWarning.test.ts), so silence is asserted on resolved,
        // ambiguous, non-location and empty values only.
        writeFixtures({
            'alpha.json': submission('Alpha', 'USA (Willing to relocate!)'),
            'delta.json': submission('Delta', 'Georgia'),
            'foxtrot.json': submission('Foxtrot', ''),
        })
        const result = runCli()
        expect(result.status).toBe(0)
        expect(result.stdout).toBe('')
        expect(result.stderr).toBe('')
    })

    test('exits non-zero and keeps the previous output on failure', () => {
        const output = path.join(tmp, 'src', 'assets', 'persons.json')
        fs.writeFileSync(output, '["previous"]')
        writeFixtures({ ...FIXTURES, 'broken.json': 'not json' })

        const result = runCli()
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('broken.json')
        expect(fs.readFileSync(output, 'utf-8')).toBe('["previous"]')
    })
})

describe('buildCountryDiagnostics', () => {
    test('reports unresolved values with their submissions', () => {
        writeFixtures({
            ...FIXTURES,
            'juliet.json': submission('Juliet', 'Georgia'),
        })
        const report = buildCountryDiagnostics(loadSubmissions(sourceDir))

        expect(report.summary).toEqual({
            submissions: 10,
            distinctRawCountryValues: 7,
            distinctCanonicalCountries: 5,
            byStatus: {
                resolved: 4,
                partial: 1,
                ambiguous: 2,
                unresolved: 1,
                empty: 2,
            },
        })
        expect(
            report.entries.map(({ original, status, submissions }) => ({
                original,
                status,
                submissions,
            }))
        ).toEqual([
            {
                original: 'Nigeria/Istanbul/North-Macedonia',
                status: 'partial',
                submissions: ['hotel.json'],
            },
            {
                original: 'Georgia',
                status: 'ambiguous',
                submissions: ['delta.json', 'juliet.json'],
            },
            {
                original: 'Azad Kashmir Pakistan',
                status: 'unresolved',
                submissions: ['echo.json'],
            },
        ])
        // No personal data beyond filenames
        expect(JSON.stringify(report)).not.toContain('Juliet')
    })
})

describe('real submissions', () => {
    test('every submission is aggregated and the source is unchanged', () => {
        const realDir = path.join(REPO_ROOT, 'Submissions')
        const before = hashDir(realDir)
        const fileCount = fs
            .readdirSync(realDir, { withFileTypes: true })
            .filter((e) => e.isFile() && !e.name.startsWith('.')).length

        aggregate({ sourceDir: realDir, outputFile })
        const first = fs.readFileSync(outputFile)
        aggregate({ sourceDir: realDir, outputFile })

        expect(JSON.parse(first.toString())).toHaveLength(fileCount)
        expect(fs.readFileSync(outputFile).equals(first)).toBe(true)
        expect(hashDir(realDir)).toBe(before)
    })
})
