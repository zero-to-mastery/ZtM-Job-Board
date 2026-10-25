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
        ['Dot Net Devoloper', 'Dot Net Developer', ['Other roles']],
        [
            'Fronted Web Developer',
            'Frontend Web Developer',
            ['Frontend Developer', 'Web Developer'],
        ],
        [
            'FullStak/Software Developer',
            'Full Stack/Software Developer',
            ['Full Stack Developer', 'Software Developer'],
        ],
        [
            'Senior FrontEnd Developper',
            'Senior Frontend Developer',
            ['Frontend Developer'],
        ],
        ['Web developper', 'Web Developer', ['Web Developer']],
    ])(
        'groups the submitted typo %s with %s',
        (original, corrected, families) => {
            const profiles = [original, corrected].map((title, index) =>
                profile(String(index), 'Developer', [], 'Canada', title)
            )
            expect(getJobTitleOptions(profiles)).toEqual(families)
            expect(getJobTitleOptions([profiles[0]])).toEqual(
                getJobTitleOptions([profiles[1]])
            )
            expect(
                filterProfiles(profiles, {
                    ...emptyCriteria,
                    jobTitles: families,
                })
            ).toEqual(profiles)
            expect(jobTitleKey(original)).toBe(jobTitleKey(corrected))
            expect(profiles[0].jobTitle).toBe(original)
        }
    )

    test('groups seniority and matches compound titles to each explicit family', () => {
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
        expect(getJobTitleOptions(profiles)).toHaveLength(4)
        expect(
            filterProfiles(profiles, {
                ...emptyCriteria,
                jobTitles: ['front-end developer'],
            })
        ).toEqual([profiles[0], profiles[2], profiles[3], profiles[5]])
    })

    test.each([
        ['Frontend Engineer', ['Frontend Developer']],
        ['Senior Frontend React Developer', ['Frontend Developer']],
        ['Junior Backend Python Engineer', ['Backend Developer']],
        [
            'Lead Full-Stack Web Developer',
            ['Full Stack Developer', 'Web Developer'],
        ],
        [
            'Full Stack Software Engineer',
            ['Full Stack Developer', 'Software Developer'],
        ],
    ])(
        'groups %s under its matching families without changing the title',
        (title, families) => {
            const profiles = [profile('1', 'Developer', [], 'Canada', title)]
            expect(getJobTitleOptions(profiles)).toEqual(families)
            expect(
                filterProfiles(profiles, {
                    ...emptyCriteria,
                    jobTitles: families,
                })
            ).toEqual(profiles)
            expect(profiles[0].jobTitle).toBe(title)
        }
    )

    test('keeps unmatched profiles in Other roles and their original titles searchable', () => {
        const titles = [
            'Aspiring Frontend Developer',
            'Frontend Project Manager',
            '',
            undefined,
        ]
        const profiles = titles.map((title, index) =>
            profile(String(index), 'Developer', [], 'Canada', title)
        )
        expect(getJobTitleOptions(profiles)).toEqual(['Other roles'])
        expect(
            filterProfiles(profiles, {
                ...emptyCriteria,
                jobTitles: ['Other roles'],
            })
        ).toEqual(profiles)
        expect(
            filterProfiles(profiles, {
                ...emptyCriteria,
                search: 'Project Manager',
            })
        ).toEqual([profiles[1]])
    })

    test.each([
        ['Software Engineer', ['Software Developer']],
        ['Software Developer', ['Software Developer']],
        ['Full Stack Web Developer', ['Full Stack Developer', 'Web Developer']],
        [
            'Frontend Developer / Backend Developer',
            ['Backend Developer', 'Frontend Developer'],
        ],
        [
            'Frontend/Backend Developer',
            ['Backend Developer', 'Frontend Developer'],
        ],
        [
            'Front-end / Full-stack Web Developer',
            ['Frontend Developer', 'Full Stack Developer', 'Web Developer'],
        ],
        [
            'FullStak/Software Developer',
            ['Full Stack Developer', 'Software Developer'],
        ],
        [
            'Sofeware/Full Stack/Web Developer',
            ['Full Stack Developer', 'Software Developer', 'Web Developer'],
        ],
        [
            'Full Stack Mobile/Web Developer',
            ['Full Stack Developer', 'Mobile Developer', 'Web Developer'],
        ],
        [
            'Software Engineer, Full-stack/Frontend',
            [
                'Frontend Developer',
                'Full Stack Developer',
                'Software Developer',
            ],
        ],
        [
            'Software Engineer and Product Designer',
            ['Designer', 'Software Developer'],
        ],
        [
            'Software Engineer and Product Designer and Frontend',
            ['Designer', 'Software Developer'],
        ],
        ['DevOps & Cybersecurity', ['DevOps Engineer', 'Security']],
        ['Software Engineer | Aspiring Data Scientist', ['Software Developer']],
        ['Senior Android Developer', ['Mobile Developer']],
        ['Game Developer', ['Game Developer']],
        ['Data Scientist', ['Data Scientist']],
        ['Data Analyst', ['Data Analyst']],
        ['Data Engineer', ['Data Engineer']],
        ['Machine Learning Engineer', ['Machine Learning Engineer']],
        ['DevOps Engineer', ['DevOps Engineer']],
        ['Cloud Engineer', ['Cloud Engineer']],
        ['Blockchain Developer', ['Blockchain / Web3 Developer']],
        ['Web3 Engineer', ['Blockchain / Web3 Developer']],
        ['Smart Contract Developer', ['Blockchain / Web3 Developer']],
        ['Cloud Architect', ['Solutions Architect']],
        ['Solutions Architect', ['Solutions Architect']],
        ['Engineering Manager', ['Engineering Manager']],
        ['Product Manager', ['Product Manager']],
        ['Technical Writer', ['Technical Writer']],
        ['Aspiring Product Manager', ['Other roles']],
        ['Project Manager', ['Other roles']],
        [
            'DevOps Engineer | Cloud Engineer',
            ['Cloud Engineer', 'DevOps Engineer'],
        ],
        ['QA Engineer', ['QA / Test Engineer']],
        ['Security Analyst', ['Security']],
        ['Web Developer', ['Web Developer']],
        ['UI/UX Designer', ['Designer']],
        ['Frontend Designer', ['Other roles']],
        ['Student', ['Other roles']],
        ['Developer at Frontend Company', ['Other roles']],
    ])('maps %s to explicit filter families', (title, expected) => {
        const profiles = [profile('1', 'Developer', [], 'Canada', title)]
        expect(getJobTitleOptions(profiles)).toEqual(expected)
        for (const role of expected) {
            expect(
                filterProfiles(profiles, {
                    ...emptyCriteria,
                    jobTitles: [role],
                })
            ).toEqual(profiles)
        }
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
            'Frontend Developer',
            'Full Stack Developer',
            'Software Developer',
            'Other roles',
        ])
        expect(
            filterProfiles(profiles, {
                ...emptyCriteria,
                jobTitles: ['BACKEND DEVELOPER', 'Full Stack Developer'],
            }).map((person) => person.id)
        ).toEqual(['0', '1', '2', '3', '4', '5', '6', '7'])
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
