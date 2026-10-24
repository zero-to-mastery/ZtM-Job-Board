/** @param {readonly string[]} [skills] */
export function normalizeSkills(skills = []) {
    /** @type {Map<string, string>} */
    const labels = new Map()
    for (const skill of skills) {
        const label = skill.trim()
        const key = label.toLowerCase()
        if (!labels.has(key)) {
            labels.set(key, label)
        }
    }
    return Array.from(labels.values())
}

/**
 * @param {unknown} skills
 * @param {string} filename
 */
export function validateSkills(skills, filename) {
    if (skills === undefined) {
        return
    }
    if (
        !Array.isArray(skills) ||
        skills.some((skill) => typeof skill !== 'string' || !skill.trim())
    ) {
        throw new Error(
            `${filename}: "skills" must be an array of nonblank strings, for example ["React", "TypeScript"]. Omit it or use [] if no skills are declared.`
        )
    }
}
