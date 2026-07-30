import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const requiredDeviceEnvironments = [
  'iOS 15.6+ WKWebView',
  'Android 8+ WebView 96+',
  'HarmonyOS 3/4 WebView',
  'HarmonyOS NEXT ArkWeb',
] as const

export type StableReleaseBasis = 'device-evidence' | 'maintainer-assessment'

const supportedAssessmentDeviceStatuses = new Set([
  '通过',
  '未执行（维护者接受剩余风险）',
])

export interface StableReleaseEvaluation {
  basis: StableReleaseBasis | null
  blockers: string[]
}

interface PackageManifest {
  name?: unknown
  version?: unknown
}

interface AssessedVersions {
  packageVersions: ReadonlyMap<string, string> | null
  sharedVersion: string | null
}

const stableVersionPattern = /^\d+\.\d+\.\d+$/

function parseAssessedVersions(
  value: string | undefined,
): AssessedVersions | null {
  if (!value) return null
  if (stableVersionPattern.test(value)) {
    return { packageVersions: null, sharedVersion: value }
  }

  const packageVersions = new Map<string, string>()
  for (const entry of value.split(',')) {
    const normalizedEntry = entry.trim()
    const versionSeparator = normalizedEntry.lastIndexOf('@')
    const packageName = normalizedEntry.slice(0, versionSeparator)
    const version = normalizedEntry.slice(versionSeparator + 1)
    if (
      versionSeparator <= 0 ||
      !packageName ||
      packageName.includes(' ') ||
      !stableVersionPattern.test(version) ||
      packageVersions.has(packageName)
    ) {
      return null
    }
    packageVersions.set(packageName, version)
  }

  return packageVersions.size > 0
    ? { packageVersions, sharedVersion: null }
    : null
}

function tableRows(markdown: string): Map<string, string> {
  const rows = new Map<string, string>()

  for (const line of markdown.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) continue
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())
    if (cells.length < 2) continue
    const key = cells[0]
    const value = cells.at(-1)
    if (key && value) rows.set(key, value)
  }

  return rows
}

function isIsoDate(value: string | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value)
}

function assessmentBlockers(rows: Map<string, string>): string[] {
  const blockers: string[] = []
  const maintainer = rows.get('维护者授权')
  const decisionDate = rows.get('决策日期')
  const releaseVersion = rows.get('适用版本')

  if (
    !maintainer ||
    !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(maintainer)
  ) {
    blockers.push('维护者授权')
  }
  if (!isIsoDate(decisionDate)) {
    blockers.push('决策日期')
  }
  if (!parseAssessedVersions(releaseVersion)) {
    blockers.push('适用版本')
  }
  if (rows.get('自动化评估') !== '通过') blockers.push('自动化评估')
  if (rows.get('剩余真机风险') !== '已接受') blockers.push('剩余真机风险')

  return blockers
}

export function evaluateStableRelease(
  markdown: string,
): StableReleaseEvaluation {
  const rows = tableRows(markdown)
  const missingDeviceRows = requiredDeviceEnvironments.filter(
    (environment) => !rows.has(environment),
  )
  const deviceBlockers = requiredDeviceEnvironments.filter(
    (environment) => rows.get(environment) !== '通过',
  )
  if (deviceBlockers.length === 0) {
    return { basis: 'device-evidence', blockers: [] }
  }

  const decisionBlockers = assessmentBlockers(rows)
  const unsupportedDeviceRows = requiredDeviceEnvironments.filter(
    (environment) => {
      const status = rows.get(environment)
      return (
        status !== undefined && !supportedAssessmentDeviceStatuses.has(status)
      )
    },
  )
  if (
    decisionBlockers.length === 0 &&
    missingDeviceRows.length === 0 &&
    unsupportedDeviceRows.length === 0
  ) {
    return { basis: 'maintainer-assessment', blockers: [] }
  }

  return {
    basis: null,
    blockers: [...deviceBlockers, ...decisionBlockers],
  }
}

async function verifyManifestVersions(
  assessedVersionValue: string | undefined,
  manifestPaths: readonly string[],
): Promise<void> {
  const assessedVersions = assessedVersionValue
    ? parseAssessedVersions(assessedVersionValue)
    : null
  for (const manifestPath of manifestPaths) {
    const absolutePath = resolve(process.cwd(), manifestPath)
    const manifest = JSON.parse(
      await readFile(absolutePath, 'utf8'),
    ) as PackageManifest
    const name =
      typeof manifest.name === 'string' ? manifest.name : manifestPath
    const version =
      typeof manifest.version === 'string' ? manifest.version : undefined

    if (!version || !stableVersionPattern.test(version)) {
      throw new Error(`${name} must be a stable version before publication.`)
    }
    const expectedVersion = assessedVersions
      ? (assessedVersions.sharedVersion ??
        assessedVersions.packageVersions?.get(name))
      : undefined
    if (assessedVersions && version !== expectedVersion) {
      throw new Error(
        `${name}@${version} is not covered by stable assessment ${assessedVersionValue}.`,
      )
    }
  }
}

export async function verifyStableRelease(
  filePath = 'docs/device-smoke.md',
  manifestPaths: readonly string[] = [],
): Promise<StableReleaseBasis> {
  const absolutePath = resolve(process.cwd(), filePath)
  const markdown = await readFile(absolutePath, 'utf8')
  const evaluation = evaluateStableRelease(markdown)
  if (!evaluation.basis) {
    throw new Error(
      `Stable release blocked by missing evidence: ${evaluation.blockers.join(', ')}`,
    )
  }

  if (manifestPaths.length === 0) {
    throw new Error(
      'Stable release verification requires at least one package manifest.',
    )
  }
  const expectedVersion =
    evaluation.basis === 'maintainer-assessment'
      ? tableRows(markdown).get('适用版本')
      : undefined
  if (evaluation.basis === 'maintainer-assessment' && !expectedVersion) {
    throw new Error('Stable assessment is missing 适用版本.')
  }
  await verifyManifestVersions(expectedVersion, manifestPaths)

  const label =
    evaluation.basis === 'device-evidence'
      ? 'real-device evidence'
      : 'maintainer assessment'
  console.log(`Stable release gate passed via ${label}.`)
  return evaluation.basis
}

const invokedModule = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : ''
if (import.meta.url === invokedModule) {
  void verifyStableRelease(process.argv[2], process.argv.slice(3)).catch(
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : error)
      process.exitCode = 1
    },
  )
}
