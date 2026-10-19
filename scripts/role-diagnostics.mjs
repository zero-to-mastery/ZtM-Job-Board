// Reports how submission job titles were classified, and lists every title
// that could not be fully classified.
//
//   npm run role-diagnostics                       # print JSON report
//   npm run role-diagnostics -- --out report.json  # write it to a file
//
// See docs/role-normalization.md.

import fs from 'fs'
import path from 'path'
import { loadSubmissions, buildRoleDiagnostics } from './lib/aggregate.mjs'

const JSON_SOURCE_DIR = 'Submissions'

const outIndex = process.argv.indexOf('--out')
const outFile = outIndex !== -1 ? process.argv[outIndex + 1] : null

try {
    const report = buildRoleDiagnostics(
        loadSubmissions(path.resolve(JSON_SOURCE_DIR))
    )
    const json = JSON.stringify(report, null, 2) + '\n'

    if (outFile) {
        fs.writeFileSync(path.resolve(outFile), json, 'utf-8')
        const { byStatus, multiRoleProfiles } = report.summary
        console.log(
            `Wrote ${outFile}: ${byStatus.unclassified} unclassified, ` +
                `${byStatus.partial} partial, ${byStatus.empty} empty, ` +
                `${multiRoleProfiles} with multiple roles`
        )
    } else {
        // Allow piping into tools that close early, e.g. `| head`
        process.stdout.on('error', (e) => {
            if (e.code !== 'EPIPE') throw e
        })
        process.stdout.write(json)
    }
} catch (e) {
    console.error(`error: ${e.message}`)
    process.exitCode = 1
}
