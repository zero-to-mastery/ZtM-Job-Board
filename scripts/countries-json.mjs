import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

// Generated module: ISO code -> [lat, lng]
const COORDINATES_FILE = 'src/util/countries/countryCoordinates.js'

/*
 * Friday, 8 April 2022
 *
 * CSV data sourced from:
 * https://www.npmjs.com/package/world-countries-centroids
 *
 * https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v0.2.0/dist/countries.csv
 *
 * Pinned version — do not change without asking the owner. Run manually:
 *   npm run countries-json
 * Output is deterministic for a given CSV (verified by running twice + diff).
 */

// CSV data is conveniently available on a CDN
const dataUrl =
    'https://cdn.jsdelivr.net/gh/gavinr/world-countries-centroids@v0.2.0/dist/countries.csv'

// Retrieve the data
const response = await fetch(dataUrl)
const body = await response.text()
const data = body.split('\n')

// Store the converted result into an array
const csvToJsonResult = []

// Store the CSV column headers a variable
const headers = data[0].split(',')

// Iterate over the remaining data rows
for (let i = 1; i < data.length - 1; i++) {
    // Empty object to store result in key value pair
    const jsonObject = {}
    // Store the current element
    const currentElementString = data[i]
    // Parse the element string to get the JSON properties
    let string = ''
    let quoteFlag = 0
    for (let character of currentElementString) {
        if (character === '"' && quoteFlag === 0) {
            quoteFlag = 1
        } else if (character === '"' && quoteFlag == 1) quoteFlag = 0
        if (character === ',' && quoteFlag === 0) character = '|'
        if (character !== '"') string += character
    }
    // Extract the JSON properties
    let jsonProperties = string.split('|')

    for (let j in headers) {
        if (jsonProperties[j].includes(',')) {
            jsonObject[headers[j]] = jsonProperties[j]
                .split(',')
                .map((item) => item.trim())
        } else jsonObject[headers[j]] = jsonProperties[j]
    }
    // Push the generated JSON object to result array
    csvToJsonResult.push(jsonObject)
}

// Sort the array by COUNTRY property — this ordering defines which row wins
// when the same ISO code appears multiple times (first name-sorted row wins).
const sortByCountry = function (a, b) {
    a = a.COUNTRY.toLowerCase()
    b = b.COUNTRY.toLowerCase()
    if (a < b) return -1
    if (a > b) return 1
    return 0
}

csvToJsonResult.sort(sortByCountry)

// The issue with using centroids is that the marker can end up in the ocean
// Supplemental data taken from the following URL is used to correct such issues
//
// https://developers.google.com/public-data/docs/canonical/countries_csv
//
// Keyed by ISO 3166-1 alpha-2 code (not by country name). Values are
// [latitude, longitude] full precision.
const countryFixes = {
    CL: [-35.675147, -71.542969], // Chile
    DK: [56.26392, 9.501785], // Denmark (was '56.26392-35.6' concatenation garbage)
    EC: [-1.831239, -78.183406], // Ecuador
    EG: [26.820553, 30.802498], // Egypt
    GR: [39.074208, 21.824312], // Greece
    ID: [-0.789275, 113.921327], // Indonesia
    MY: [4.210484, 101.975766], // Malaysia
    MU: [-20.348404, 57.552152], // Mauritius
    NZ: [-40.900557, 174.885971], // New Zealand
    NO: [60.472024, 8.468946], // Norway
    PT: [39.399872, -8.224454], // Portugal
    SE: [60.128161, 18.643501], // Sweden
    US: [37.09024, -95.712891], // United States
}

// Winner per duplicate ISO when name-sorted first-row would pick a non-main
// territory (approved: name-sort first + overrides).
const dedupOverrides = {
    ES: 'Spain', // beats 'Canarias'
}

// Rows for ISO codes that no longer exist in the upstream CSV (kept so marker
// codes/counts stay identical to the previously committed data).
const coordinateSupplements = {
    TW: [23.8171616, 120.6847786], // Taiwan (removed upstream from the CSV)
}

// Dedupe by ISO: first name-sorted row wins, unless an override picks the row
// by COUNTRY name.
const deduped = new Map()
for (const row of csvToJsonResult) {
    const iso = row.ISO
    if (deduped.has(iso)) {
        const override = dedupOverrides[iso]
        if (override !== undefined && row.COUNTRY === override) {
            deduped.set(iso, row)
        }
        continue
    }
    deduped.set(iso, row)
}

// Build ISO -> [lat, lng], applying fixes/supplements, sorted by ISO key so
// output is deterministic.
const coordinates = {}
for (const iso of [...deduped.keys()].sort()) {
    const row = deduped.get(iso)
    const fix = countryFixes[iso]
    coordinates[iso] = fix ?? [
        parseFloat(row.latitude),
        parseFloat(row.longitude),
    ]
}
for (const iso of Object.keys(coordinateSupplements).sort()) {
    if (!(iso in coordinates)) {
        coordinates[iso] = coordinateSupplements[iso]
    }
}

const entries = Object.entries(coordinates).map(
    ([iso, [lat, lng]]) => `    ${iso}: [${lat}, ${lng}],`
)

const output = `// @generated — do not edit
//
// ISO 3166-1 alpha-2 -> [latitude, longitude] (full precision).
// Regenerate with: npm run countries-json
// See docs/country-normalization.md before editing anything here.

const COUNTRY_COORDINATES = {
${entries.join('\n')}
};

export function getCountryCoordinates(code) {
    return COUNTRY_COORDINATES[code];
}
`

fs.writeFileSync(path.resolve(COORDINATES_FILE), output, { encoding: 'utf-8' })
console.log(
    `Wrote ${Object.keys(coordinates).length} entries to ${COORDINATES_FILE}`
)
