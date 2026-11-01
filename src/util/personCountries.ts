import Person from '../interfaces/person'
import { getCountryName } from './countries/countryNames.ts'
import { getCountryCoordinates } from './countries/countryCoordinates.ts'

export interface CountryOption {
    code: string
    label: string
}

export interface CountryMarker {
    code: string
    country: string
    latlng: [number, number]
    numberOfDevs: number
}

// ISO codes resolved for a profile during JSON aggregation.
const getPersonCountryCodes = (person: Person): string[] =>
    person.normalized?.countries ?? []

// One option per canonical country, sorted by display name. Profiles whose
// country could not be resolved contribute no option.
export const getCountryOptions = (
    people: readonly Person[]
): CountryOption[] => {
    const codes = new Set<string>()
    people.forEach((person) =>
        getPersonCountryCodes(person).forEach((code) => codes.add(code))
    )
    return Array.from(codes)
        .map((code) => ({ code, label: getCountryName(code) }))
        .sort((a, b) => a.label.localeCompare(b.label, 'en'))
}

// A profile matches if any of its countries is selected. An empty selection
// matches everyone.
export const matchesCountries = (
    person: Person,
    selectedCodes: string[]
): boolean =>
    selectedCodes.length === 0 ||
    getPersonCountryCodes(person).some((code) => selectedCodes.includes(code))

// Developers counted per ISO code, joined with generated coordinates. A
// developer listing several countries is counted once in each of them, and
// never twice in the same country. Codes without coordinates are skipped
// rather than producing an invalid marker.
export const getCountryMarkers = (
    people: readonly Person[]
): CountryMarker[] => {
    const counts: Record<string, number> = {}
    people.forEach((person) => {
        new Set(getPersonCountryCodes(person)).forEach((code) => {
            counts[code] = (counts[code] || 0) + 1
        })
    })

    const markers: CountryMarker[] = []
    Object.keys(counts)
        .sort()
        .forEach((code) => {
            const coordinates = getCountryCoordinates(code)
            if (!coordinates) {
                return
            }
            markers.push({
                code,
                country: getCountryName(code),
                latlng: [coordinates[0], coordinates[1]],
                numberOfDevs: counts[code],
            })
        })
    return markers
}
