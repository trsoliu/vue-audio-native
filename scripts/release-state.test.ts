import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import {
  detectPrereleaseVersionCommit,
  detectStableVersionCommit,
  inspectReleaseState,
  isPrereleaseVersionCommit,
  isStableVersionCommit,
} from './release-state'

const temporaryDirectories: string[] = []
const workspaceRoot = resolve(import.meta.dirname, '..')
const execFileAsync = promisify(execFile)

async function createFixture(options: {
  changesetBody?: string
  changesetId?: string
  consumedChangesets?: string[]
  mode?: 'exit' | 'pre'
  withPrereleaseState?: boolean
} = {}): Promise<string> {
  const repositoryRoot = await mkdtemp(join(tmpdir(), 'audio-release-state-'))
  temporaryDirectories.push(repositoryRoot)
  await mkdir(join(repositoryRoot, '.changeset'), { recursive: true })

  if (options.withPrereleaseState !== false) {
    await writeFile(
      join(repositoryRoot, '.changeset/pre.json'),
      JSON.stringify({
        changesets: options.consumedChangesets ?? [],
        mode: options.mode ?? 'pre',
        tag: 'beta',
      }),
    )
  }

  if (options.changesetId) {
    await writeFile(
      join(repositoryRoot, `.changeset/${options.changesetId}.md`),
      options.changesetBody ??
        '---\n"@trsoliu/audio-core": patch\n---\n\nA release change.\n',
    )
  }

  return repositoryRoot
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

describe('Changesets release state', () => {
  it('does not reconsider already-published bootstrap changesets', async () => {
    const state = await inspectReleaseState(workspaceRoot)

    if (state.mode === 'beta') {
      expect(state.pendingChangesets).not.toContain('modern-audio-native')
      expect(state.pendingChangesets).not.toContain('safe-vue-declarations')
    }
  })

  it('accepts a versioning push or manual recovery and rejects unrelated events', () => {
    const previousPrereleaseState = {
      changesets: ['bootstrap'],
      mode: 'pre',
      tag: 'beta',
    }
    const currentPrereleaseState = {
      changesets: ['bootstrap', 'next-change'],
      mode: 'pre',
      tag: 'beta',
    }

    expect(
      isPrereleaseVersionCommit({
        changedFiles: [
          '.changeset/pre.json',
          'packages/audio-core/package.json',
        ],
        currentPrereleaseState,
        currentVersions: ['1.0.0-beta.2'],
        eventName: 'push',
        beforeIsAncestorOfHead: true,
        manifestPaths: ['packages/audio-core/package.json'],
        previousPrereleaseState,
        previousVersions: ['1.0.0-beta.1'],
      }),
    ).toBe(true)
    expect(
      isPrereleaseVersionCommit({
        changedFiles: [
          '.changeset/pre.json',
          'packages/audio-core/package.json',
        ],
        currentPrereleaseState,
        currentVersions: ['1.0.0-beta.2'],
        eventName: 'pull_request',
        beforeIsAncestorOfHead: true,
        manifestPaths: ['packages/audio-core/package.json'],
        previousPrereleaseState,
        previousVersions: ['1.0.0-beta.1'],
      }),
    ).toBe(false)
    expect(
      isPrereleaseVersionCommit({
        changedFiles: [
          '.changeset/pre.json',
          'packages/audio-core/package.json',
        ],
        currentPrereleaseState,
        currentVersions: ['1.0.0-beta.2'],
        eventName: 'push',
        beforeIsAncestorOfHead: true,
        manifestPaths: ['packages/audio-core/package.json'],
        previousPrereleaseState: currentPrereleaseState,
        previousVersions: ['1.0.0-beta.2'],
      }),
    ).toBe(false)
    expect(
      isPrereleaseVersionCommit({
        changedFiles: [
          '.changeset/pre.json',
          'packages/audio-core/package.json',
        ],
        currentPrereleaseState,
        currentVersions: ['1.0.0-beta.2'],
        eventName: 'workflow_dispatch',
        beforeIsAncestorOfHead: true,
        manifestPaths: ['packages/audio-core/package.json'],
        previousPrereleaseState,
        previousVersions: ['1.0.0-beta.1'],
      }),
    ).toBe(true)
    expect(
      isPrereleaseVersionCommit({
        changedFiles: [
          '.changeset/pre.json',
          'packages/audio-core/package.json',
          'packages/audio-core/src/index.ts',
        ],
        currentPrereleaseState,
        currentVersions: ['1.0.0-beta.2'],
        eventName: 'push',
        beforeIsAncestorOfHead: true,
        manifestPaths: ['packages/audio-core/package.json'],
        previousPrereleaseState,
        previousVersions: ['1.0.0-beta.1'],
      }),
    ).toBe(false)
    expect(
      isPrereleaseVersionCommit({
        changedFiles: [
          '.changeset/pre.json',
          'packages/audio-core/package.json',
        ],
        currentPrereleaseState,
        currentVersions: ['1.0.0-beta.2'],
        eventName: 'push',
        beforeIsAncestorOfHead: false,
        manifestPaths: ['packages/audio-core/package.json'],
        previousPrereleaseState,
        previousVersions: ['1.0.0-beta.1'],
      }),
    ).toBe(false)
  })

  it('accepts only an allowlisted stable patch version commit', () => {
    const manifestPaths = [
      'packages/audio-core/package.json',
      'packages/vue-audio-native/package.json',
    ]
    const releaseFiles = [
      '.changeset/stable-readme.md',
      'packages/vue-audio-native/package.json',
      'packages/vue-audio-native/CHANGELOG.md',
      'packages/vue-audio-native/README.md',
      'pnpm-lock.yaml',
    ]
    const releaseInput = {
      beforeIsAncestorOfHead: true,
      changedFiles: releaseFiles,
      currentPrereleaseState: null,
      currentVersions: ['1.0.0', '1.0.1'],
      deletedFiles: ['.changeset/stable-readme.md'],
      eventName: 'push',
      manifestPaths,
      previousPrereleaseState: null,
      previousVersions: ['1.0.0', '1.0.0'],
      removedPackageChangeset: true,
    } as const

    expect(isStableVersionCommit(releaseInput)).toBe(true)
    expect(
      isStableVersionCommit({
        ...releaseInput,
        changedFiles: [...releaseFiles, 'packages/vue-audio-native/src/index.ts'],
      }),
    ).toBe(false)
    expect(
      isStableVersionCommit({
        ...releaseInput,
        removedPackageChangeset: false,
      }),
    ).toBe(false)
    expect(
      isStableVersionCommit({
        ...releaseInput,
        deletedFiles: [],
      }),
    ).toBe(false)
    expect(
      isStableVersionCommit({
        ...releaseInput,
        changedFiles: releaseFiles.filter(
          (filePath) => filePath !== 'packages/vue-audio-native/README.md',
        ),
      }),
    ).toBe(false)
    expect(
      isStableVersionCommit({
        ...releaseInput,
        currentVersions: ['1.0.0', '1.0.0'],
      }),
    ).toBe(false)
  })

  it('detects a stable version-only push at the live default-branch head', async () => {
    const repositoryRoot = await createFixture({
      changesetBody:
        '---\n"vue-audio-native": patch\n---\n\nRefresh stable install guidance.\n',
      changesetId: 'stable-readme',
      withPrereleaseState: false,
    })
    const manifestPaths = [
      'packages/audio-core/package.json',
      'packages/vue-audio-native/package.json',
    ]
    for (const manifestPath of manifestPaths) {
      const packageDirectory = resolve(repositoryRoot, manifestPath, '..')
      await mkdir(packageDirectory, { recursive: true })
      await writeFile(
        join(repositoryRoot, manifestPath),
        JSON.stringify({
          name: manifestPath.includes('audio-core')
            ? '@trsoliu/audio-core'
            : 'vue-audio-native',
          version: '1.0.0',
        }),
      )
      await writeFile(join(packageDirectory, 'CHANGELOG.md'), '# Changelog\n')
      await writeFile(join(packageDirectory, 'README.md'), '# Package\n')
    }

    await execFileAsync('git', ['init', '-b', 'master'], { cwd: repositoryRoot })
    await execFileAsync('git', ['config', 'user.email', 'release@example.com'], {
      cwd: repositoryRoot,
    })
    await execFileAsync('git', ['config', 'user.name', 'Release Test'], {
      cwd: repositoryRoot,
    })
    await execFileAsync('git', ['add', '.'], { cwd: repositoryRoot })
    await execFileAsync('git', ['commit', '-m', 'release source'], {
      cwd: repositoryRoot,
    })
    const { stdout: beforeShaOutput } = await execFileAsync(
      'git',
      ['rev-parse', 'HEAD'],
      { cwd: repositoryRoot, encoding: 'utf8' },
    )

    await rm(join(repositoryRoot, '.changeset/stable-readme.md'))
    const vueDirectory = join(repositoryRoot, 'packages/vue-audio-native')
    await writeFile(
      join(vueDirectory, 'package.json'),
      JSON.stringify({ name: 'vue-audio-native', version: '1.0.1' }),
    )
    await writeFile(
      join(vueDirectory, 'CHANGELOG.md'),
      '# Changelog\n\n## 1.0.1\n',
    )
    await writeFile(
      join(vueDirectory, 'README.md'),
      'pnpm add vue-audio-native@1.0.1\n',
    )
    await execFileAsync('git', ['add', '--all'], { cwd: repositoryRoot })
    await execFileAsync('git', ['commit', '-m', 'version packages'], {
      cwd: repositoryRoot,
    })
    const { stdout: releaseHeadShaOutput } = await execFileAsync(
      'git',
      ['rev-parse', 'HEAD'],
      { cwd: repositoryRoot, encoding: 'utf8' },
    )
    const remoteRoot = await mkdtemp(join(tmpdir(), 'audio-stable-remote-'))
    temporaryDirectories.push(remoteRoot)
    await execFileAsync(
      'git',
      ['init', '--bare', '--initial-branch=master', remoteRoot],
      { cwd: repositoryRoot },
    )
    await execFileAsync('git', ['remote', 'add', 'origin', remoteRoot], {
      cwd: repositoryRoot,
    })
    await execFileAsync('git', ['push', '--set-upstream', 'origin', 'master'], {
      cwd: repositoryRoot,
    })

    await expect(
      detectStableVersionCommit(repositoryRoot, manifestPaths, {
        beforeSha: beforeShaOutput.trim(),
        defaultBranch: 'master',
        eventName: 'push',
        headSha: releaseHeadShaOutput.trim(),
      }),
    ).resolves.toBe(true)
    await expect(
      detectStableVersionCommit(repositoryRoot, manifestPaths, {
        beforeSha: beforeShaOutput.trim(),
        defaultBranch: 'master',
        eventName: 'push',
        headSha: beforeShaOutput.trim(),
      }),
    ).resolves.toBe(false)
  })

  it('accepts a version-only rebase sequence when the previous tip remains an ancestor', async () => {
    const repositoryRoot = await createFixture({
      changesetId: 'next-change',
      consumedChangesets: ['bootstrap'],
    })
    const packageDirectory = join(repositoryRoot, 'packages/audio-core')
    await mkdir(packageDirectory, { recursive: true })
    await writeFile(
      join(packageDirectory, 'package.json'),
      JSON.stringify({ name: '@trsoliu/audio-core', version: '1.0.0-beta.1' }),
    )
    await writeFile(join(packageDirectory, 'CHANGELOG.md'), '# Changelog\n')

    await execFileAsync('git', ['init', '-b', 'main'], { cwd: repositoryRoot })
    await execFileAsync('git', ['config', 'user.email', 'release@example.com'], {
      cwd: repositoryRoot,
    })
    await execFileAsync('git', ['config', 'user.name', 'Release Test'], {
      cwd: repositoryRoot,
    })
    await execFileAsync('git', ['add', '.'], { cwd: repositoryRoot })
    await execFileAsync('git', ['commit', '-m', 'initial'], {
      cwd: repositoryRoot,
    })
    const { stdout: beforeShaOutput } = await execFileAsync(
      'git',
      ['rev-parse', 'HEAD'],
      { cwd: repositoryRoot, encoding: 'utf8' },
    )

    await writeFile(
      join(packageDirectory, 'package.json'),
      JSON.stringify({ name: '@trsoliu/audio-core', version: '1.0.0-beta.2' }),
    )
    await execFileAsync('git', ['add', '.'], { cwd: repositoryRoot })
    await execFileAsync('git', ['commit', '-m', 'version package'], {
      cwd: repositoryRoot,
    })
    await writeFile(
      join(repositoryRoot, '.changeset/pre.json'),
      JSON.stringify({
        changesets: ['bootstrap', 'next-change'],
        mode: 'pre',
        tag: 'beta',
      }),
    )
    await writeFile(
      join(packageDirectory, 'CHANGELOG.md'),
      '# Changelog\n\n## 1.0.0-beta.2\n',
    )
    await execFileAsync('git', ['add', '.'], { cwd: repositoryRoot })
    await execFileAsync('git', ['commit', '-m', 'record prerelease state'], {
      cwd: repositoryRoot,
    })
    const { stdout: releaseHeadShaOutput } = await execFileAsync(
      'git',
      ['rev-parse', 'HEAD'],
      { cwd: repositoryRoot, encoding: 'utf8' },
    )
    const remoteRoot = await mkdtemp(join(tmpdir(), 'audio-release-remote-'))
    temporaryDirectories.push(remoteRoot)
    await execFileAsync(
      'git',
      ['init', '--bare', '--initial-branch=main', remoteRoot],
      { cwd: repositoryRoot },
    )
    await execFileAsync('git', ['remote', 'add', 'origin', remoteRoot], {
      cwd: repositoryRoot,
    })
    await execFileAsync('git', ['push', '--set-upstream', 'origin', 'main'], {
      cwd: repositoryRoot,
    })

    await expect(
      detectPrereleaseVersionCommit(
        repositoryRoot,
        ['packages/audio-core/package.json'],
        {
          beforeSha: beforeShaOutput.trim(),
          defaultBranch: 'main',
          eventName: 'push',
          headSha: releaseHeadShaOutput.trim(),
        },
      ),
    ).resolves.toBe(true)
    await expect(
      detectPrereleaseVersionCommit(
        repositoryRoot,
        ['packages/audio-core/package.json'],
        {
          beforeSha: beforeShaOutput.trim(),
          eventName: 'workflow_dispatch',
        },
      ),
    ).resolves.toBe(false)
    await expect(
      detectPrereleaseVersionCommit(
        repositoryRoot,
        ['packages/audio-core/package.json'],
        {
          beforeSha: beforeShaOutput.trim(),
          defaultBranch: 'main',
          eventName: 'workflow_dispatch',
          headSha: releaseHeadShaOutput.trim(),
        },
      ),
    ).resolves.toBe(true)

    await execFileAsync(
      'git',
      ['checkout', '--detach', releaseHeadShaOutput.trim()],
      { cwd: repositoryRoot },
    )

    const advancingCheckout = await mkdtemp(
      join(tmpdir(), 'audio-release-advance-'),
    )
    temporaryDirectories.push(advancingCheckout)
    await execFileAsync('git', ['clone', remoteRoot, advancingCheckout], {
      cwd: repositoryRoot,
    })
    await execFileAsync(
      'git',
      ['config', 'user.email', 'release@example.com'],
      { cwd: advancingCheckout },
    )
    await execFileAsync('git', ['config', 'user.name', 'Release Test'], {
      cwd: advancingCheckout,
    })
    await writeFile(
      join(advancingCheckout, 'packages/audio-core/CHANGELOG.md'),
      '# Changelog\n\n## 1.0.0-beta.2\n\nFormatting follow-up.\n',
    )
    await execFileAsync('git', ['add', '.'], { cwd: advancingCheckout })
    await execFileAsync('git', ['commit', '-m', 'refresh lockfile'], {
      cwd: advancingCheckout,
    })
    await execFileAsync('git', ['push', 'origin', 'main'], {
      cwd: advancingCheckout,
    })
    await expect(
      detectPrereleaseVersionCommit(
        repositoryRoot,
        ['packages/audio-core/package.json'],
        {
          beforeSha: beforeShaOutput.trim(),
          defaultBranch: 'main',
          eventName: 'workflow_dispatch',
          headSha: releaseHeadShaOutput.trim(),
        },
      ),
    ).resolves.toBe(false)
  })

  it('requires a version PR while a non-empty prerelease changeset is pending', async () => {
    const repositoryRoot = await createFixture({ changesetId: 'pending-change' })

    await expect(inspectReleaseState(repositoryRoot)).resolves.toEqual({
      mode: 'beta',
      pendingChangesets: ['pending-change'],
      prereleaseReady: false,
    })
  })

  it('publishes after the version PR retains a consumed prerelease changeset', async () => {
    const repositoryRoot = await createFixture({
      changesetId: 'consumed-change',
      consumedChangesets: ['consumed-change'],
    })

    await expect(inspectReleaseState(repositoryRoot)).resolves.toEqual({
      mode: 'beta',
      pendingChangesets: [],
      prereleaseReady: true,
    })
  })

  it('ignores an empty changeset when deciding prerelease readiness', async () => {
    const repositoryRoot = await createFixture({
      changesetBody: '---\n---\n\nNo package release.\n',
      changesetId: 'empty-change',
    })

    await expect(inspectReleaseState(repositoryRoot)).resolves.toMatchObject({
      mode: 'beta',
      prereleaseReady: true,
    })
  })

  it('ignores changesets that target only private workspaces', async () => {
    const repositoryRoot = await createFixture({
      changesetBody: '---\n"demo-vue": patch\n---\n\nDemo-only change.\n',
      changesetId: 'demo-only',
    })
    const manifestPath = 'packages/audio-core/package.json'
    await mkdir(join(repositoryRoot, 'packages/audio-core'), { recursive: true })
    await writeFile(
      join(repositoryRoot, manifestPath),
      JSON.stringify({ name: '@trsoliu/audio-core', version: '1.0.0-beta.1' }),
    )

    await expect(
      inspectReleaseState(repositoryRoot, [manifestPath]),
    ).resolves.toEqual({
      mode: 'beta',
      pendingChangesets: [],
      prereleaseReady: true,
    })
  })

  it('treats absent and exit pre-state as stable release flows', async () => {
    const stableRoot = await createFixture({ withPrereleaseState: false })
    const exitRoot = await createFixture({ mode: 'exit' })

    await expect(inspectReleaseState(stableRoot)).resolves.toMatchObject({
      mode: 'stable',
      prereleaseReady: false,
    })
    await expect(inspectReleaseState(exitRoot)).resolves.toMatchObject({
      mode: 'stable',
      prereleaseReady: false,
    })
  })
})
