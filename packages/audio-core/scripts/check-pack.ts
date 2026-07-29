import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { gzipSync } from 'node:zlib'

const execute = promisify(execFile)
const packageRoot = resolve(import.meta.dirname, '..')
const { stdout } = await execute('npm', ['pack', '--dry-run', '--json'], {
  cwd: packageRoot,
})
interface PackReport {
  files: Array<{ path: string }>
}

const reports = JSON.parse(stdout) as PackReport[] | Record<string, PackReport>
const report = Array.isArray(reports) ? reports[0] : Object.values(reports)[0]
assert(report, 'npm pack did not return a package report')

const packedPaths = report.files.map((file) => file.path)
const forbiddenPaths = packedPaths.filter((path) =>
  /(^|\/)(apps?|src|tests?|fixtures?|coverage|node_modules)(\/|$)/i.test(path),
)
assert.deepEqual(forbiddenPaths, [], `Unexpected packed files: ${forbiddenPaths.join(', ')}`)

const esm = await readFile(resolve(packageRoot, 'dist/index.js'))
assert(gzipSync(esm).byteLength <= 8 * 1024, 'Audio core exceeds 8 KB gzip')

for (const path of packedPaths.filter((path) => /\.(?:[cm]?js|map|json|ts)$/.test(path))) {
  const content = await readFile(resolve(packageRoot, path), 'utf8')
  assert(!content.includes(packageRoot), `Absolute package path leaked into ${path}`)
  assert(!content.includes('/Users/'), `Local user path leaked into ${path}`)
}

console.log(`Validated ${packedPaths.length} core package files within the 8 KB budget.`)
