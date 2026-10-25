// @vitest-environment node
import { afterEach, describe, expect, test } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { normalizeSkills, validateSkills } from './skills'
import {
    emptyCriteria,
    filterProfiles,
    getJobTitleOptions,
    jobTitleKey,
} from './filterProfiles'
import { resolveCountry } from './countries/resolveCountry.js'

describe('skills', () => {
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

const profile = (id, name, skills, country, jobTitle) => ({
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
    test.each([
        ['Dot Net Devoloper', 'Dot Net Developer'],
        ['Fronted Web Developer', 'Frontend Web Developer'],
        ['FullStak/Software Developer', 'Full Stack/Software Developer'],
        ['Senior FrontEnd Developper', 'Senior Frontend Developer'],
        ['Web developper', 'Web Developer'],
    ])('groups the submitted typo %s with %s', (original, corrected) => {
        const profiles = [original, corrected].map((title, index) =>
            profile(String(index), 'Developer', [], 'Canada', title)
        )
        expect(getJobTitleOptions(profiles)).toEqual([corrected])
        expect(
            filterProfiles(profiles, {
                ...emptyCriteria,
                jobTitles: [corrected],
            })
        ).toEqual(profiles)
        expect(jobTitleKey(original)).toBe(jobTitleKey(corrected))
        expect(profiles[0].jobTitle).toBe(original)
    })

    test('keeps seniority, specializations, designers and compound titles distinct', () => {
        const titles = [
            'Frontend Developer',
            'Full Stack Developer',
            'Senior Frontend Developer',
            'Junior Frontend Developer',
            'Frontend Designer',
            'Frontend Developer / Backend Developer',
        ]
        const profiles = titles.map((title, index) =>
            profile(String(index), 'Developer', [], 'Canada', title)
        )
        expect(getJobTitleOptions(profiles)).toHaveLength(titles.length)
        expect(
            filterProfiles(profiles, {
                ...emptyCriteria,
                jobTitles: ['front-end developer'],
            })
        ).toEqual([profiles[0]])
    })

    test('groups role spelling variants without merging distinct titles or changing profiles', () => {
        const titles = [
            'Backend Developer',
            ' back-end  developer ',
            'BACK END DEVELOPER',
            'Fullstack Developer',
            'Full-Stack Developer',
            'full stack developer',
            'Senior Backend Developer',
            'Backend Developer / Frontend Developer',
            'Software Engineer',
            '',
            '   ',
            undefined,
        ]
        const profiles = titles.map((title, index) =>
            profile(String(index), 'Developer', [], 'Canada', title)
        )
        expect(getJobTitleOptions(profiles)).toEqual([
            'Backend Developer',
            'Backend Developer / Frontend Developer',
            'Full Stack Developer',
            'Senior Backend Developer',
            'Software Engineer',
        ])
        expect(
            filterProfiles(profiles, {
                ...emptyCriteria,
                jobTitles: ['BACKEND DEVELOPER', 'Full Stack Developer'],
            }).map((person) => person.id)
        ).toEqual(['0', '1', '2', '3', '4', '5'])
        expect(profiles.map((person) => person.jobTitle)).toEqual(titles)
    })

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
    let directory
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
                [path.resolve('scripts', 'aggregate-json.mjs')],
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
            [path.resolve('scripts', 'aggregate-json.mjs')],
            { cwd: directory, encoding: 'utf8' }
        )
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('broken.json')
        expect(result.stderr).toContain('Invalid JSON')
        expect(fs.readFileSync(output, 'utf8')).toBe('existing dataset')
    })
})
