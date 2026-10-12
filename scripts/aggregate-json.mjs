import path from 'path'
import { aggregate } from './lib/aggregate.mjs'

const JSON_SOURCE_DIR = 'Submissions'
const FINAL_JSON_FILE = 'src/assets/persons.json'

// Prints nothing on success: the Build workflow posts any output from this
// script as a commit comment.
try {
    aggregate({
        sourceDir: path.resolve(JSON_SOURCE_DIR),
        outputFile: path.resolve(FINAL_JSON_FILE),
    })
} catch (e) {
    console.error(`error: ${e.message}`)
    console.error(`${FINAL_JSON_FILE} was not updated.`)
    process.exitCode = 1
}
