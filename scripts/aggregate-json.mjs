import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import lunr from 'lunr'

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

// Pre-build static search index using Lunr.js
const idx = lunr(function () {
    this.ref('id')
    this.field('name')
    this.field('jobTitle')
    this.field('city')
    this.field('state')
    this.field('country')

    finalJSON.forEach((person) => {
        this.add({
            id: person.id,
            name: person.name || '',
            jobTitle: person.jobTitle || '',
            city: person.location?.city || '',
            state: person.location?.state || '',
            country: person.location?.country || '',
        })
    })
})

fs.writeFileSync(
    path.resolve(SEARCH_INDEX_FILE),
    JSON.stringify(idx, null, 2)
)

console.log(`Aggregated ${finalJSON.length} submissions and generated static search index.`)
