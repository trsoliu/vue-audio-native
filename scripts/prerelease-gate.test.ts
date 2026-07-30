import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { verifyPrereleasePackages } from './prerelease-gate'

const temporaryDirectories: string[] = []

async function createFixture(options: {
  adapterVersion?: string
  coreDependency?: string
  coreVersion?: string
} = {}): Promise<{ manifestPaths: string[]; repositoryRoot: string }> {
  const repositoryRoot = await mkdtemp(join(tmpdir(), 'audio-prerelease-'))
  temporaryDirectories.push(repositoryRoot)
  await mkdir(join(repositoryRoot, '.changeset'), { recursive: true })
  await mkdir(join(repositoryRoot, 'packages/core'), { recursive: true })
  await mkdir(join(repositoryRoot, 'packages/adapter'), { recursive: true })

  const coreVersion = options.coreVersion ?? '1.0.0-beta.2'
  const adapterVersion = options.adapterVersion ?? '1.0.0-beta.3'
  await writeFile(
    join(repositoryRoot, '.changeset/pre.json'),
    JSON.stringify({ mode: 'pre', tag: 'beta' }),
  )
  await writeFile(
    join(repositoryRoot, 'packages/core/package.json'),
    JSON.stringify({ name: '@trsoliu/audio-core', version: coreVersion }),
  )
  await writeFile(
    join(repositoryRoot, 'packages/adapter/package.json'),
    JSON.stringify({
      dependencies: {
        '@trsoliu/audio-core': options.coreDependency ?? coreVersion,
      },
      name: 'audio-adapter',
      version: adapterVersion,
    }),
  )

  return {
    manifestPaths: [
      'packages/core/package.json',
      'packages/adapter/package.json',
    ],
    repositoryRoot,
  }
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

describe('prerelease publication gate', () => {
  it('accepts aligned beta manifests in Changesets pre mode', async () => {
    const fixture = await createFixture()

    await expect(
      verifyPrereleasePackages(
        fixture.repositoryRoot,
        fixture.manifestPaths,
      ),
    ).resolves.toBeUndefined()
  })

  it('rejects a stable package version', async () => {
    const fixture = await createFixture({ adapterVersion: '1.0.0' })

    await expect(
      verifyPrereleasePackages(
        fixture.repositoryRoot,
        fixture.manifestPaths,
      ),
    ).rejects.toThrow('must use a beta prerelease version')
  })

  it('rejects an unaligned exact internal dependency', async () => {
    const fixture = await createFixture({
      coreDependency: '1.0.0-beta.1',
    })

    await expect(
      verifyPrereleasePackages(
        fixture.repositoryRoot,
        fixture.manifestPaths,
      ),
    ).rejects.toThrow(
      'must depend on @trsoliu/audio-core@1.0.0-beta.2',
    )
  })
})
