import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const JSON_SOURCE_DIR = 'Submissions'
const FINAL_JSON_FILE = 'src/assets/persons.json'
const SEARCH_INDEX_FILE = 'src/assets/search-index.json'
let dirContent = null
const finalJSON = []

try {
    dirContent = fs.readdirSync(path.resolve(JSON_SOURCE_DIR))
} catch (e) {
    console.log(`error while reading "${JSON_SOURCE_DIR}": ` + e.message)
}

function tokenize(text) {
    if (!text) return []
    return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/gi, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 0)
}

try {
    for (let i = 0; i < dirContent.length; i++) {
        if (!dirContent[i].endsWith('.json')) continue

        const jsonContent__raw = fs.readFileSync(
            path.resolve(JSON_SOURCE_DIR, dirContent[i]),
            { encoding: 'utf-8' }
        )

        const jsonContent__parsed = JSON.parse(jsonContent__raw)
        jsonContent__parsed.id = jsonContent__parsed.id || crypto.randomUUID()
        finalJSON.push(jsonContent__parsed)
    }
} catch (e) {
    console.log(`error: ` + e.message)
}

fs.writeFileSync(
    path.resolve(FINAL_JSON_FILE),
    JSON.stringify(finalJSON, null, 2)
)

// Pre-build static inverted search index
const invertedIndex = {}

finalJSON.forEach((person) => {
    const fields = [
        person.name,
        person.jobTitle,
        person.location?.city,
        person.location?.state,
        person.location?.country,
    ]

    const tokens = new Set()
    fields.forEach((field) => {
        tokenize(field).forEach((t) => tokens.add(t))
    })

    tokens.forEach((t) => {
        if (!invertedIndex[t]) {
            invertedIndex[t] = []
        }
        invertedIndex[t].push(person.id)
    })
})

fs.writeFileSync(
    path.resolve(SEARCH_INDEX_FILE),
    JSON.stringify(invertedIndex, null, 2)
)

console.log(
    `Aggregated ${finalJSON.length} submissions and generated static search index.`
)
