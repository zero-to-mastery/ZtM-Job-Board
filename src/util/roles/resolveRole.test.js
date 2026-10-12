import fs from 'fs'
import path from 'path'
import { describe, expect, test } from 'vitest'
import { resolveRole, normalizeRoleKey } from './resolveRole.js'
import {
    ROLE_TAXONOMY,
    ROLE_IDS,
    SENIORITY_LEVELS,
    getRoleLabel,
} from './roleTaxonomy.js'
import { TECHNOLOGY_ALIASES } from './roleAliases.js'

const rolesOf = (title) => resolveRole(title).roles

describe('taxonomy', () => {
    test('ids are unique kebab-case and labels are unique', () => {
        expect(new Set(ROLE_IDS).size).toBe(ROLE_IDS.length)
        ROLE_IDS.forEach((id) => expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/))
        const labels = ROLE_TAXONOMY.map((r) => r.label)
        expect(new Set(labels).size).toBe(labels.length)
    })

    test('getRoleLabel', () => {
        expect(getRoleLabel('frontend-developer')).toBe('Frontend Developer')
        expect(getRoleLabel('ml-engineer')).toBe(
            'AI / Machine Learning Engineer'
        )
        expect(getRoleLabel('nope')).toBe('nope')
    })

    test('technology ids are lowercase identifiers', () => {
        Object.values(TECHNOLOGY_ALIASES)
            .flat()
            .forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/))
    })
})

describe('normalizeRoleKey', () => {
    test.each([
        ['  Front   End  Developer ', 'frontend developer'],
        ['Front-End Developer', 'frontend developer'],
        ['FrontEnd Developer', 'frontend developer'],
        ['FRONTEND DEVELOPER', 'frontend developer'],
        ['Back-End Dev', 'backend dev'],
        ['Full-Stack Web-Developer', 'fullstack web developer'],
        ['MERN Stack Developer', 'mern developer'],
        ['Sr. Software Engineer', 'sr software engineer'],
        ['Fronted Web Developer', 'frontend web developer'],
        ['Font-end Developer', 'frontend developer'],
        ['Front-endWed Developer', 'frontend web developer'],
        [
            'Sofeware/Full Stack/Web Developer',
            'software fullstack web developer',
        ],
        ['Dot Net Devoloper', 'dotnet developer'],
        ['.NET engineer', 'dotnet engineer'],
        ['C# / C++ Developer', 'csharp cpp developer'],
        ['Node.js Backend Developer', 'nodejs backend developer'],
        ['React Native Developer', 'reactnative developer'],
        ['Cool Web Developer &#128522', 'cool web developer'],
        ['Front end Web Developer U+1F4BB', 'frontend web developer'],
        ['Full Stack Developer 🚀', 'fullstack developer'],
        ['Désigner', 'designer'],
    ])('%j -> %j', (input, expected) => {
        expect(normalizeRoleKey(input)).toBe(expected)
    })

    test('returns an empty key for non-strings', () => {
        expect(normalizeRoleKey(undefined)).toBe('')
        expect(normalizeRoleKey(null)).toBe('')
        expect(normalizeRoleKey(42)).toBe('')
    })
})

describe('required equivalences', () => {
    test.each([
        'Front End Developer',
        'Front-End Developer',
        'FrontEnd Developer',
        'Frontend Developer',
        'Front-end developer',
        'FRONTEND DEVELOPER',
        'Front End Web Developer',
        'Front-End Engineer',
        'Frontend Engineer',
        'Fronted Web Developer',
        'Font-end Developer',
    ])('%j is frontend', (title) => {
        expect(rolesOf(title)).toEqual(['frontend-developer'])
    })

    test.each([
        'Backend Developer',
        'Back End Developer',
        'Back-End Developer',
        'BackEnd Developer',
        'Backend Engineer',
        'Back-end Software Engineer',
        'Node.js Backend Developer',
    ])('%j is backend', (title) => {
        expect(rolesOf(title)).toEqual(['backend-developer'])
    })

    test.each([
        'Full Stack Developer',
        'Full-Stack Developer',
        'FullStack Developer',
        'Fullstack Developer',
        'FULL STACK DEVELOPER',
        'Full Stack Web Developer',
        'Full Stack Engineer',
        'Full-Stack Software Engineer',
        'MERN Stack Developer',
        'MEAN Stack Developer',
    ])('%j is full stack', (title) => {
        expect(rolesOf(title)).toEqual(['full-stack-developer'])
    })
})

