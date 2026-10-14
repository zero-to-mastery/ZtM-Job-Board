import { usStateCode } from './usStates.mjs'

// Common short or historic names that the city dataset does not list
export const CITY_ALIASES = {
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
const TRANSLITERATIONS = {
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

export const cleanPlaceText = (value) =>
    value
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\([^)]*\)?/g, ' ')
        .toLowerCase()
        .replace(/[łøæœßđðıþ]/g, (letter) => TRANSLITERATIONS[letter])
        .trim()

const compact = (value) => value.replace(/[^a-z]/g, '')

const round = (value) => Math.round(value * 1000) / 1000

const PREFIX_OR_SUFFIX = /^\s*(greater|metro|downtown)\s+|\s+(city|metro)\s*$/g

/**
 * Candidate lookup keys for a free-text city, most specific first.
 * "Greater Lagos, Nigeria" -> ["greaterlagosnigeria", "greaterlagos", "lagos", "nigeria"]
 */
export function cityKeys(city) {
    if (typeof city !== 'string') return []
    const text = cleanPlaceText(city)
    const keys = []
    const push = (part) => {
        const key = compact(part)
        if (!key) return
        keys.push(CITY_ALIASES[key] ?? key)
        const trimmed = compact(part.replace(PREFIX_OR_SUFFIX, ''))
        if (trimmed && trimmed !== key) {
            keys.push(CITY_ALIASES[trimmed] ?? trimmed)
        }
    }
    push(text)
    text.split(/[,/|;]| - /).forEach(push)
    return [...new Set(keys)]
}

/**
 * @param {object} options
 * @param {Array<{name: string, altName: string, country: string, adminCode: string, population: number, loc: {coordinates: [number, number]}}>} options.cities
 * @param {Record<string, [number, number]>} options.countryCenters ISO -> [lat, lng]
 */
export function createGeocoder({ cities, countryCenters }) {
    const byKey = new Map()
    const largestCity = new Map()
    // "US:wv" -> the dataset's cities in that state/region
    const byRegion = new Map()
    for (const city of cities) {
        const regionKey = `${city.country}:${compact(city.adminCode.toLowerCase())}`
        const region = byRegion.get(regionKey)
        if (!region) byRegion.set(regionKey, [city])
        else region.push(city)

        const names = [city.name, ...city.altName.split(',')]
        for (const name of names) {
            const key = compact(cleanPlaceText(name))
            if (!key) continue
            const indexKey = `${city.country}:${key}`
            const list = byKey.get(indexKey)
            if (!list) byKey.set(indexKey, [city])
            else if (!list.includes(city)) list.push(city)
        }
        const largest = largestCity.get(city.country)
        if (!largest || city.population > largest.population) {
            largestCity.set(city.country, city)
        }
    }

    // The stated state/region as a dataset admin code key: "West Virginia" -> "wv"
    const regionKey = (state, countryCode) => {
        const usState = countryCode === 'US' ? usStateCode(state) : null
        if (usState) return usState.toLowerCase()
        return typeof state === 'string' ? compact(cleanPlaceText(state)) : ''
    }

    // Prefer a city in the stated state/region, then the most populous one
    const pickCity = (matches, state, countryCode) => {
        const region = regionKey(state, countryCode)
        const inState = matches.filter(
            (city) => region && compact(city.adminCode.toLowerCase()) === region
        )
        const pool = inState.length ? inState : matches
        return pool.reduce((best, city) =>
            city.population > best.population ? city : best
        )
    }

    // Center of a state/region: the city nearest the average position of its
    // cities, so the point stays inside the region whatever its shape
    const regionCenters = new Map()
    const regionCenter = (state, countryCode) => {
        const region = regionKey(state, countryCode)
        if (!region) return null
        const key = `${countryCode}:${region}`
        if (!regionCenters.has(key)) {
            const regionCities = byRegion.get(key)
            let center = null
            if (regionCities) {
                const mean = (index) =>
                    regionCities.reduce(
                        (sum, city) => sum + city.loc.coordinates[index],
                        0
                    ) / regionCities.length
                const [lng, lat] = [mean(0), mean(1)]
                const distance = (city) =>
                    (city.loc.coordinates[0] - lng) ** 2 +
                    (city.loc.coordinates[1] - lat) ** 2
                center = regionCities.reduce((best, city) =>
                    distance(city) < distance(best) ? city : best
                )
            }
            regionCenters.set(key, center)
        }
        return regionCenters.get(key)
    }

    // Center of a country: its centroid, else its largest city
    const countryCenter = (countryCode) => {
        const center = countryCenters[countryCode]
        if (center) return center
        const city = largestCity.get(countryCode)
        return city ? [city.loc.coordinates[1], city.loc.coordinates[0]] : null
    }

    /**
     * @param {{ city?: string, state?: string, countryCode: string | null }} location
     * @returns {{ lat: number, lng: number, approximate: boolean, adminCode?: string } | null}
     */
    return function geocode({ city, state, countryCode }) {
        if (!countryCode) return null
        for (const key of cityKeys(city)) {
            const matches = byKey.get(`${countryCode}:${key}`)
            if (matches) {
                const found = pickCity(matches, state, countryCode)
                const [lng, lat] = found.loc.coordinates
                return {
                    lat: round(lat),
                    lng: round(lng),
                    approximate: false,
                    adminCode: found.adminCode,
                }
            }
        }
        // City not found: the center of the stated state/region, if known
        const inRegion = regionCenter(state, countryCode)
        if (inRegion) {
            const [lng, lat] = inRegion.loc.coordinates
            return {
                lat: round(lat),
                lng: round(lng),
                approximate: true,
                adminCode: inRegion.adminCode,
            }
        }
        const center = countryCenter(countryCode)
        if (!center) return null
        return {
            lat: round(center[0]),
            lng: round(center[1]),
            approximate: true,
        }
    }
}
