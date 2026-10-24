import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { validateSubmission } from './lib/validate-submission.mjs'

const base = process.env.GITHUB_BASE_REF
    ? `origin/${process.env.GITHUB_BASE_REF}`
    : 'upstream/master'

const changedFiles = execFileSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`],
    { encoding: 'utf8' }
)
    .split(/\r?\n/)
    .filter((file) => file.startsWith('Submissions/') && file.length > 12)

const failures = []

for (const file of changedFiles) {
    if (!fs.existsSync(file)) continue

    let data
    try {
        data = JSON.parse(fs.readFileSync(file, 'utf8'))
    } catch (error) {
        failures.push(`${file}: invalid JSON (${error.message})`)
        continue
    }

    failures.push(...validateSubmission(data, file))
}

if (failures.length) {
    console.error('Submission validation failed:\n' + failures.join('\n'))
    process.exitCode = 1
} else {
    console.log(`Validated ${changedFiles.length} changed submission file(s).`)
}
