// Vocabulary used by resolveRole.js. Everything here is matched against a
// normalised key: lowercase, accents removed, punctuation and hyphens turned
// into single spaces (see normalizeRoleKey). Write entries in that form.
//
// See docs/role-normalization.md for how these tables are applied.

// Whole-word spelling fixes, applied before the phrase rewrites below. Only
// add misspellings that actually appear in submissions.
export const TOKEN_TYPOS = {
    fronted: 'frontend',
    fullstak: 'fullstack',
    sofeware: 'software',
    sofware: 'software',
    softrware: 'software',
    sw: 'software',
    developper: 'developer',
    devoloper: 'developer',
    developement: 'development',
    enginner: 'engineer',
    engineeer: 'engineer',
    dexigner: 'designer',
    desginer: 'designer',
    sciencetist: 'scientist',
    enthusisast: 'enthusiast',
    pythoon: 'python',
    javascrip: 'javascript',
    jonior: 'junior',
    wed: 'web',
    webdeveloper: 'web developer',
    webdev: 'web dev',
    uiux: 'ui ux',
}

// Joins the spellings of multi-word terms into one token so rules can match
// them as words: "Front-End", "Front End" and "FrontEnd" all become
// "frontend". Applied in order.
export const PHRASE_REWRITES = [
    [/\bfront endwed\b/g, 'frontend web'], // "Front-endWed Developer"
    [/\b(?:front|font|frone) ?end\b/g, 'frontend'],
    [/\bback ?end\b/g, 'backend'],
    [/\bfull ?stack\b/g, 'fullstack'],
    [/\bfull fullstack\b/g, 'fullstack'],
    [/\bfull web stack\b/g, 'fullstack web'],
    [/\b(mern|mean|mevn) ?stack\b/g, '$1'],
    [/\bdev ?ops\b/g, 'devops'],
    [/\bcyber ?security\b/g, 'cybersecurity'],
    [/\breact ?native\b/g, 'reactnative'],
    [/\bdot ?net\b/g, 'dotnet'],
    [/\b(react|node|vue|next|nest|nuxt|express|gatsby|angular) js\b/g, '$1js'],
    [/\bspring boot\b/g, 'springboot'],
]

// Words that end a job title ("Web *Developer*", "Data *Scientist*"). Used to
// tell a role from a bare qualifier, and to expand titles like
// "Mobile/Web Developer" into "Mobile Developer" + "Web Developer".
export const DEVELOPER_HEADS = [
    'developer',
    'developers',
    'dev',
    'devs',
    'engineer',
    'engineers',
    'programmer',
    'development',
    'engineering',
    'coder',
]
export const OTHER_HEADS = [
    'designer',
    'architect',
    'scientist',
    'analyst',
    'manager',
    'writer',
    'student',
]

// A segment containing one of these describes an interest, not a current
// role ("AI Enthusiast", "Aspiring Data Scientist"), and yields no role.
export const ASPIRATION_TERMS = [
    'aspiring',
    'aspirant',
    'enthusiast',
    'enthusiasts',
    'interest',
    'interested',
    'wannabe',
    'candidate',
]

// Only used to explain why a title is unclassified. Being a student never
// implies a role or a seniority level.
export const STUDENT_TERMS = [
    'student',
    'students',
    'undergrad',
    'undergraduate',
    'grad',
    'graduate',
    'postgraduate',
    'major',
    'sophomore',
    'sophmore',
    'freshman',
    'btech',
    'ug',
]

// Employment arrangements, not specializations: "Freelance Developer" is as
// generic as "Developer". Only used to explain why a title is unclassified.
export const EMPLOYMENT_TERMS = [
    'freelance',
    'freelancer',
    'self',
    'employed',
    'remote',
    'contract',
    'contractor',
    'associate',
]

// Explicit seniority words. Numbered levels ("Software Engineer 2", "SDE III")
// are deliberately ignored: their meaning differs between companies.
export const SENIORITY_TERMS = {
    intern: ['intern', 'interns', 'internship'],
    junior: ['junior', 'jr', 'jnr'],
    mid: ['mid', 'midlevel', 'intermediate'],
    senior: ['senior', 'sr', 'snr'],
    staff: ['staff'],
    principal: ['principal'],
    lead: ['lead', 'leader', 'teamlead', 'techlead'],
}

