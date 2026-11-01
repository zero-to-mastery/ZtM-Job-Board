// Offline city lookup for free-text locations. A city is matched by normalized
// name within its country. A stated US state breaks ties between same-named
// cities, then the most populous match wins. Unmatched text returns null; the
// approximate state/country fallback is handled separately.

import { usStateCode } from './usStates.ts'

export interface City {
    cityId: number
    name: string
    altName: string
    country: string
    adminCode: string
    population: number
    loc: { coordinates: [number, number] }
}

export interface Place {
    lat: number
    lng: number
    adminCode: string
}

// Common short or historic names that the city dataset does not list
export const CITY_ALIASES: Readonly<Record<string, string>> = {
    nyc: 'newyorkcity',
    newyork: 'newyorkcity',
    manhattan: 'newyorkcity',
    sf: 'sanfrancisco',
    bayarea: 'sanfrancisco',
    la: 'losangeles',
    dc: 'washington',
    washingtondc: 'washington',
    bangalore: 'bengaluru',
    bombay: 'mumbai',
    calcutta: 'kolkata',
    madras: 'chennai',
    gurugram: 'gurgaon',
    saigon: 'hochiminhcity',
    hochiminh: 'hochiminhcity',
    kiev: 'kyiv',
    kochi: 'cochin',
    cologne: 'koln',
    cebu: 'cebucity',
    caba: 'buenosaires',
    cdmx: 'mexicocity',
    gothenburg: 'goteborg',
    antwerp: 'antwerpen',
    bruges: 'brugge',
    aarhus: 'arhus',
    trichy: 'tiruchirappalli',
    bogura: 'bogra',
    chattogram: 'chittagong',
    bhubaneswar: 'bhubaneshwar',
    trivandrum: 'thiruvananthapuram',
    alleppey: 'alappuzha',
    tuticorin: 'thoothukudi',
    vizag: 'visakhapatnam',
    nasik: 'nashik',
    denhaag: 'thehague',
    newtaipei: 'taipei',
    fct: 'abuja',
    fctabuja: 'abuja',
    addisabeba: 'addisababa',
    ulaanbaatar: 'ulanbator',
    marrakech: 'marrakesh',
    sanfranciscobayarea: 'sanfrancisco',
    banglore: 'bengaluru',
    hyderbad: 'hyderabad',
}

// Letters that Unicode normalization does not split into a base letter
const TRANSLITERATIONS: Readonly<Record<string, string>> = {
    ł: 'l',
    ø: 'o',
    æ: 'ae',
    œ: 'oe',
    ß: 'ss',
    đ: 'd',
    ð: 'd',
    ı: 'i',
    þ: 'th',
}

export function cleanPlaceText(value: string): string {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\([^)]*\)?/g, ' ')
        .toLowerCase()
        .replace(/[łøæœßđðıþ]/g, (letter) => TRANSLITERATIONS[letter])
        .trim()
}

const compact = (value: string): string => value.replace(/[^a-z]/g, '')

const round = (value: number): number => Math.round(value * 1000) / 1000

const aliasOf = (key: string): string =>
    Object.hasOwn(CITY_ALIASES, key) ? CITY_ALIASES[key] : key

const PREFIX_OR_SUFFIX = /^\s*(greater|metro|downtown)\s+|\s+(city|metro)\s*$/g

/**
 * Candidate lookup keys for a free-text city, most specific first.
 * "Greater Lagos, Nigeria" -> ["greaterlagosnigeria", "greaterlagos", "lagos", "nigeria"]
 */
export function cityKeys(city: string | undefined): string[] {
    if (typeof city !== 'string') return []
    const keys: string[] = []
    const push = (part: string): void => {
        const key = compact(part)
        if (!key) return
        keys.push(aliasOf(key))
        const trimmed = compact(part.replace(PREFIX_OR_SUFFIX, ''))
        if (trimmed && trimmed !== key) keys.push(aliasOf(trimmed))
    }
    const text = cleanPlaceText(city)
    push(text)
    text.split(/[,/|;]| - /).forEach(push)
    return [...new Set(keys)]
}

export function createGeocoder({ cities }: { cities: readonly City[] }) {
    const byKey = new Map<string, City[]>()
    for (const city of cities) {
        for (const name of [city.name, ...city.altName.split(',')]) {
            const key = compact(cleanPlaceText(name))
            if (!key) continue
            const indexKey = `${city.country}:${key}`
            const list = byKey.get(indexKey)
            if (!list) byKey.set(indexKey, [city])
            else if (!list.includes(city)) list.push(city)
        }
    }

    // The stated region as a dataset admin code: "West Virginia" -> "wv"
    const regionOf = (
        state: string | undefined,
        countryCode: string
    ): string => {
        if (typeof state !== 'string') return ''
        const usState = countryCode === 'US' ? usStateCode(state) : null
        return (usState ?? compact(cleanPlaceText(state))).toLowerCase()
    }

    // Prefer a match in the stated region, then the most populous, then the lowest cityId
    const pickCity = (
        matches: City[],
        state: string | undefined,
        countryCode: string
    ): City => {
        const region = regionOf(state, countryCode)
        const inRegion = matches.filter(
            (city) =>
                region !== '' &&
                compact(city.adminCode.toLowerCase()) === region
        )
        const pool = inRegion.length > 0 ? inRegion : matches
        return pool.reduce((best, city) =>
            city.population > best.population ||
            (city.population === best.population && city.cityId < best.cityId)
                ? city
                : best
        )
    }

    return function geocode({
        city,
        state,
        countryCode,
    }: {
        city?: string
        state?: string
        countryCode: string | null
    }): Place | null {
        if (!countryCode) return null
        for (const key of cityKeys(city)) {
            const matches = byKey.get(`${countryCode}:${key}`)
            if (!matches) continue
            const found = pickCity(matches, state, countryCode)
            const [lng, lat] = found.loc.coordinates
            return {
                lat: round(lat),
                lng: round(lng),
                adminCode: found.adminCode,
            }
        }
        return null
    }
}
