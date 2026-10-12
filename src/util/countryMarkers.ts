import { getCountryName } from './countries/countryNames.js'
import { getPersonCountryCodes } from './countryFilters'

interface WithNormalizedCountries {
    normalized?: { countries?: string[] }
}

export interface CountryLatLng {
    iso: string
    name: string
    latlng: string[]
}

export interface CountryMarker {
    code: string
    country: string
    latlng: string[]
    numberOfDevs: number
}

// Number of developers per ISO code. A developer listing several countries is
// counted once in each of them, and never twice in the same country.
export const countDevelopersByCountry = (
    people: WithNormalizedCountries[]
): Record<string, number> => {
    const counts: Record<string, number> = {}
    people.forEach((person) => {
        new Set(getPersonCountryCodes(person)).forEach((code) => {
            counts[code] = (counts[code] || 0) + 1
        })
    })
    return counts
}

// Joins developer counts with marker coordinates by ISO code. Countries with
// no coordinates are skipped rather than producing an invalid marker.
export const buildCountryMarkers = (
    countsByCode: Record<string, number>,
    countriesLatLng: CountryLatLng[]
): CountryMarker[] => {
    const latLngByCode = new Map<string, string[]>()
    countriesLatLng.forEach(({ iso, latlng }) => {
        // countries.json lists some codes more than once (e.g. BQ, TF);
        // the first entry is the main territory.
        if (!latLngByCode.has(iso)) latLngByCode.set(iso, latlng)
    })

    return Object.keys(countsByCode)
        .sort()
        .filter((code) => latLngByCode.has(code))
        .map((code) => ({
            code,
            country: getCountryName(code),
            latlng: latLngByCode.get(code) as string[],
            numberOfDevs: countsByCode[code],
        }))
}
