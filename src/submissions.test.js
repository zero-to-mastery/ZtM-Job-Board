import fs from 'fs'
import { test } from 'vitest'
import path from 'path'
import { validateSkills } from './util/skills'

test('Submission files must be valid JSON with valid optional skills', () => {
    const JSON_SOURCE_DIR = 'Submissions'
    const submissionFiles = fs.readdirSync(path.resolve(JSON_SOURCE_DIR))

    submissionFiles.forEach((file) => {
        const fileContent = fs.readFileSync(
            path.resolve(JSON_SOURCE_DIR, file),
            {
                encoding: 'utf-8',
            }
        )
        const profile = JSON.parse(fileContent)
        validateSkills(profile.skills, file)
    })
})