describe('roles are not interchangeable', () => {
    test.each([
        ['Software Engineer', ['software-engineer']],
        ['Software Developer', ['software-engineer']],
        ['Frontend Developer', ['frontend-developer']],
        ['Web Developer', ['web-developer']],
        ['React Developer', ['frontend-developer']],
        ['React Native Developer', ['mobile-developer']],
        ['Data Scientist', ['data-scientist']],
        ['Data Engineer', ['data-engineer']],
        ['Data Analyst', ['data-analyst']],
        ['DevOps Engineer', ['devops-engineer']],
        ['Cloud Engineer', ['cloud-engineer']],
        ['UI Designer', ['ui-ux-designer']],
        ['UI Developer', ['frontend-developer']],
        ['Business Analyst', []],
        ['Manufacturing Test Engineer', []],
        ['Mechanical Engineer', []],
        ['Graphic Designer', []],
        ['Project Manager', []],
    ])('%j -> %j', (title, roles) => {
        expect(rolesOf(title)).toEqual(roles)
    })

    test('a specific area beats a generic noun in the same part', () => {
        expect(rolesOf('Full Stack Web Developer')).toEqual([
            'full-stack-developer',
        ])
        expect(rolesOf('Frontend Web Developer')).toEqual([
            'frontend-developer',
        ])
        expect(rolesOf('Back-end Software Engineer')).toEqual([
            'backend-developer',
        ])
        expect(rolesOf('Software Developer in Test')).toEqual(['qa-engineer'])
        expect(rolesOf('Software Engineering Manager')).toEqual([
            'engineering-manager',
        ])
    })
})

describe('multiple explicit roles', () => {
    test.each([
        [
            'Frontend Developer | Full Stack Developer',
            ['frontend-developer', 'full-stack-developer'],
        ],
        [
            'Backend Developer, Full Stack Developer',
            ['backend-developer', 'full-stack-developer'],
        ],
        [
            'Software Engineer | Full Stack Developer',
            ['full-stack-developer', 'software-engineer'],
        ],
        [
            'DevOps Engineer | Software Developer',
            ['software-engineer', 'devops-engineer'],
        ],
        [
            'Frontend Developer | UX Designer',
            ['frontend-developer', 'ui-ux-designer'],
        ],
        ['Software & Data Engineer', ['software-engineer', 'data-engineer']],
        [
            'Data Scientist/Machine Learning Engineer',
            ['data-scientist', 'ml-engineer'],
        ],
        ['AI/ML Engineer', ['ml-engineer']],
    ])('%j -> %j', (title, roles) => {
        expect(rolesOf(title)).toEqual(roles)
    })

    test('shared nouns are distributed across tight separators', () => {
        expect(rolesOf('Mobile/Web Developer')).toEqual([
            'web-developer',
            'mobile-developer',
        ])
        expect(rolesOf('Web Designer and Developer')).toEqual([
            'web-developer',
            'ui-ux-designer',
        ])
        expect(rolesOf('Full Stack Web & Android Developer')).toEqual([
            'full-stack-developer',
            'mobile-developer',
        ])
        expect(rolesOf('(Full Stack/Game) Developer')).toEqual([
            'full-stack-developer',
            'game-developer',
        ])
    })

    test('technology lists are not split into roles', () => {
        expect(
            rolesOf('Full Stack Developer (React, Node, Typescript)')
        ).toEqual(['full-stack-developer'])
        expect(
            rolesOf('Full Stack Developer (Javascript || C# || Python)')
        ).toEqual(['full-stack-developer'])
        expect(rolesOf('Ruby on Rails Developer')).toEqual([
            'backend-developer',
        ])
        expect(
            rolesOf('Full Stack Web Developer (Front-End / Back-End)')
        ).toEqual(['full-stack-developer'])
    })

    test('language and framework developers only count without another role', () => {
        expect(rolesOf('Python Developer')).toEqual(['software-engineer'])
        expect(rolesOf('Data Scientist / Python Developer')).toEqual([
            'data-scientist',
        ])
        expect(rolesOf('Full-Stack Developer | Javascript Developer')).toEqual([
            'full-stack-developer',
        ])
        expect(
            rolesOf(
                'Full Stack Web Developer, React Developer, NodeJS Developer'
            )
        ).toEqual(['full-stack-developer'])
        expect(rolesOf('Software Engineer | React Developer')).toEqual([
            'frontend-developer',
            'software-engineer',
        ])
    })

    test('duplicates are removed and order follows the taxonomy', () => {
        expect(rolesOf('Front End Developer | React Developer')).toEqual([
            'frontend-developer',
        ])
        expect(rolesOf('Full Stack Developer | Frontend Developer')).toEqual(
            rolesOf('Frontend Developer | Full Stack Developer')
        )
        const resolved = rolesOf(
            'Game Developer / Software Developer / Android Developer'
        )
        expect(resolved).toEqual(ROLE_IDS.filter((id) => resolved.includes(id)))
    })
})

