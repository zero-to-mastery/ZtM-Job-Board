// Locale-independent case folding is deliberate: `toLocaleLowerCase()` would
// vary with the user's locale (e.g. Turkish dotless/dotted I) and silently
// break skill matching for everyone else.
export function skillKey(skill: string): string {
    return skill.trim().toLowerCase()
}

export function normalizeSkills(skills: readonly string[] = []): string[] {
    const labels = new Map<string, string>()
    for (const skill of skills) {
        const label = skill.trim()
        const key = skillKey(label)
        if (!labels.has(key)) {
            labels.set(key, label)
        }
    }
    return Array.from(labels.values())
}

export function validateSkills(skills: unknown, filename: string): void {
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
