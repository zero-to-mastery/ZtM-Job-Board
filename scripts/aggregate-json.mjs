import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { validateSkills } from '../src/util/skills.js'

const JSON_SOURCE_DIR = 'Submissions'
const FINAL_JSON_FILE = 'src/assets/persons.json'
const dirContent = fs.readdirSync(path.resolve(JSON_SOURCE_DIR))
const finalJSON = []

for (const file of dirContent) {
    const raw = fs.readFileSync(path.resolve(JSON_SOURCE_DIR, file), 'utf-8')
    let profile
    try {
        profile = JSON.parse(raw)
    } catch (error) {
        throw new Error(`${file}: Invalid JSON: ${error.message}`, {
            cause: error,
        })
    }
    validateSkills(profile.skills, file)
    profile.id = crypto.randomUUID()
    finalJSON.push(profile)
}

fs.writeFileSync(
    path.resolve(FINAL_JSON_FILE),
    JSON.stringify(finalJSON, null, 2)
)