describe('seniority', () => {
    test.each([
        ['Junior Frontend Developer', 'junior'],
        ['Jnr Frontend Developer', 'junior'],
        ['jonior frontend web developer', 'junior'],
        ['Senior Backend Engineer', 'senior'],
        ['Sr. Software Engineer', 'senior'],
        ['Sr Full-Stack Engineer', 'senior'],
        ['Staff Software Engineer', 'staff'],
        ['Principal Developer', 'principal'],
        ['Lead Full Stack Developer', 'lead'],
        ['Web Developer Team Leader', 'lead'],
        ['Software Engineer Intern', 'intern'],
        ['Web-Developer (Intern)', 'intern'],
        ['Mid-Level Frontend Developer', 'mid'],
        ['Junior Web Developer | Junior Developer', 'junior'],
    ])('%j -> %j', (title, level) => {
        const result = resolveRole(title)
        expect(result.seniority).toBe(level)
        expect(result.seniorityStatus).toBe('explicit')
    })

    test.each([
        'Frontend Developer',
        'Student',
        'Computer Science Student',
        'Software Engineer 2',
        'SDE III at Yellow Class',
        'Chief Data Scientist',
        'Fresher/Frontend Developer/JAVA Programmer',
    ])('%j has no explicit seniority', (title) => {
        const result = resolveRole(title)
        expect(result.seniority).toBeNull()
        expect(result.seniorityStatus).toBe('unspecified')
    })

    test('contradictory levels are not guessed', () => {
        const result = resolveRole('Tech Lead and Senior Software Engineer')
        expect(result.seniority).toBeNull()
        expect(result.seniorityStatus).toBe('conflicting')
        expect(result.roles).toEqual(['software-engineer'])
    })

    test('staff, principal and lead are not collapsed into senior', () => {
        expect(SENIORITY_LEVELS).toEqual(
            expect.arrayContaining(['senior', 'staff', 'principal', 'lead'])
        )
        expect(resolveRole('Staff Softrware Developer').seniority).toBe('staff')
    })
})

describe('technologies', () => {
    test.each([
        [
            'Full Stack Developer (React, Node, Typescript)',
            ['react', 'nodejs', 'typescript'],
        ],
        [
            'Backend Software Engineer • Node.js | NestJS | TypeScript',
            ['nodejs', 'nestjs', 'typescript'],
        ],
        [
            'Full Stack Developer (MERN)',
            ['mongodb', 'express', 'react', 'nodejs'],
        ],
        [
            'Full Stack Web Developer (MEAN)',
            ['mongodb', 'express', 'angular', 'nodejs'],
        ],
        ['Python Developer', ['python']],
        ['React Native Developer', ['react-native']],
        ['Full Stack C# developer', ['csharp']],
        ['Senior .NET Developer', ['dotnet']],
        ['Full Stack Dev (C++, JS, Virtualization)', ['cpp', 'javascript']],
        [
            ' Full Stack Developer (React, Ruby on Rails)',
            ['react', 'ruby', 'rails'],
        ],
        ['Software Developer - JS/TS', ['javascript', 'typescript']],
        ['Frontend Developer', []],
        ['Software Engineer', []],
    ])('%j -> %j', (title, technologies) => {
        expect(resolveRole(title).technologies).toEqual(technologies)
    })

    test('React and React Native are distinct', () => {
        expect(
            resolveRole(
                'Front End Developer | React Native | React | TypeScript'
            ).technologies
        ).toEqual(['react-native', 'react', 'typescript'])
        expect(resolveRole('React Developer').technologies).toEqual(['react'])
    })

    test('technologies never change the classified roles', () => {
        expect(rolesOf('Web Developer (React and Node)')).toEqual([
            'web-developer',
        ])
        expect(
            rolesOf('Full Stack Developer (Java, Javascript, Css, Angular)')
        ).toEqual(['full-stack-developer'])
    })
})

