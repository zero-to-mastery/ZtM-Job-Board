import { getCountryName } from './countries/countryNames.js'

export interface CountryOption {
    code: string
    label: string
}

interface WithNormalizedCountries {
    normalized?: { countries?: string[] }
}

// ISO codes resolved for a profile during JSON aggregation.
export const getPersonCountryCodes = (person: WithNormalizedCountries) =>
    person.normalized?.countries ?? []

// One option per canonical country, sorted by display name. Profiles whose
// country could not be resolved contribute no option.
export const getCountryOptions = (
    people: WithNormalizedCountries[]
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
export const filterByCountries = <T extends WithNormalizedCountries>(
    people: T[],
    selectedCodes: string[]
): T[] =>
    selectedCodes.length === 0
        ? people
        : people.filter((person) =>
              getPersonCountryCodes(person).some((code) =>
                  selectedCodes.includes(code)
              )
          )
