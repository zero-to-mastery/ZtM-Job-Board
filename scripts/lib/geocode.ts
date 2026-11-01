// Offline city lookup for free-text locations. A city is matched by normalized
// name within its country. A stated US state breaks ties between same-named
// cities, then the most populous match wins. When no city matches, the center
// of the stated state/region is used, then the center of the country. Those
// fallbacks are marked approximate. A country with no center and no cities
// returns null. Nothing here calls out to the network.

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
    approximate: boolean
    adminCode?: string
}

// [lat, lng] for an ISO 3166-1 alpha-2 code, or undefined when unknown
export type CountryCenter = (
    countryCode: string
) => [number, number] | undefined

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
    l: 'i',
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

export function createGeocoder({
    cities,
    countryCenter,
}: {
    cities: readonly City[]
    countryCenter: CountryCenter
}) {
    const byKey = new Map<string, City[]>()
    // "US:wv" -> the dataset's cities in that state/region
    const byRegion = new Map<string, City[]>()
    // "US" -> the most populous city, used when no country center is known
    const largestCity = new Map<string, City>()
    for (const city of cities) {
        const regionKey = `${city.country}:${compact(city.adminCode.toLowerCase())}`
        const region = byRegion.get(regionKey)
        if (!region) byRegion.set(regionKey, [city])
        else region.push(city)

        const largest = largestCity.get(city.country)
        if (
            !largest ||
            city.population > largest.population ||
            (city.population === largest.population &&
                city.cityId < largest.cityId)
        ) {
            largestCity.set(city.country, city)
        }

        for (const name of [city.name, ...city.altName.split(',')]) {
            const key = compact(cleanPlaceText(name))
            if (!key) continue
            const indexKey = `${city.country}:${key}`
            const list = byKey.get(indexKey)
            if (!list) byKey.set(indexKey, [city])
            else if (!list.includes(city)) list.push(city)
        }
    }

    // Center of a state/region: the city nearest the mean position of its
    // cities, so the point stays inside the region whatever its shape. Cached
    // per region because the scan is linear in the region's city count.
    const regionCenters = new Map<string, City | null>()
    const regionCenterOf = (
        region: string,
        countryCode: string
    ): City | null => {
        const key = `${countryCode}:${region}`
        const cached = regionCenters.get(key)
        if (cached !== undefined) return cached
        const regionCities = byRegion.get(key)
        let center: City | null = null
        if (regionCities) {
            const mean = (index: 0 | 1): number =>
                regionCities.reduce(
                    (sum, city) => sum + city.loc.coordinates[index],
                    0
                ) / regionCities.length
            const meanLng = mean(0)
            const meanLat = mean(1)
            const distance = (city: City): number =>
                (city.loc.coordinates[0] - meanLng) ** 2 +
                (city.loc.coordinates[1] - meanLat) ** 2
            center = regionCities.reduce((best, city) =>
                distance(city) < distance(best) ? city : best
            )
        }
        regionCenters.set(key, center)
        return center
    }

    // [lat, lng] of a dataset city, from its GeoJSON-ordered [lng, lat]
    const coordinatesOf = (city: City | undefined): [number, number] | null =>
        city ? [city.loc.coordinates[1], city.loc.coordinates[0]] : null

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
                approximate: false,
                adminCode: found.adminCode,
            }
        }

        // No city matched: the stated state/region, then the country
        const region = regionOf(state, countryCode)
        const regionCity = region ? regionCenterOf(region, countryCode) : null
        if (regionCity) {
            const [lng, lat] = regionCity.loc.coordinates
            return {
                lat: round(lat),
                lng: round(lng),
                approximate: true,
                adminCode: regionCity.adminCode,
            }
        }

        const center =
            countryCenter(countryCode) ??
            coordinatesOf(largestCity.get(countryCode))
        if (!center) return null
        return {
            lat: round(center[0]),
            lng: round(center[1]),
            approximate: true,
        }
    }
}