describe('ambiguous and non-technical titles', () => {
    test.each([
        ['Developer', 'Generic title without a specialization'],
        ['Engineer', 'Generic title without a specialization'],
        ['Freelance Developer', 'Generic title without a specialization'],
        ['Senior Developer', 'Generic title without a specialization'],
        ['Student', 'Student or academic status, not a professional role'],
        [
            'CS Undergraduate',
            'Student or academic status, not a professional role',
        ],
        [
            'Aspiring Developer',
            'Describes an interest or aspiration, not a current role',
        ],
        [
            'An Aspiring Full-Stack Developer',
            'Describes an interest or aspiration, not a current role',
        ],
        [
            'AI Enthusiast',
            'Describes an interest or aspiration, not a current role',
        ],
        [
            'Data Scientist Candidate',
            'Describes an interest or aspiration, not a current role',
        ],
        ['Problem Solver', 'No recognized professional role'],
        ['Freelancer', 'No recognized professional role'],
        ['Director', 'No recognized professional role'],
        ['IT Professional', 'No recognized professional role'],
        ['AR/VR Developer', 'No recognized professional role'],
        ['undefined', 'No recognized professional role'],
    ])('%j is unclassified: %s', (title, reason) => {
        const result = resolveRole(title)
        expect(result.roles).toEqual([])
        expect(result.status).toBe('unclassified')
        expect(result.reason).toBe(reason)
    })

    test('interests next to a real role are ignored, the role is kept', () => {
        expect(
            rolesOf(
                'Software Developer | Aspiring Data Scientist | ML Enthusiast'
            )
        ).toEqual(['software-engineer'])
        expect(rolesOf('AI Engineeer | DevOps and Cloud Enthusiast')).toEqual([
            'ml-engineer',
        ])
        expect(
            rolesOf('Full Stack Software Engineer & Blockchain Enthusiast')
        ).toEqual(['full-stack-developer'])
    })

    test('unrecognized parts of a classified title are reported', () => {
        const result = resolveRole('Frontend Developer/Project Manager')
        expect(result.status).toBe('partial')
        expect(result.roles).toEqual(['frontend-developer'])
        expect(result.unmatched).toEqual(['Project Manager'])
    })

    test.each([undefined, null, '', '   ', 42, {}])('%j is empty', (value) => {
        const result = resolveRole(value)
        expect(result).toMatchObject({
            roles: [],
            seniority: null,
            technologies: [],
            status: 'empty',
        })
        expect(result.original).toBe(value)
    })

    test('a student is not made junior', () => {
        expect(resolveRole('Full Stack Web Developer (Student)')).toMatchObject(
            {
                roles: ['full-stack-developer'],
                seniority: null,
            }
        )
    })
})

