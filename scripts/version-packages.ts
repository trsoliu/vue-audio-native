import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const installSectionStart = '<!-- release-install:start -->'
const installSectionEnd = '<!-- release-install:end -->'
const releaseVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const stableVersionPattern = /^\d+\.\d+\.\d+$/

interface PackageManifest {
  name?: unknown
  version?: unknown
}

interface PackageReadmeDefinition {
  manifestPath: string
  readmePath: string
}

const packageReadmes: readonly PackageReadmeDefinition[] = [
  {
    manifestPath: 'packages/audio-core/package.json',
    readmePath: 'packages/audio-core/README.md',
  },
  {
    manifestPath: 'packages/vue-audio-native/package.json',
    readmePath: 'packages/vue-audio-native/README.md',
  },
]

function installSection(packageName: string, version: string): string {
  if (!releaseVersionPattern.test(version)) {
    throw new Error(`Unsupported package release version: ${version}`)
  }
  if (
    packageName !== '@trsoliu/audio-core' &&
    packageName !== 'vue-audio-native'
  ) {
    throw new Error(`Unsupported package README: ${packageName}`)
  }

  const stable = stableVersionPattern.test(version)
  const installTarget = stable ? `${packageName}@${version}` : `${packageName}@next`
  const legacyInstall =
    packageName === 'vue-audio-native'
      ? '\n\n# Vue 2 compatibility line\npnpm add vue-audio-native@legacy'
      : ''
  const guidance = stable
    ? `Use \`${packageName}@next\` only when intentionally validating a prerelease.`
    : 'The 1.0 line is currently a prerelease. Use the `next` tag while validating it.'

  return `${installSectionStart}

\`\`\`bash
${packageName === 'vue-audio-native' ? '# Vue 3\n' : ''}pnpm add ${installTarget}${legacyInstall}
\`\`\`

${guidance}

${installSectionEnd}`
}

export function updateReleaseReadme(
  contents: string,
  packageName: string,
  version: string,
): string {
  const startIndex = contents.indexOf(installSectionStart)
  const endIndex = contents.indexOf(installSectionEnd)
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(
      'Package README is missing its managed release install section.',
    )
  }

  return (
    contents.slice(0, startIndex) +
    installSection(packageName, version) +
    contents.slice(endIndex + installSectionEnd.length)
  )
}

async function runPnpm(arguments_: readonly string[]): Promise<void> {
  const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, [...arguments_], { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise()
        return
      }
      reject(
        new Error(
          `pnpm ${arguments_.join(' ')} failed${signal ? ` with signal ${signal}` : ` with exit code ${code ?? 'unknown'}`}.`,
        ),
      )
    })
  })
}

export async function versionPackages(
  definitions: readonly PackageReadmeDefinition[] = packageReadmes,
): Promise<void> {
  await runPnpm(['exec', 'changeset', 'version'])

  for (const definition of definitions) {
    const manifest = JSON.parse(
      await readFile(resolve(process.cwd(), definition.manifestPath), 'utf8'),
    ) as PackageManifest
    if (
      typeof manifest.name !== 'string' ||
      typeof manifest.version !== 'string'
    ) {
      throw new Error(
        `${definition.manifestPath} must contain a package name and version.`,
      )
    }

    const absoluteReadmePath = resolve(process.cwd(), definition.readmePath)
    const currentReadme = await readFile(absoluteReadmePath, 'utf8')
    const nextReadme = updateReleaseReadme(
      currentReadme,
      manifest.name,
      manifest.version,
    )
    if (nextReadme !== currentReadme) {
      await writeFile(absoluteReadmePath, nextReadme)
    }
  }

  await runPnpm(['install', '--lockfile-only', '--ignore-scripts'])
}

const invokedModule = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null

if (invokedModule === import.meta.url) {
  void versionPackages().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
