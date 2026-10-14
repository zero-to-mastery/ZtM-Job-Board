import fs from 'fs'
import path from 'path'
import cities from 'all-the-cities'
import timezones from 'countries-and-timezones'
import {
    buildPersons,
    loadSubmissions,
    writeFileAtomic,
} from './lib/aggregate.mjs'
import { createLocationEnricher, locationReport } from './lib/location.mjs'

const JSON_SOURCE_DIR = 'Submissions'
const FINAL_JSON_FILE = 'src/assets/persons.json'
// Committed country centroids, read relative to this script so the result
// does not depend on the working directory
const COUNTRIES_FILE = new URL('../src/assets/countries.json', import.meta.url)

// Prints nothing on success: the Build workflow posts any output from this
// script as a commit comment. `--report` prints map location coverage; see
// `npm run country-diagnostics` and `npm run role-diagnostics` for the rest.
try {
    const addLocation = createLocationEnricher({
        cities,
        timezones,
        countryCentroids: JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8')),
    })
    const persons = buildPersons(
        loadSubmissions(path.resolve(JSON_SOURCE_DIR))
    ).map(addLocation)
    writeFileAtomic(
        path.resolve(FINAL_JSON_FILE),
        JSON.stringify(persons, null, 2)
    )

    if (process.argv.includes('--report')) {
        const report = locationReport(persons)
        console.log(`Developers: ${report.total}`)
        console.log(`  Placed at their city:   ${report.city}`)
        console.log(`  Country center only:    ${report.countryOnly}`)
        console.log(`  No location:            ${report.none}`)
        console.log(`  With a time zone:       ${report.timezone}`)
        console.log(
            `\nCity given but not found (${report.missedCities.length}), top 25:`
        )
        report.missedCities
            .slice(0, 25)
            .forEach(([city, total]) => console.log(`  ${total} x ${city}`))
    }
} catch (e) {
    console.error(`error: ${e.message}`)
    console.error(`${FINAL_JSON_FILE} was not updated.`)
    process.exitCode = 1
}