describe('real submissions', () => {
    // Titles exactly as they appear in Submissions/
    test.each([
        ['FrontEnd Developer', ['frontend-developer'], null, []],
        ['Front-End Developer', ['frontend-developer'], null, []],
        ['Frontend Developer', ['frontend-developer'], null, []],
        ['Fronted Web Developer', ['frontend-developer'], null, []],
        ['Front-endWed Developer', ['frontend-developer'], null, []],
        ['Back-end Developer', ['backend-developer'], null, []],
        ['BackEnd Developer', ['backend-developer'], null, []],
        ['FullStack Developer', ['full-stack-developer'], null, []],
        ['Full Stack Developer', ['full-stack-developer'], null, []],
        [
            'FullStak/Software Developer',
            ['full-stack-developer', 'software-engineer'],
            null,
            [],
        ],
        [
            'Full Stack Developer (MERN)',
            ['full-stack-developer'],
            null,
            ['mongodb', 'express', 'react', 'nodejs'],
        ],
        ['Senior Frontend Developer', ['frontend-developer'], 'senior', []],
        ['Senior Software Engineer', ['software-engineer'], 'senior', []],
        [
            'React Native Developer',
            ['mobile-developer'],
            null,
            ['react-native'],
        ],
        [
            'Data Scientist / Python Developer',
            ['data-scientist'],
            null,
            ['python'],
        ],
        [
            'Software Engineer/Front-End Developer',
            ['frontend-developer', 'software-engineer'],
            null,
            [],
        ],
        ['Senior Software Engineer - iOS', ['mobile-developer'], 'senior', []],
        ['Software Engineer - Frontend', ['frontend-developer'], null, []],
        [
            'Python-Django Developer',
            ['backend-developer'],
            null,
            ['python', 'django'],
        ],
        ['Flutter Developer', ['mobile-developer'], null, ['flutter']],
        ['Unity Developer, App Developer', ['game-developer'], null, ['unity']],
        [
            'Blockchain Developer/Smart contract Engineer',
            ['blockchain-developer'],
            null,
            [],
        ],
        [
            'K8S specialist, DevOps and Cloud Engineer',
            ['devops-engineer', 'cloud-engineer'],
            null,
            ['kubernetes'],
        ],
        ['QA Lead/SDET', ['qa-engineer'], 'lead', []],
        [
            'UI UX Dexigner, Front End Developer, Mobile App Developer',
            ['frontend-developer', 'mobile-developer', 'ui-ux-designer'],
            null,
            [],
        ],
        ['Cloud Solutions Architect', ['solutions-architect'], null, []],
        ['Senior Engineering Manager', ['engineering-manager'], 'senior', []],
        [
            'Front-end Engineer | Technical Writer | AWS Cloud Practitioner',
            ['frontend-developer', 'technical-writer'],
            null,
            ['aws'],
        ],
        [
            'AI Product Manager | Full Stack Software Engineer',
            ['full-stack-developer', 'product-manager'],
            null,
            [],
        ],
        [
            'Software Engineer, Cybersecurity',
            ['software-engineer', 'security-engineer'],
            null,
            [],
        ],
        ['Junior Big Data Engineer', ['data-engineer'], 'junior', []],
        ['Technical Data Analyst', ['data-analyst'], null, []],
        ['Software Developer ▫ Web | Mobile', ['software-engineer'], null, []],
        [
            'Sr. Software Engineer (Javascript, React.js, AEM UI(Sightly, HTL), Bootstrap)',
            ['software-engineer'],
            'senior',
            ['javascript', 'react'],
        ],
        ['SDE III at Yellow Class', ['software-engineer'], null, []],
        ['Programmer Analyst', ['software-engineer'], null, []],
    ])('%j', (title, roles, seniority, technologies) => {
        expect(resolveRole(title)).toMatchObject({
            roles,
            seniority,
            technologies,
        })
    })

    const titles = fs
        .readdirSync(path.resolve('Submissions'))
        .filter((file) => !file.startsWith('.'))
        .map(
            (file) =>
                JSON.parse(
                    fs.readFileSync(path.resolve('Submissions', file), 'utf-8')
                ).jobTitle
        )

    test('every submitted title resolves to known ids', () => {
        for (const title of titles) {
            const result = resolveRole(title)
            result.roles.forEach((id) => expect(ROLE_IDS).toContain(id))
            if (result.seniority !== null) {
                expect(SENIORITY_LEVELS).toContain(result.seniority)
            }
            expect(resolveRole(title)).toEqual(result)
        }
    })

    // Every spelling of these areas in Submissions/ resolves to the role,
    // except where the area only describes another role.
    test.each([
        [
            /fro?n[td]?e?[\s-]*end/i,
            'frontend-developer',
            ['Full Stack Web Developer (Front-End / Back-End)'],
        ],
        [
            /back[\s-]*end/i,
            'backend-developer',
            ['Full Stack Web Developer (Front-End / Back-End)'],
        ],
        [
            /full[\s-]*sta|\bme[arv]n\b/i,
            'full-stack-developer',
            [
                'Full-Stack Solution Architect',
                'Cloud Software Engineer (full stack)',
            ],
        ],
    ])('%s -> %s', (pattern, role, exceptions) => {
        const missed = new Set(
            titles.filter(
                (t) =>
                    typeof t === 'string' &&
                    pattern.test(t) &&
                    !/aspiring|enthusiast/i.test(t) &&
                    !resolveRole(t).roles.includes(role)
            )
        )
        expect([...missed].sort()).toEqual(exceptions.sort())
    })
})
