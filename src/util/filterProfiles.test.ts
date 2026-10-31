// @vitest-environment node
import { describe, expect, test } from 'vitest'
import {
    emptyCriteria,
    filterProfiles,
    getJobTitleOptions,
    jobTitleKey,
} from './filterProfiles'
import { resolveCountry } from './countries/resolveCountry.ts'
import type Person from '../interfaces/person'

const profile = (
    id: string,
    name: string,
    skills: string[] | undefined,
    country: string,
    jobTitle: string | undefined
): Person => ({
    id,
    name,
    skills,
    location: { country },
    normalized: { countries: resolveCountry(country).countries },
    links: {},
    jobTitle,
})

describe('role families', () => {
    test.each<[string, string, string[]]>([
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

    test.each<[string, string[]]>([
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

    test.each<[string, string[]]>([
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
})

describe('text search', () => {
    const searchable: Person[] = [
        {
            id: '1',
            name: 'Ada Lovelace',
            jobTitle: 'Frontend Developer',
            location: {
                city: 'London',
                state: 'Greater London',
                country: 'United Kingdom',
            },
            links: {},
        },
        {
            id: '2',
            name: 'Grace Hopper',
            jobTitle: 'Project Manager',
            email: 'grace@example.org',
            skills: ['Rust'],
            location: {
                city: 'Arlington',
                state: 'Virginia',
                country: 'United States',
            },
            links: { github: 'gracehopper' },
        },
        {
            id: '3',
            name: 'Linus C++',
            location: { country: 'Finland' },
            links: {},
        },
        {
            id: '4',
            name: 'Dot Net Dev',
            jobTitle: 'Engineer.',
            location: { city: 'Paris' },
            links: {},
        },
    ]
    const search = (text: string) =>
        filterProfiles(searchable, { ...emptyCriteria, search: text }).map(
            (person) => person.id
        )

    test.each<[string, string[]]>([
        ['hopper', ['2']],
        ['frontend', ['1']],
        ['arlington', ['2']],
        ['virginia', ['2']],
        ['finland', ['3']],
    ])('matches %j in a searched field', (text, ids) => {
        expect(search(text)).toEqual(ids)
    })

    test('ignores case', () => {
        expect(search('ADA LoVeLaCe')).toEqual(['1'])
        expect(search('FINLAND')).toEqual(['3'])
    })

    test('requires every term to match, across different fields', () => {
        expect(search('ada london')).toEqual(['1'])
        expect(search('frontend united')).toEqual(['1'])
        expect(search('grace virginia')).toEqual(['2'])
        expect(search('ada arlington')).toEqual([])
        expect(search('ada grace')).toEqual([])
    })

    test('splits terms on any whitespace and ignores surrounding whitespace', () => {
        expect(search('  ada \t  lovelace  ')).toEqual(['1'])
        expect(search('ada\tlondon')).toEqual(['1'])
    })

    test('returns everyone for an empty or whitespace-only search', () => {
        expect(search('')).toEqual(['1', '2', '3', '4'])
        expect(search('   ')).toEqual(['1', '2', '3', '4'])
    })

    test('treats punctuation and regular expression syntax as plain text', () => {
        expect(search('c++')).toEqual(['3'])
        expect(search('.')).toEqual(['4'])
        expect(search('^ada')).toEqual([])
        expect(search('(')).toEqual([])
    })

    test('does not search skills, email or links', () => {
        expect(search('rust')).toEqual([])
        expect(search('example')).toEqual([])
        expect(search('gracehopper')).toEqual([])
    })

    test('tolerates missing job titles and location fields', () => {
        expect(search('linus')).toEqual(['3'])
        expect(search('linus finland')).toEqual(['3'])
        expect(search('paris')).toEqual(['4'])
    })
})
