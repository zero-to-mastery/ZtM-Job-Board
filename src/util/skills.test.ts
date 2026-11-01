// @vitest-environment node
import { afterEach, describe, expect, test } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { normalizeSkills, skillKey, validateSkills } from './skills'
import { emptyCriteria, filterProfiles } from './filterProfiles'
import { resolveCountry } from './countries/resolveCountry.ts'
import type Person from '../interfaces/person'

describe('skills', () => {
    test.each([
        [' React ', 'react'],
        ['REACT', 'react'],
        [' TypeScript\t', 'typescript'],
        [' Node.js ', 'node.js'],
        ['React.js', 'react.js'],
        ['C', 'c'],
        ['C++', 'c++'],
        ['C#', 'c#'],
    ])('compares %j using the key %j', (skill, expected) => {
        expect(skillKey(skill)).toBe(expected)
    })

    test('trims and deduplicates labels without conflating different technologies', () => {
        expect(
            normalizeSkills([
                ' React ',
                'react',
                'TypeScript',
                'C',
                'C++',
                'C#',
            ])
        ).toEqual(['React', 'TypeScript', 'C', 'C++', 'C#'])
        expect(normalizeSkills()).toEqual([])
    })

    test('accepts existing submissions and empty skill lists', () => {
        expect(() => validateSkills(undefined, 'legacy.json')).not.toThrow()
        expect(() => validateSkills([], 'empty.json')).not.toThrow()
        expect(() =>
            validateSkills([' React ', 'react', 'TypeScript'], 'valid.json')
        ).not.toThrow()
    })

    test.each([null, 'React', {}, [1], [''], ['  '], ['React', null]])(
        'rejects invalid skills %j with an actionable filename',
        (skills) => {
            expect(() => validateSkills(skills, 'developer.json')).toThrow(
                'developer.json: "skills" must be an array of nonblank strings'
            )
        }
    )
})

const profile = (
    id: string,
    name: string,
    skills: string[] | undefined,
    country: string,
    jobTitle: string
): Person => ({
    id,
    name,
    skills,
    location: { country },
    normalized: { countries: resolveCountry(country).countries },
    links: {},
    jobTitle,
})
const people = [
    profile(
        '1',
        'Zoe',
        [' React ', 'TypeScript'],
        'Canada',
        'Frontend Developer'
    ),
    profile('2', 'Ada', ['react'], 'Canada', 'Frontend Developer'),
    profile(
        '3',
        'Ben',
        ['React', 'typescript'],
        'United States',
        'Backend Developer'
    ),
    profile('4', 'Lee', undefined, 'Canada', 'Frontend Developer'),
    profile('5', 'Sam', [], 'Canada', 'Frontend Developer'),
]

describe('profile matching', () => {
    test('includes profiles without skills when no skills are required', () => {
        expect(filterProfiles(people, emptyCriteria)).toEqual(people)
    })

    test('requires all skills and ignores case and surrounding whitespace', () => {
        const matches = filterProfiles(people, {
            ...emptyCriteria,
            skills: [' REACT ', 'TypeScript'],
        })
        expect(matches.map((person) => person.id)).toEqual(['1', '3'])
        expect(
            filterProfiles(people, { ...emptyCriteria, skills: ['Rust'] })
        ).toEqual([])
    })

    test('combines skills with text, country and role filters', () => {
        expect(
            filterProfiles(people, {
                ...emptyCriteria,
                search: 'Zoe',
                countries: ['CA'],
                jobTitles: ['Frontend Developer'],
                skills: ['React', 'TypeScript'],
            }).map((person) => person.id)
        ).toEqual(['1'])
        expect(
            filterProfiles(people, {
                ...emptyCriteria,
                countries: ['US'],
                jobTitles: ['Frontend Developer'],
                skills: ['React'],
            })
        ).toEqual([])
    })

    test('keeps default ordering stable and sorts without mutating input', () => {
        const original = [...people]
        expect(filterProfiles(people, emptyCriteria)).toEqual(original)
        expect(
            filterProfiles(people, { ...emptyCriteria, sort: 'name-asc' }).map(
                (person) => person.name
            )
        ).toEqual(['Ada', 'Ben', 'Lee', 'Sam', 'Zoe'])
        expect(
            filterProfiles(people, { ...emptyCriteria, sort: 'name-desc' }).map(
                (person) => person.name
            )
        ).toEqual(['Zoe', 'Sam', 'Lee', 'Ben', 'Ada'])
        expect(people).toEqual(original)
    })
})

describe('aggregation validation', () => {
    let directory: string | undefined
    afterEach(() => {
        if (directory) {
            fs.rmSync(directory, { recursive: true, force: true })
        }
    })

    test.each([['React', 42], null])(
        'fails before replacing the generated dataset for invalid skills %j',
        (skills) => {
            directory = fs.mkdtempSync(
                path.join(os.tmpdir(), 'jobboard-skills-')
            )
            fs.mkdirSync(path.join(directory, 'Submissions'))
            fs.mkdirSync(path.join(directory, 'src', 'assets'), {
                recursive: true,
            })
            const output = path.join(directory, 'src', 'assets', 'persons.json')
            fs.writeFileSync(output, 'existing dataset')
            fs.writeFileSync(
                path.join(directory, 'Submissions', 'developer.json'),
                JSON.stringify({ skills })
            )
            const result = spawnSync(
                process.execPath,
                [path.resolve('scripts', 'aggregate-json.ts')],
                { cwd: directory, encoding: 'utf8' }
            )
            expect(result.status).toBe(1)
            expect(result.stderr).toContain('developer.json')
            expect(result.stderr).toContain('array of nonblank strings')
            expect(fs.readFileSync(output, 'utf8')).toBe('existing dataset')
        }
    )

    test('fails before replacing the generated dataset for malformed JSON', () => {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jobboard-skills-'))
        fs.mkdirSync(path.join(directory, 'Submissions'))
        fs.mkdirSync(path.join(directory, 'src', 'assets'), { recursive: true })
        const output = path.join(directory, 'src', 'assets', 'persons.json')
        fs.writeFileSync(output, 'existing dataset')
        fs.writeFileSync(
            path.join(directory, 'Submissions', 'broken.json'),
            '{ "name": "Ada", }'
        )
        const result = spawnSync(
            process.execPath,
            [path.resolve('scripts', 'aggregate-json.ts')],
            { cwd: directory, encoding: 'utf8' }
        )
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('broken.json')
        expect(result.stderr).toContain('Invalid JSON')
        expect(fs.readFileSync(output, 'utf8')).toBe('existing dataset')
    })
})
