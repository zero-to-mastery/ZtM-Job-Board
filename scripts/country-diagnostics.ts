// Reports submission country values that could not be fully resolved.
//
//   npm run country-diagnostics                       # print JSON report
//   npm run country-diagnostics -- --out report.json  # write it to a file
//
// See docs/country-normalization.md.

import fs from 'fs'
import path from 'path'
import { loadSubmissions, buildCountryDiagnostics } from './lib/aggregate.ts'

const JSON_SOURCE_DIR = 'Submissions'

const outIndex = process.argv.indexOf('--out')
const outFile = outIndex !== -1 ? process.argv[outIndex + 1] : null

try {
    const report = buildCountryDiagnostics(
        loadSubmissions(path.resolve(JSON_SOURCE_DIR))
    )
    const json = JSON.stringify(report, null, 2) + '\n'

    if (outFile) {
        fs.writeFileSync(path.resolve(outFile), json, 'utf-8')
        const { byStatus } = report.summary
        console.log(
            `Wrote ${outFile}: ${byStatus.partial} partial, ` +
                `${byStatus.ambiguous} ambiguous, ${byStatus.unresolved} unresolved`
        )
    } else {
        // Allow piping into tools that close early, e.g. `| head`
        process.stdout.on('error', (e: NodeJS.ErrnoException) => {
            if (e.code !== 'EPIPE') throw e
        })
        process.stdout.write(json)
    }
} catch (e) {
    console.error(`error: ${e instanceof Error ? e.message : String(e)}`)
    process.exitCode = 1
}
