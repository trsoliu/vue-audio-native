import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  lookupTaggedVersion,
  publishPrereleasePackages,
} from './publish-prerelease'

const temporaryDirectories: string[] = []

async function createFixture(): Promise<{
  manifestPaths: string[]
  repositoryRoot: string
}> {
  const repositoryRoot = await mkdtemp(join(tmpdir(), 'audio-publish-next-'))
  temporaryDirectories.push(repositoryRoot)
  await mkdir(join(repositoryRoot, '.changeset'), { recursive: true })
  await mkdir(join(repositoryRoot, 'packages/core'), { recursive: true })
  await mkdir(join(repositoryRoot, 'packages/adapter'), { recursive: true })
  await writeFile(
    join(repositoryRoot, '.changeset/pre.json'),
    JSON.stringify({ mode: 'pre', tag: 'beta' }),
  )
  await writeFile(
    join(repositoryRoot, 'packages/core/package.json'),
    JSON.stringify({
      name: '@trsoliu/audio-core',
      publishConfig: { registry: 'https://registry.npmjs.org/' },
      version: '1.0.0-beta.2',
    }),
  )
  await writeFile(
    join(repositoryRoot, 'packages/adapter/package.json'),
    JSON.stringify({
      dependencies: { '@trsoliu/audio-core': '1.0.0-beta.2' },
      name: 'audio-adapter',
      publishConfig: { registry: 'https://registry.npmjs.org/' },
      version: '1.0.0-beta.3',
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

describe('next prerelease publisher', () => {
  it('accepts an existing version only when next resolves to that exact version', async () => {
    const packageToPublish = {
      dependencies: {},
      directory: '/tmp/audio-core',
      id: '@trsoliu/audio-core@1.0.0-beta.2',
      manifestPath: 'packages/core/package.json',
      name: '@trsoliu/audio-core',
      registry: 'https://registry.npmjs.org/',
      version: '1.0.0-beta.2',
    }
    const registryFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ version: '1.0.0-beta.1' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ version: '1.0.0-beta.2' }), {
          status: 200,
        }),
      )

    await expect(
      lookupTaggedVersion(packageToPublish, {}, registryFetch),
    ).resolves.toBe(false)
    await expect(
      lookupTaggedVersion(packageToPublish, {}, registryFetch),
    ).resolves.toBe(true)
    expect(String(registryFetch.mock.calls[0]?.[0])).toBe(
      'https://registry.npmjs.org/%40trsoliu%2Faudio-core/next',
    )
  })

  it('publishes unpublished packages sequentially in manifest order', async () => {
    const fixture = await createFixture()
    const publishedVersions = new Set<string>()
    const publicationOrder: string[] = []

    const result = await publishPrereleasePackages(
      fixture.repositoryRoot,
      fixture.manifestPaths,
      {
        isPublished: async ({ id }) => publishedVersions.has(id),
        publish: async ({ id }) => {
          publicationOrder.push(id)
          publishedVersions.add(id)
        },
      },
    )

    expect(publicationOrder).toEqual([
      '@trsoliu/audio-core@1.0.0-beta.2',
      'audio-adapter@1.0.0-beta.3',
    ])
    expect(result).toEqual({
      published: publicationOrder,
      skipped: [],
    })
  })

  it('does not invoke npm again when every exact version is already published', async () => {
    const fixture = await createFixture()
    const publish = vi.fn()

    const result = await publishPrereleasePackages(
      fixture.repositoryRoot,
      fixture.manifestPaths,
      {
        isPublished: async () => true,
        publish,
      },
    )

    expect(publish).not.toHaveBeenCalled()
    expect(result.published).toEqual([])
    expect(result.skipped).toEqual([
      '@trsoliu/audio-core@1.0.0-beta.2',
      'audio-adapter@1.0.0-beta.3',
    ])
  })

  it('rejects an existing immutable version when next points elsewhere', async () => {
    const fixture = await createFixture()
    const isTagged = vi.fn().mockResolvedValue(false)
    const publish = vi.fn()

    await expect(
      publishPrereleasePackages(
        fixture.repositoryRoot,
        [fixture.manifestPaths[0]!],
        {
          isPublished: async () => true,
          isTagged,
          publish,
          verificationAttempts: 1,
          verificationDelayMs: 0,
        },
      ),
    ).rejects.toThrow(
      '@trsoliu/audio-core@1.0.0-beta.2 exists, but npm next does not resolve to it',
    )
    expect(publish).not.toHaveBeenCalled()
    expect(isTagged).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: '@trsoliu/audio-core@1.0.0-beta.2' }),
      { fresh: true },
    )
  })

  it('recovers when a concurrent publish wins after the initial registry check', async () => {
    const fixture = await createFixture()
    const isPublished = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)

    await expect(
      publishPrereleasePackages(
        fixture.repositoryRoot,
        [fixture.manifestPaths[0]!],
        {
          isPublished,
          publish: async () => {
            throw new Error('version already exists')
          },
        },
      ),
    ).resolves.toEqual({
      published: [],
      skipped: ['@trsoliu/audio-core@1.0.0-beta.2'],
    })
    expect(isPublished).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: '@trsoliu/audio-core@1.0.0-beta.2' }),
      { fresh: true },
    )
  })

  it('keeps checking long enough for delayed npm registry propagation', async () => {
    const fixture = await createFixture()
    let registryChecks = 0

    await expect(
      publishPrereleasePackages(
        fixture.repositoryRoot,
        [fixture.manifestPaths[0]!],
        {
          isPublished: async () => {
            registryChecks += 1
            return registryChecks >= 8
          },
          publish: async () => undefined,
          verificationDelayMs: 0,
        },
      ),
    ).resolves.toEqual({
      published: ['@trsoliu/audio-core@1.0.0-beta.2'],
      skipped: [],
    })
    expect(registryChecks).toBe(8)
  })

  it('retries transient registry errors before and after npm accepts a publish', async () => {
    const fixture = await createFixture()
    const isPublished = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary version lookup failure'))
      .mockResolvedValueOnce(false)
      .mockRejectedValueOnce(new Error('temporary propagation failure'))
      .mockResolvedValue(true)
    const isTagged = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary next lookup failure'))
      .mockResolvedValueOnce(true)

    await expect(
      publishPrereleasePackages(
        fixture.repositoryRoot,
        [fixture.manifestPaths[0]!],
        {
          isPublished,
          isTagged,
          publish: async () => undefined,
          verificationAttempts: 3,
          verificationDelayMs: 0,
        },
      ),
    ).resolves.toEqual({
      published: ['@trsoliu/audio-core@1.0.0-beta.2'],
      skipped: [],
    })
    expect(isPublished).toHaveBeenCalledTimes(5)
    expect(isTagged).toHaveBeenCalledTimes(2)
  })

  it('blocks adapter publication until its exact external core version exists', async () => {
    const fixture = await createFixture()
    const publish = vi.fn()

    await expect(
      publishPrereleasePackages(
        fixture.repositoryRoot,
        [fixture.manifestPaths[1]!],
        {
          isPublished: async () => false,
          publish,
        },
      ),
    ).rejects.toThrow(
      '@trsoliu/audio-core@1.0.0-beta.2 must be published before audio-adapter@1.0.0-beta.3',
    )
    expect(publish).not.toHaveBeenCalled()
  })
})