// Role rules. Each rule matches one title segment (see resolveRole.js):
//
//   pattern  regex tested against the segment key
//   heads    which job-title nouns the segment must contain:
//              'any'                no requirement
//              'developer'          one of DEVELOPER_HEADS
//              'developer-or-none'  one of DEVELOPER_HEADS, or no head noun at
//                                   all ("Full Stack", "DevOps & Cybersecurity")
//              string[]             one of the listed nouns
//
// Tiers are tried in order and a segment stops at the first tier that
// matches, so a specific role always beats a generic one: "Full Stack Web
// Developer" is full stack, not also web, and "Back-end Software Engineer" is
// backend, not also software engineer.
export const SPECIFIC_ROLE_RULES = [
    {
        role: 'frontend-developer',
        pattern: /\bfrontend\b/,
        heads: 'developer-or-none',
    },
    // UI/UX *developers* and *engineers* build interfaces; UI/UX *designers*
    // are matched separately below.
    {
        role: 'frontend-developer',
        pattern:
            /\b(?:ui|ux)(?: ux)?(?: software)? (?:developer|developers|dev|engineer)\b/,
        heads: 'any',
    },
    {
        role: 'backend-developer',
        pattern: /\bbackend\b/,
        heads: 'developer-or-none',
    },
    {
        role: 'full-stack-developer',
        pattern: /\b(?:fullstack|mern|mean|mevn)\b/,
        heads: 'developer-or-none',
    },
    {
        role: 'mobile-developer',
        pattern: /\b(?:mobile|android|ios|reactnative|flutter|swift|swiftui)\b/,
        heads: 'developer',
    },
    {
        role: 'game-developer',
        pattern: /\b(?:game|games|unity|unreal)\b/,
        heads: 'developer',
    },
    {
        role: 'blockchain-developer',
        pattern: /\b(?:blockchain|web3|smart contracts?|solidity)\b/,
        heads: 'developer',
    },
    {
        role: 'devops-engineer',
        pattern: /\b(?:devops|sre|site reliability)\b/,
        heads: 'developer-or-none',
    },
    { role: 'cloud-engineer', pattern: /\bcloud\b/, heads: 'developer' },
    { role: 'data-analyst', pattern: /\bdata\b/, heads: ['analyst'] },
    {
        role: 'data-engineer',
        pattern: /\bdata\b/,
        heads: ['engineer', 'engineers'],
    },
    { role: 'data-scientist', pattern: /\bdata\b/, heads: ['scientist'] },
    {
        role: 'ml-engineer',
        pattern: /\b(?:machine learning|ml|ai|deep learning)\b/,
        heads: ['engineer', 'engineers', 'developer', 'dev', 'scientist'],
    },
    {
        role: 'qa-engineer',
        pattern: /\b(?:qa|sdet|quality assurance|test automation)\b/,
        heads: 'developer-or-none',
    },
    {
        role: 'qa-engineer',
        pattern:
            /\bsoftware (?:developer|engineer) in test\b|\bsoftware test(?:ing)? engineer\b/,
        heads: 'any',
    },
    {
        role: 'security-engineer',
        pattern:
            /\b(?:cybersecurity|ethical hacker|penetration tester|pentester)\b/,
        heads: 'any',
    },
    {
        role: 'security-engineer',
        pattern: /\bsecurity (?:engineer|analyst|specialist)\b/,
        heads: 'any',
    },
    {
        role: 'ui-ux-designer',
        pattern: /\b(?:ui|ux|product|web) designer\b|\b(?:ui|ux) design\b/,
        heads: 'any',
    },
    {
        role: 'solutions-architect',
        pattern:
            /\b(?:solutions?|cloud|cloud solutions?|software|technical|enterprise) architect\b/,
        heads: 'any',
    },
    {
        role: 'engineering-manager',
        pattern: /\b(?:engineering|development) manager\b/,
        heads: 'any',
    },
    { role: 'product-manager', pattern: /\bproduct manager\b/, heads: 'any' },
    { role: 'technical-writer', pattern: /\btechnical writer\b/, heads: 'any' },
]

