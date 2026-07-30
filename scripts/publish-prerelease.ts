import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawn } from 'node:child_process'

import { verifyPrereleasePackages } from './prerelease-gate'

interface PublishManifest {
  dependencies?: Record<string, unknown>
  name?: unknown
  publishConfig?: {
    registry?: unknown
  }
  version?: unknown
}

export interface PrereleasePackage {
  dependencies: Record<string, unknown>
  directory: string
  id: string
  manifestPath: string
  name: string
  registry: string
  version: string
}

interface PublicationAdapters {
  isTagged?: (
    packageToPublish: PrereleasePackage,
    options?: { fresh?: boolean },
  ) => Promise<boolean>
  isPublished?: (
    packageToPublish: PrereleasePackage,
    options?: { fresh?: boolean },
  ) => Promise<boolean>
  publish?: (packageToPublish: PrereleasePackage) => Promise<void>
  verificationAttempts?: number
  verificationDelayMs?: number
}

interface PublicationResult {
  published: string[]
  skipped: string[]
}

const officialRegistry = 'https://registry.npmjs.org/'

function resolveRegistry(registry: unknown): string {
  const resolvedRegistry = registry ?? officialRegistry
  if (typeof resolvedRegistry !== 'string') {
    throw new Error('publishConfig.registry must be a string.')
  }
  const registryUrl = new URL(resolvedRegistry)
  if (registryUrl.href !== officialRegistry) {
    throw new Error(
      `Prereleases must publish through the official npm registry, not ${registryUrl.href}.`,
    )
  }
  return registryUrl.href
}

async function readPackage(
  repositoryRoot: string,
  manifestPath: string,
): Promise<PrereleasePackage> {
  const absoluteManifestPath = resolve(repositoryRoot, manifestPath)
  const manifest = JSON.parse(
    await readFile(absoluteManifestPath, 'utf8'),
  ) as PublishManifest
  if (typeof manifest.name !== 'string' || manifest.name.length === 0) {
    throw new Error(`${manifestPath} must declare a package name.`)
  }
  if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
    throw new Error(`${manifest.name} must declare a package version.`)
  }

  return {
    dependencies: manifest.dependencies ?? {},
    directory: dirname(absoluteManifestPath),
    id: `${manifest.name}@${manifest.version}`,
    manifestPath,
    name: manifest.name,
    registry: resolveRegistry(manifest.publishConfig?.registry),
    version: manifest.version,
  }
}

async function lookupPublishedVersion(
  packageToPublish: PrereleasePackage,
  options: { fresh?: boolean } = {},
): Promise<boolean> {
  const endpoint = new URL(
    `${encodeURIComponent(packageToPublish.name)}/${encodeURIComponent(packageToPublish.version)}`,
    packageToPublish.registry,
  )
  if (options.fresh) {
    endpoint.searchParams.set('release-check', `${Date.now()}`)
  }
  const response = await fetch(endpoint, {
    headers: options.fresh
      ? { accept: 'application/json', 'cache-control': 'no-cache' }
      : { accept: 'application/json' },
  })
  if (response.status === 404) {
    return false
  }
  if (!response.ok) {
    throw new Error(
      `npm registry returned ${response.status} while checking ${packageToPublish.id}.`,
    )
  }
  return true
}

export async function lookupTaggedVersion(
  packageToPublish: PrereleasePackage,
  options: { fresh?: boolean } = {},
  registryFetch: typeof fetch = fetch,
): Promise<boolean> {
  const endpoint = new URL(
    encodeURIComponent(packageToPublish.name) + '/next',
    packageToPublish.registry,
  )
  if (options.fresh) {
    endpoint.searchParams.set('release-check', String(Date.now()))
  }
  const response = await registryFetch(endpoint, {
    headers: options.fresh
      ? { accept: 'application/json', 'cache-control': 'no-cache' }
      : { accept: 'application/json' },
  })
  if (response.status === 404) return false
  if (!response.ok) {
    throw new Error(
      'npm registry returned ' +
        String(response.status) +
        ' while checking the next tag for ' +
        packageToPublish.id +
        '.',
    )
  }
  const metadata = (await response.json()) as { version?: unknown }
  return metadata.version === packageToPublish.version
}

async function runNpmPublish(
  packageToPublish: PrereleasePackage,
): Promise<void> {
  const executable = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const arguments_ = [
    'publish',
    '--tag',
    'next',
    '--access',
    'public',
    '--provenance',
    '--registry',
    packageToPublish.registry,
  ]

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(executable, arguments_, {
      cwd: packageToPublish.directory,
      env: { ...process.env, NPM_CONFIG_PROVENANCE: 'true' },
      stdio: 'inherit',
    })
    child.once('error', rejectPromise)
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise()
        return
      }
      rejectPromise(
        new Error(
          `npm publish failed for ${packageToPublish.id} (${signal ?? `exit ${String(code)}`}).`,
        ),
      )
    })
  })
}

