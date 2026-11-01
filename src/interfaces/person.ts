export default interface Person {
    id: string
    img?: string
    name: string
    email?: string
    jobTitle?: string
    skills?: string[]
    location: {
        city?: string
        state?: string
        country?: string
        coordinates?: {
            lat: number
            lng: number
        }
    }
    links: {
        website?: string
        linkedin?: string
        github?: string
    }
    // Added by scripts/aggregate-json.mjs; see docs/country-normalization.md
    normalized?: {
        countries: string[] // ISO 3166-1 alpha-2 codes
        // Added by scripts/lib/location.ts; null when the place cannot be resolved
        geo?: { lat: number; lng: number; approximate: boolean } | null
    }
}
