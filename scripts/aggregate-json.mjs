import path from 'path'
import {
    aggregate,
    collectUnknownCountryValues,
    formatCountryWarning,
    loadSubmissions,
} from './lib/aggregate.mjs'

const JSON_SOURCE_DIR = 'Submissions'
const FINAL_JSON_FILE = 'src/assets/persons.json'

// Prints nothing on success apart from the warning for unrecognised country
// values (unknown issues only), because the Build workflow posts any output
// from this script as a commit comment.
try {
    aggregate({
        sourceDir: path.resolve(JSON_SOURCE_DIR),
        outputFile: path.resolve(FINAL_JSON_FILE),
    })
    const warning = formatCountryWarning(
        collectUnknownCountryValues(
            loadSubmissions(path.resolve(JSON_SOURCE_DIR))
        )
    )
    if (warning !== '') console.log(warning)
} catch (e) {
    console.error(`error: ${e.message}`)
    console.error(`${FINAL_JSON_FILE} was not updated.`)
    process.exitCode = 1
}
