export default interface Person {
    id: string
    img: string
    name: string
    email?: string
    jobTitle: string
    location: {
        city?: string
        state?: string
        country?: string
    }
    links: {
        website?: string
        linkedin?: string
        github?: string
    }
    // Added by scripts/aggregate-json.mjs; see docs/country-normalization.md
    // and docs/role-normalization.md
    normalized?: {
        countries: string[] // ISO 3166-1 alpha-2 codes
        roles: string[] // ids from src/util/roles/roleTaxonomy.js
        seniority: string | null // explicit level from the title, if any
        technologies: string[] // technologies named in the title
        // Map position from the city, or the first country's center
        geo?: {
            lat: number
            lng: number
            // true when the city was not recognized
            approximate: boolean
        } | null
        // IANA zone and its standard (non-DST) offset in minutes
        timezone?: {
            name: string
            utcOffset: number
        } | null
    }
}
