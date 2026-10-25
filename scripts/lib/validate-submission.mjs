const isObject = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value)
/**
 * Validates the structure and field types of a new or updated submission.
 * Job titles and country values intentionally remain free-form.
 *
 * @param {unknown} data
 * @param {string} filename
 * @returns {string[]}
 */
export function validateSubmission(data, filename = 'submission.json') {
    const errors = []
    const add = (message) => errors.push(`${filename}: ${message}`)
    if (!isObject(data)) {
        return [`${filename}: submission must be a JSON object`]
    }
    if (typeof data.name !== 'string' || !data.name.trim()) {
        add('"name" is required and must be a nonblank string')
    }
    // Optional fields must have the correct type when provided.
    for (const field of ['img', 'email', 'jobTitle']) {
        if (
            data[field] !== undefined &&
            typeof data[field] !== 'string'
        ) {
            add(`"${field}" must be a string when provided`)
        }
    }
    // Links must exist and be an object.
    if (!isObject(data.links)) {
        add('"links" is required and must be an object')
    } else {
        for (const field of ['website', 'linkedin', 'github']) {
            if (
                data.links[field] !== undefined &&
                typeof data.links[field] !== 'string'
            ) {
                add(`"links.${field}" must be a string when provided`)
            }
        }
    }
    // Location must exist and be an object.
    if (!isObject(data.location)) {
        add('"location" is required and must be an object')
    } else {
        for (const field of ['city', 'state', 'country']) {
            if (
                data.location[field] !== undefined &&
                typeof data.location[field] !== 'string'
            ) {
                add(`"location.${field}" must be a string when provided`)
            }
        }
    }
    if (data.skills !== undefined) {
        if (
            !Array.isArray(data.skills) ||
            data.skills.some(
                (skill) => typeof skill !== 'string' || !skill.trim()
            )
        ) {
            add('"skills" must be an array of nonblank strings')
        }
    }
    if (data.id !== undefined && typeof data.id !== 'string') {
        add('"id" must be a string when provided')
    }
    return errors
}