export async function publishPrereleasePackages(
  repositoryRoot: string,
  manifestPaths: readonly string[],
  adapters: PublicationAdapters = {},
): Promise<PublicationResult> {
  await verifyPrereleasePackages(repositoryRoot, manifestPaths)
  const packages = await Promise.all(
    manifestPaths.map((manifestPath) =>
      readPackage(repositoryRoot, manifestPath),
    ),
  )
  const isVersionPublished = adapters.isPublished ?? lookupPublishedVersion
  const useCombinedInjectedLookup =
    adapters.isPublished !== undefined && adapters.isTagged === undefined
  const isTagged = adapters.isTagged ?? lookupTaggedVersion
  const publish = adapters.publish ?? runNpmPublish
  const verificationAttempts = adapters.verificationAttempts ?? 12
  const verificationDelayMs = adapters.verificationDelayMs ?? 5_000
  if (
    !Number.isInteger(verificationAttempts) ||
    verificationAttempts < 1 ||
    !Number.isFinite(verificationDelayMs) ||
    verificationDelayMs < 0
  ) {
    throw new Error('Publication verification settings must be finite and positive.')
  }
  const result: PublicationResult = { published: [], skipped: [] }
  const availableVersions = new Set<string>()
  const packagesById = new Map(packages.map((package_) => [package_.id, package_]))

  const waitBeforeRetry = async (): Promise<void> => {
    await new Promise<void>((resolvePromise) => {
      setTimeout(resolvePromise, verificationDelayMs)
    })
  }
  const retryTransientLookup = async (
    lookup: () => Promise<boolean>,
  ): Promise<boolean> => {
    let lastError: unknown
    for (let attempt = 0; attempt < verificationAttempts; attempt += 1) {
      try {
        return await lookup()
      } catch (error: unknown) {
        lastError = error
      }
      if (attempt < verificationAttempts - 1) {
        await waitBeforeRetry()
      }
    }
    throw lastError
  }

  const publicationComplete = async (
    packageToPublish: PrereleasePackage,
    options: { fresh?: boolean } = {},
  ): Promise<boolean> => {
    if (!(await isVersionPublished(packageToPublish, options))) return false
    return (
      useCombinedInjectedLookup ||
      (await isTagged(packageToPublish, options))
    )
  }
  const waitForPublication = async (
    packageToPublish: PrereleasePackage,
  ): Promise<boolean> => {
    for (let attempt = 0; attempt < verificationAttempts; attempt += 1) {
      try {
        if (await publicationComplete(packageToPublish, { fresh: true })) {
          return true
        }
      } catch {
        // A bounded retry handles transient registry and network failures.
      }
      if (attempt < verificationAttempts - 1) {
        await waitBeforeRetry()
      }
    }
    return false
  }

  for (const packageToPublish of packages) {
    const audioCoreVersion = packageToPublish.dependencies['@trsoliu/audio-core']
    if (audioCoreVersion !== undefined) {
      if (
        typeof audioCoreVersion !== 'string' ||
        !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-beta\.(0|[1-9]\d*))?$/.test(
          audioCoreVersion,
        )
      ) {
        throw new Error(
          `${packageToPublish.name} must use an exact @trsoliu/audio-core version before prerelease publication.`,
        )
      }
      const audioCoreId = `@trsoliu/audio-core@${audioCoreVersion}`
      if (!availableVersions.has(audioCoreId)) {
        const audioCorePackage = packagesById.get(audioCoreId) ?? {
          dependencies: {},
          directory: repositoryRoot,
          id: audioCoreId,
          manifestPath: `dependency of ${packageToPublish.manifestPath}`,
          name: '@trsoliu/audio-core',
          registry: officialRegistry,
          version: audioCoreVersion,
        }
        if (
          !(await retryTransientLookup(() =>
            isVersionPublished(audioCorePackage, { fresh: true }),
          ))
        ) {
          throw new Error(
            `${audioCoreId} must be published before ${packageToPublish.id}.`,
          )
        }
        availableVersions.add(audioCoreId)
      }
    }

    if (
      await retryTransientLookup(() => isVersionPublished(packageToPublish))
    ) {
      if (
        !useCombinedInjectedLookup &&
        !(await waitForPublication(packageToPublish))
      ) {
        throw new Error(
          packageToPublish.id +
            ' exists, but npm next does not resolve to it. Refusing to republish an immutable version.',
        )
      }
      result.skipped.push(packageToPublish.id)
      availableVersions.add(packageToPublish.id)
      continue
    }
    try {
      await publish(packageToPublish)
    } catch (error: unknown) {
      if (await waitForPublication(packageToPublish)) {
        result.skipped.push(packageToPublish.id)
        availableVersions.add(packageToPublish.id)
        continue
      }
      throw error
    }
    if (!(await waitForPublication(packageToPublish))) {
      throw new Error(
        packageToPublish.id +
          ' was accepted by npm, but the exact version and next tag were not both visible after verification.',
      )
    }
    result.published.push(packageToPublish.id)
    availableVersions.add(packageToPublish.id)
  }

  return result
}

async function main(): Promise<void> {
  const result = await publishPrereleasePackages(
    process.cwd(),
    process.argv.slice(2),
  )
  if (result.published.length > 0) {
    console.log(`Published to next: ${result.published.join(', ')}`)
  }
  if (result.skipped.length > 0) {
    console.log(`Already published: ${result.skipped.join(', ')}`)
  }
}

const entryPath = process.argv[1]
if (entryPath && import.meta.url === pathToFileURL(resolve(entryPath)).href) {
  void main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
