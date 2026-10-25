import path from 'path'
import {
    aggregate,
    collectUnknownCountryValues,
    formatCountryWarning,
    writeFileAtomic,
} from './lib/aggregate.mjs'
import { buildSearchIndex } from './lib/search-index.mjs'
const JSON_SOURCE_DIR = 'Submissions'
const FINAL_JSON_FILE = 'src/assets/persons.json'
const SEARCH_INDEX_FILE = 'src/assets/search-index.json'
// Generate the profile data and search index from the same submissions.
try {
    const { submissions } = aggregate({
        sourceDir: path.resolve(JSON_SOURCE_DIR),
        outputFile: path.resolve(FINAL_JSON_FILE),
    })
    const persons = JSON.parse(
        await import('node:fs/promises').then((fs) =>
            fs.readFile(path.resolve(FINAL_JSON_FILE), 'utf-8')
        )
    )
    const searchIndex = buildSearchIndex(persons)
    writeFileAtomic(
        path.resolve(SEARCH_INDEX_FILE),
        JSON.stringify(searchIndex, null, 2)
    )
    const warning = formatCountryWarning(
        collectUnknownCountryValues(submissions)
    )
    if (warning !== '') console.log(warning)
} catch (e) {
    console.error(`error: ${e.message}`)
    console.error(
        `${FINAL_JSON_FILE} or ${SEARCH_INDEX_FILE} may not be updated.`
    )
    process.exitCode = 1
}
