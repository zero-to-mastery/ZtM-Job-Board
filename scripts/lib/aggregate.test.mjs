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
    buildRoleDiagnostics,
    loadSubmissions,
    profileId,
    SubmissionLoadError,
} from './aggregate.mjs'

const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..'
)
const AGGREGATE_CLI = path.join(REPO_ROOT, 'scripts', 'aggregate-json.mjs')

const submission = (name, country) => ({
    name,
    img: '',
    email: '',
    links: { website: '', linkedin: '', github: '' },
    jobTitle: 'Web Developer',
    location: { city: 'City', state: '', country },
})

// Country values taken from real submissions
const FIXTURES = {
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

// Job titles taken from real submissions
const ROLE_FIXTURES = {
    'romeo.json': {
        ...submission('Romeo', 'USA'),
        jobTitle: 'Senior Front-End React Developer',
    },
    'sierra.json': {
        ...submission('Sierra', 'Canada'),
        jobTitle: 'Frontend Developer | Full Stack Developer',
    },
    'tango.json': { ...submission('Tango', 'India'), jobTitle: 'Student' },
    'uniform.json': {
        ...submission('Uniform', 'India'),
        jobTitle: 'Frontend Developer/Project Manager',
    },
    'victor.json': {
        ...submission('Victor', 'India'),
        jobTitle: 'Tech Lead and Senior Software Engineer',
    },
    'whiskey.json': { ...submission('Whiskey', 'India'), jobTitle: 'Student' },
}

let tmp
let sourceDir
let outputFile

const writeFixtures = (fixtures) => {
    for (const [file, data] of Object.entries(fixtures)) {
        fs.writeFileSync(
            path.join(sourceDir, file),
            typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        )
    }
}

const hashDir = (dir) =>
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
    test('keeps every submission and its original fields', () => {
        writeFixtures(FIXTURES)
        const { count } = aggregate({ sourceDir, outputFile })
        const persons = JSON.parse(fs.readFileSync(outputFile, 'utf-8'))

        expect(count).toBe(Object.keys(FIXTURES).length)
        expect(persons).toHaveLength(Object.keys(FIXTURES).length)

        const files = Object.keys(FIXTURES).sort()
        persons.forEach((person, i) => {
            const { id, normalized, ...original } = person
            expect(original).toEqual(FIXTURES[files[i]])
            expect(id).toBe(profileId(files[i]))
        })
    })

    test('adds normalized country codes', () => {
        writeFixtures(FIXTURES)
        aggregate({ sourceDir, outputFile })
        const persons = JSON.parse(fs.readFileSync(outputFile, 'utf-8'))
        const byName = Object.fromEntries(
            persons.map((p) => [p.name, p.normalized.countries])
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

    test('adds normalized roles, seniority and technologies', () => {
        writeFixtures({ ...FIXTURES, ...ROLE_FIXTURES })
        aggregate({ sourceDir, outputFile })
        const persons = JSON.parse(fs.readFileSync(outputFile, 'utf-8'))
        const byName = Object.fromEntries(
            persons.map((p) => [p.name, p.normalized])
        )

        expect(byName.Romeo).toEqual({
            countries: ['US'],
            roles: ['frontend-developer'],
            seniority: 'senior',
            technologies: ['react'],
        })
        expect(byName.Sierra).toEqual({
            countries: ['CA'],
            roles: ['frontend-developer', 'full-stack-developer'],
            seniority: null,
            technologies: [],
        })
        expect(byName.Tango).toEqual({
            countries: ['IN'],
            roles: [],
            seniority: null,
            technologies: [],
        })
        expect(byName.Golf.roles).toEqual([])
        expect(byName.Alpha.roles).toEqual(['web-developer'])
        // Country normalization is unchanged by role normalization
        expect(byName.Charlie.countries).toEqual(['US', 'BE'])
        // Original titles are kept for display
        expect(persons.find((p) => p.name === 'Romeo').jobTitle).toBe(
            'Senior Front-End React Developer'
        )
        // Key order of the generated metadata is fixed
        expect(Object.keys(byName.Romeo)).toEqual([
            'countries',
            'roles',
            'seniority',
            'technologies',
        ])
    })

    test('does not modify source submissions', () => {
        writeFixtures(FIXTURES)
        const before = hashDir(sourceDir)
        aggregate({ sourceDir, outputFile })
        expect(hashDir(sourceDir)).toBe(before)
    })

    test('role metadata excludes shared aspirations and employer context', () => {
        const fixtures = {
            'alpha.json': {
                ...submission('Alpha', 'USA'),
                jobTitle: 'Aspiring Frontend/Backend Developer',
            },
            'bravo.json': {
                ...submission('Bravo', 'Canada'),
                jobTitle:
                    'Junior Software Engineer at Staff React / ML Engineer',
            },
            'charlie.json': {
                ...submission('Charlie', 'USA/Belgium'),
                jobTitle:
                    'Aspiring Frontend/Backend Developer | Software Engineer',
            },
        }
        writeFixtures(fixtures)
        const before = hashDir(sourceDir)
        aggregate({ sourceDir, outputFile })
        const first = fs.readFileSync(outputFile, 'utf-8')
        const persons = JSON.parse(first)

        expect(persons.map((person) => person.normalized)).toEqual([
            { countries: ['US'], roles: [], seniority: null, technologies: [] },
            {
                countries: ['CA'],
                roles: ['software-engineer'],
                seniority: 'junior',
                technologies: [],
            },
            {
                countries: ['US', 'BE'],
                roles: ['software-engineer'],
                seniority: null,
                technologies: [],
            },
        ])
        const files = Object.keys(fixtures).sort()
        persons.forEach((person, i) => {
            const { id, normalized, ...original } = person
            expect(original).toEqual(fixtures[files[i]])
        })
        expect(hashDir(sourceDir)).toBe(before)
        aggregate({ sourceDir, outputFile })
        expect(fs.readFileSync(outputFile, 'utf-8')).toBe(first)
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
        expect(after.find((p) => p.name === 'Bravo').id).toBe(ids[1])
        ids.forEach((id) => expect(id).toMatch(/^[0-9a-f]{32}$/))
    })

    test('unknown countries do not fail aggregation', () => {
        writeFixtures({ 'x.json': submission('X', 'Atlantis') })
        expect(() => aggregate({ sourceDir, outputFile })).not.toThrow()
    })

    test('unknown or invalid job titles do not fail aggregation', () => {
        writeFixtures({
            'x.json': { ...submission('X', 'Canada'), jobTitle: 'Wizard' },
            'y.json': { ...submission('Y', 'Canada'), jobTitle: 42 },
            'z.json': { ...submission('Z', 'Canada'), jobTitle: null },
        })
        expect(aggregate({ sourceDir, outputFile }).count).toBe(3)
        const persons = JSON.parse(fs.readFileSync(outputFile, 'utf-8'))
        expect(persons.map((p) => p.jobTitle)).toEqual(['Wizard', 42, null])
        persons.forEach((p) => expect(p.normalized.roles).toEqual([]))
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
            expect(e.failures.map((f) => f.file)).toEqual(['broken.json'])
            expect(e.message).toContain('broken.json')
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
        writeFixtures(FIXTURES)
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

describe('buildRoleDiagnostics', () => {
    test('summarises roles and reports unresolved titles with their submissions', () => {
        writeFixtures({ ...FIXTURES, ...ROLE_FIXTURES })
        const report = buildRoleDiagnostics(loadSubmissions(sourceDir))

        expect(report.summary).toMatchObject({
            submissions: 15,
            distinctRawTitles: 7,
            distinctCanonicalRoles: 4,
            classifiedProfiles: 12,
            unclassifiedProfiles: 3,
            multiRoleProfiles: 1,
            byStatus: { classified: 10, partial: 2, unclassified: 3, empty: 0 },
        })
        expect(report.summary.roles).toMatchObject({
            'frontend-developer': 3,
            'full-stack-developer': 1,
            'web-developer': 8,
            'software-engineer': 1,
            'data-scientist': 0,
        })
        expect(report.summary.seniority).toMatchObject({
            senior: 1,
            conflicting: 1,
            unspecified: 13,
        })
        expect(
            report.entries.map(({ original, status, reason, submissions }) => ({
                original,
                status,
                reason,
                submissions,
            }))
        ).toEqual([
            {
                original: 'Developer',
                status: 'unclassified',
                reason: 'Generic title without a specialization',
                submissions: ['golf.json'],
            },
            {
                original: 'Student',
                status: 'unclassified',
                reason: 'Student or academic status, not a professional role',
                submissions: ['tango.json', 'whiskey.json'],
            },
            {
                original: 'Frontend Developer/Project Manager',
                status: 'partial',
                reason: null,
                submissions: ['uniform.json'],
            },
            {
                original: 'Tech Lead and Senior Software Engineer',
                status: 'partial',
                reason: null,
                submissions: ['victor.json'],
            },
        ])
        expect(report.entries[2].unmatched).toEqual(['Project Manager'])
        expect(report.entries[3].seniorityStatus).toBe('conflicting')
        // No personal data beyond filenames
        expect(JSON.stringify(report)).not.toContain('Whiskey')
    })

    test('missing titles are listed as empty', () => {
        writeFixtures({
            'a.json': { name: 'A' },
            'b.json': { name: 'B', jobTitle: '  ' },
        })
        const report = buildRoleDiagnostics(loadSubmissions(sourceDir))
        expect(report.summary.byStatus.empty).toBe(2)
        expect(report.entries.map((e) => [e.original, e.submissions])).toEqual([
            ['  ', ['b.json']],
            [null, ['a.json']],
        ])
    })

    test('is deterministic', () => {
        writeFixtures({ ...FIXTURES, ...ROLE_FIXTURES })
        const first = JSON.stringify(
            buildRoleDiagnostics(loadSubmissions(sourceDir))
        )
        expect(
            JSON.stringify(buildRoleDiagnostics(loadSubmissions(sourceDir)))
        ).toBe(first)
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

        const persons = JSON.parse(first.toString())
        expect(persons).toHaveLength(fileCount)
        persons.forEach((p) => {
            expect(Array.isArray(p.normalized.countries)).toBe(true)
            expect(Array.isArray(p.normalized.roles)).toBe(true)
            expect(Array.isArray(p.normalized.technologies)).toBe(true)
        })
        expect(fs.readFileSync(outputFile).equals(first)).toBe(true)
        expect(hashDir(realDir)).toBe(before)
    })
})
