// Canonical recruiter-facing role categories. Profiles store the stable `id`;
// the UI shows `label`. The array order is the order roles are listed in
// `normalized.roles`, so changing it changes the generated JSON.
//
// See docs/role-normalization.md before adding a category.

export const ROLE_TAXONOMY = [
    { id: 'frontend-developer', label: 'Frontend Developer' },
    { id: 'backend-developer', label: 'Backend Developer' },
    { id: 'full-stack-developer', label: 'Full Stack Developer' },
    { id: 'web-developer', label: 'Web Developer' },
    { id: 'software-engineer', label: 'Software Engineer / Developer' },
    { id: 'mobile-developer', label: 'Mobile Developer' },
    { id: 'game-developer', label: 'Game Developer' },
    { id: 'blockchain-developer', label: 'Blockchain / Web3 Developer' },
    { id: 'devops-engineer', label: 'DevOps Engineer' },
    { id: 'cloud-engineer', label: 'Cloud Engineer' },
    { id: 'data-analyst', label: 'Data Analyst' },
    { id: 'data-engineer', label: 'Data Engineer' },
    { id: 'data-scientist', label: 'Data Scientist' },
    { id: 'ml-engineer', label: 'AI / Machine Learning Engineer' },
    { id: 'qa-engineer', label: 'QA / Test Engineer' },
    { id: 'security-engineer', label: 'Cybersecurity' },
    { id: 'ui-ux-designer', label: 'UI / UX Designer' },
    { id: 'solutions-architect', label: 'Solutions Architect' },
    { id: 'engineering-manager', label: 'Engineering Manager' },
    { id: 'product-manager', label: 'Product Manager' },
    { id: 'technical-writer', label: 'Technical Writer' },
]

export const ROLE_IDS = ROLE_TAXONOMY.map((role) => role.id)

const LABELS = Object.fromEntries(
    ROLE_TAXONOMY.map((role) => [role.id, role.label])
)

/**
 * @param {string} id
 * @returns {string} The display label, or the id itself if it is unknown.
 */
export const getRoleLabel = (id) => LABELS[id] ?? id

// Explicit seniority levels, from least to most senior. `lead` is kept
// separate from `staff`/`principal` because it describes responsibility, not
// only level.
export const SENIORITY_LEVELS = [
    'intern',
    'junior',
    'mid',
    'senior',
    'staff',
    'principal',
    'lead',
]