// A framework in place of an area: "React Developer" is a frontend developer,
// "Django Developer" a backend developer. Only used when no specific rule
// matched the segment, so "Full Stack React Developer" stays full stack.
// React Native is a mobile rule above, not React.
export const FRAMEWORK_ROLE_RULES = [
    {
        role: 'frontend-developer',
        pattern:
            /\b(?:react|reactjs|angular|angularjs|vue|vuejs|nextjs|nuxt|nuxtjs)\b/,
        heads: 'developer',
    },
    {
        role: 'backend-developer',
        pattern:
            /\b(?:node|nodejs|nestjs|express|expressjs|django|flask|laravel|spring|springboot|rails)\b/,
        heads: 'developer',
    },
]

// Broad roles, used only when nothing more specific matched the segment.
// The first match wins.
export const GENERIC_ROLE_RULES = [
    {
        role: 'web-developer',
        pattern: /\b(?:web|wordpress|shopify|webmaster)\b/,
        heads: 'developer',
    },
    {
        role: 'software-engineer',
        pattern: /\b(?:software|application|applications|desktop)\b/,
        heads: 'developer',
    },
    {
        role: 'software-engineer',
        pattern: /\b(?:sde|programmer analyst)\b/,
        heads: 'any',
    },
]

// "Python Developer", "C# Developer": a language developer is a software
// developer, but only when the title names no other role. In "Data Scientist /
// Python Developer" the language just describes the data scientist.
export const LANGUAGE_ROLE_RULE = {
    role: 'software-engineer',
    pattern:
        /\b(?:python|java|javaee|javascript|js|typescript|ts|csharp|dotnet|cpp|c|php|ruby|golang|delphi|kotlin|scala|rust|vb|perl)\b/,
    heads: 'developer',
}

// Technology identifiers, matched as whole words in the whole title
// (including text in parentheses). A value may expand to several ids.
export const TECHNOLOGY_ALIASES = {
    javascript: 'javascript',
    js: 'javascript',
    typescript: 'typescript',
    ts: 'typescript',
    react: 'react',
    reactjs: 'react',
    reactnative: 'react-native',
    angular: 'angular',
    angularjs: 'angular',
    vue: 'vue',
    vuejs: 'vue',
    nextjs: 'nextjs',
    nuxt: 'nuxt',
    nuxtjs: 'nuxt',
    node: 'nodejs',
    nodejs: 'nodejs',
    nestjs: 'nestjs',
    express: 'express',
    expressjs: 'express',
    gatsby: 'gatsby',
    gatsbyjs: 'gatsby',
    python: 'python',
    django: 'django',
    flask: 'flask',
    java: 'java',
    javaee: 'java',
    spring: 'spring',
    springboot: 'spring',
    kotlin: 'kotlin',
    swift: 'swift',
    swiftui: 'swift',
    flutter: 'flutter',
    dart: 'dart',
    csharp: 'csharp',
    dotnet: 'dotnet',
    cpp: 'cpp',
    c: 'c',
    php: 'php',
    laravel: 'laravel',
    ruby: 'ruby',
    rails: 'rails',
    'ruby on rails': ['ruby', 'rails'],
    golang: 'go',
    html: 'html',
    html5: 'html',
    css: 'css',
    css3: 'css',
    sql: 'sql',
    mysql: 'mysql',
    mongodb: 'mongodb',
    postgresql: 'postgresql',
    postgres: 'postgresql',
    aws: 'aws',
    docker: 'docker',
    kubernetes: 'kubernetes',
    k8s: 'kubernetes',
    wordpress: 'wordpress',
    shopify: 'shopify',
    ionic: 'ionic',
    unity: 'unity',
    // Stack abbreviations
    mern: ['mongodb', 'express', 'react', 'nodejs'],
    mean: ['mongodb', 'express', 'angular', 'nodejs'],
    mevn: ['mongodb', 'express', 'vue', 'nodejs'],
}
