import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

interface PackageManifest {
  dependencies?: Record<string, string>
  name?: unknown
  optionalDependencies?: Record<string, string>
  private?: unknown
  version?: unknown
}

interface PrereleaseState {
  mode?: unknown
  tag?: unknown
}

interface VerifiedManifest {
  dependencies: Record<string, string> | undefined
  name: string
  optionalDependencies: Record<string, string> | undefined
  version: string
}

const betaVersionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-beta\.(0|[1-9]\d*)$/

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

export async function verifyPrereleasePackages(
  repositoryRoot: string,
  manifestPaths: readonly string[],
): Promise<void> {
  if (manifestPaths.length === 0) {
    throw new Error('At least one publishable package manifest is required.')
  }

  const prereleaseState = await readJson<PrereleaseState>(
    resolve(repositoryRoot, '.changeset/pre.json'),
  )
  if (prereleaseState.mode !== 'pre' || prereleaseState.tag !== 'beta') {
    throw new Error(
      'Changesets must be in beta pre mode before publishing to the next dist-tag.',
    )
  }

  const manifests = await Promise.all(
    manifestPaths.map(async (manifestPath): Promise<VerifiedManifest> => {
      const manifest = await readJson<PackageManifest>(
        resolve(repositoryRoot, manifestPath),
      )
      if (manifest.private === true) {
        throw new Error(`${manifestPath} is private and cannot be published.`)
      }
      if (typeof manifest.name !== 'string' || manifest.name.length === 0) {
        throw new Error(`${manifestPath} must declare a package name.`)
      }
      if (
        typeof manifest.version !== 'string' ||
        !betaVersionPattern.test(manifest.version)
      ) {
        throw new Error(
          `${manifest.name} must use a beta prerelease version before next publication.`,
        )
      }

      return {
        dependencies: manifest.dependencies,
        name: manifest.name,
        optionalDependencies: manifest.optionalDependencies,
        version: manifest.version,
      }
    }),
  )

  const manifestsByName = new Map(
    manifests.map((manifest) => [manifest.name, manifest]),
  )
  if (manifestsByName.size !== manifests.length) {
    throw new Error('Publishable package names must be unique.')
  }

  for (const manifest of manifests) {
    for (const dependencies of [
      manifest.dependencies,
      manifest.optionalDependencies,
    ]) {
      for (const [dependencyName, dependencyVersion] of Object.entries(
        dependencies ?? {},
      )) {
        const internalManifest = manifestsByName.get(dependencyName)
        if (
          internalManifest &&
          dependencyVersion !== internalManifest.version
        ) {
          throw new Error(
            `${manifest.name} must depend on ${dependencyName}@${internalManifest.version} before prerelease publication.`,
          )
        }
      }
    }
  }
}

async function main(): Promise<void> {
  const manifestPaths = process.argv.slice(2)
  await verifyPrereleasePackages(process.cwd(), manifestPaths)
  console.log(
    `Verified ${manifestPaths.length} beta package manifest(s) for the next dist-tag.`,
  )
}

const entryPath = process.argv[1]
if (
  entryPath &&
  import.meta.url === pathToFileURL(resolve(entryPath)).href
) {
  void main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
