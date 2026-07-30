import { execFile } from 'node:child_process'
import { appendFile, readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

interface ChangesetsPrereleaseState {
  changesets?: unknown
  mode?: unknown
  tag?: unknown
}

interface PackageVersionManifest {
  name?: unknown
  private?: unknown
  version?: unknown
}

export interface PrereleaseVersionCommitInput {
  changedFiles: readonly string[]
  currentPrereleaseState: ChangesetsPrereleaseState
  currentVersions: readonly unknown[]
  eventName?: string | undefined
  beforeIsAncestorOfHead: boolean
  manifestPaths: readonly string[]
  previousPrereleaseState: ChangesetsPrereleaseState
  previousVersions: readonly unknown[]
}

export interface StableVersionCommitInput {
  beforeIsAncestorOfHead: boolean
  changedFiles: readonly string[]
  currentPrereleaseState: ChangesetsPrereleaseState | null
  currentVersions: readonly unknown[]
  deletedFiles: readonly string[]
  eventName?: string | undefined
  manifestPaths: readonly string[]
  previousPrereleaseState: ChangesetsPrereleaseState | null
  previousVersions: readonly unknown[]
  removedPackageChangeset: boolean
}

interface ReleaseCommitOptions {
  beforeSha?: string | undefined
  defaultBranch?: string | undefined
  eventName?: string | undefined
  headSha?: string | undefined
}

export interface ReleaseState {
  mode: 'beta' | 'stable'
  pendingChangesets: string[]
  prereleaseReady: boolean
}

const execFileAsync = promisify(execFile)
const stableVersionPattern = /^(\d+)\.(\d+)\.(\d+)$/
const releaseVersionPattern = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/

function changelogPath(manifestPath: string): string {
  const separatorIndex = manifestPath.lastIndexOf('/')
  const directory =
    separatorIndex === -1 ? '' : manifestPath.slice(0, separatorIndex + 1)
  return directory + 'CHANGELOG.md'
}

function readmePath(manifestPath: string): string {
  const separatorIndex = manifestPath.lastIndexOf('/')
  const directory =
    separatorIndex === -1 ? '' : manifestPath.slice(0, separatorIndex + 1)
  return directory + 'README.md'
}

function isStableVersionProgression(
  previousVersion: unknown,
  currentVersion: unknown,
): boolean {
  if (
    typeof previousVersion !== 'string' ||
    typeof currentVersion !== 'string'
  ) {
    return false
  }
  const previousMatch = releaseVersionPattern.exec(previousVersion)
  const currentMatch = stableVersionPattern.exec(currentVersion)
  if (!previousMatch || !currentMatch) return false

  for (let index = 1; index <= 3; index += 1) {
    const previousPart = Number(previousMatch[index])
    const currentPart = Number(currentMatch[index])
    if (
      !Number.isSafeInteger(previousPart) ||
      !Number.isSafeInteger(currentPart)
    ) {
      return false
    }
    if (currentPart > previousPart) return true
    if (currentPart < previousPart) return false
  }

  return previousVersion.includes('-')
}

function consumedChangesets(
  state: ChangesetsPrereleaseState,
): string[] | null {
  if (
    state.mode !== 'pre' ||
    state.tag !== 'beta' ||
    !Array.isArray(state.changesets) ||
    state.changesets.some((changeset) => typeof changeset !== 'string')
  ) {
    return null
  }
  return state.changesets as string[]
}

export function isPrereleaseVersionCommit({
  beforeIsAncestorOfHead,
  changedFiles,
  currentPrereleaseState,
  currentVersions,
  eventName,
  manifestPaths,
  previousPrereleaseState,
  previousVersions,
}: PrereleaseVersionCommitInput): boolean {
  if (
    (eventName !== 'push' && eventName !== 'workflow_dispatch') ||
    !beforeIsAncestorOfHead
  ) {
    return false
  }

  const allowedFiles = new Set([
    '.changeset/pre.json',
    'pnpm-lock.yaml',
    ...manifestPaths,
    ...manifestPaths.map(changelogPath),
    ...manifestPaths.map(readmePath),
  ])
  if (
    !changedFiles.includes('.changeset/pre.json') ||
    !manifestPaths.some((manifestPath) => changedFiles.includes(manifestPath)) ||
    changedFiles.some((filePath) => !allowedFiles.has(filePath))
  ) {
    return false
  }

  const previousChangesets = consumedChangesets(previousPrereleaseState)
  const currentChangesets = consumedChangesets(currentPrereleaseState)
  if (!previousChangesets || !currentChangesets) return false

  const previousSet = new Set(previousChangesets)
  const currentSet = new Set(currentChangesets)
  const consumedNewChangeset = currentChangesets.some(
    (changeset) => !previousSet.has(changeset),
  )
  const retainedPreviousChangesets = previousChangesets.every((changeset) =>
    currentSet.has(changeset),
  )
  const versionsAreComparable =
    currentVersions.length > 0 &&
    currentVersions.length === previousVersions.length &&
    currentVersions.every((version) => typeof version === 'string') &&
    previousVersions.every((version) => typeof version === 'string')
  const versionChanged =
    versionsAreComparable &&
    currentVersions.some(
      (version, index) => version !== previousVersions[index],
    )

  return consumedNewChangeset && retainedPreviousChangesets && versionChanged
}

export function isStableVersionCommit({
  beforeIsAncestorOfHead,
  changedFiles,
  currentPrereleaseState,
  currentVersions,
  deletedFiles,
  eventName,
  manifestPaths,
  previousPrereleaseState,
  previousVersions,
  removedPackageChangeset,
}: StableVersionCommitInput): boolean {
  if (
    (eventName !== 'push' && eventName !== 'workflow_dispatch') ||
    !beforeIsAncestorOfHead ||
    !removedPackageChangeset ||
    manifestPaths.length === 0 ||
    currentVersions.length !== manifestPaths.length ||
    previousVersions.length !== manifestPaths.length
  ) {
    return false
  }

  const changedSet = new Set(changedFiles)
  const deletedSet = new Set(deletedFiles)
  const changesetPattern = /^\.changeset\/[^/]+\.md$/
  const changedChangesets = changedFiles.filter((filePath) =>
    changesetPattern.test(filePath),
  )
  const allowedFiles = new Set([
    '.changeset/pre.json',
    'pnpm-lock.yaml',
    ...manifestPaths,
    ...manifestPaths.map(changelogPath),
    ...manifestPaths.map(readmePath),
  ])
  if (
    changedChangesets.length === 0 ||
    changedChangesets.some((filePath) => !deletedSet.has(filePath)) ||
    changedFiles.some(
      (filePath) =>
        !allowedFiles.has(filePath) && !changesetPattern.test(filePath),
    )
  ) {
    return false
  }

  const exitsPreMode =
    previousPrereleaseState?.mode === 'pre' &&
    previousPrereleaseState.tag === 'beta' &&
    currentPrereleaseState?.mode === 'exit' &&
    currentPrereleaseState.tag === 'beta' &&
    changedSet.has('.changeset/pre.json') &&
    !deletedSet.has('.changeset/pre.json')
  const finalizesExitMode =
    previousPrereleaseState?.mode === 'exit' &&
    currentPrereleaseState === null &&
    deletedSet.has('.changeset/pre.json')
  const advancesStableMode =
    previousPrereleaseState === null &&
    currentPrereleaseState === null &&
    !changedSet.has('.changeset/pre.json')
  if (!exitsPreMode && !finalizesExitMode && !advancesStableMode) {
    return false
  }

  let versionChanged = false
  for (let index = 0; index < manifestPaths.length; index += 1) {
    const previousVersion = previousVersions[index]
    const currentVersion = currentVersions[index]
    if (
      typeof currentVersion !== 'string' ||
      !stableVersionPattern.test(currentVersion)
    ) {
      return false
    }
    if (currentVersion === previousVersion) continue
    if (!isStableVersionProgression(previousVersion, currentVersion)) {
      return false
    }
    const manifestPath = manifestPaths[index]
    if (
      !manifestPath ||
      !changedSet.has(manifestPath) ||
      !changedSet.has(changelogPath(manifestPath)) ||
      !changedSet.has(readmePath(manifestPath))
    ) {
      return false
    }
    versionChanged = true
  }

  return versionChanged
}

function hasPackageRelease(
  contents: string,
  publishablePackageNames: ReadonlySet<string> | null,
): boolean {
  const normalizedContents = contents.replaceAll('\r\n', '\n')
  const frontmatter = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(
    normalizedContents,
  )
  const frontmatterBody = frontmatter?.[1]
  if (!frontmatterBody) return false

  const releasedPackages = frontmatterBody
    .split('\n')
    .map((line): string | null => {
      const separatorIndex = line.lastIndexOf(':')
      if (separatorIndex === -1) return null
      const releaseType = line.slice(separatorIndex + 1).trim()
      if (!['major', 'minor', 'patch'].includes(releaseType)) return null
      const rawPackageName = line.slice(0, separatorIndex).trim()
      const hasMatchingQuotes =
        (rawPackageName.startsWith("'") && rawPackageName.endsWith("'")) ||
        (rawPackageName.startsWith('"') && rawPackageName.endsWith('"'))
      const packageName = hasMatchingQuotes
        ? rawPackageName.slice(1, -1)
        : rawPackageName
      return packageName.length > 0 ? packageName : null
    })
    .filter((packageName): packageName is string => packageName !== null)

  return publishablePackageNames
    ? releasedPackages.some((packageName) =>
        publishablePackageNames.has(packageName),
      )
    : releasedPackages.length > 0
}

async function readPrereleaseState(
  prereleaseStatePath: string,
): Promise<ChangesetsPrereleaseState | null> {
  try {
    return JSON.parse(
      await readFile(prereleaseStatePath, 'utf8'),
    ) as ChangesetsPrereleaseState
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }
    throw error
  }
}

export async function inspectReleaseState(
  repositoryRoot: string,
  manifestPaths: readonly string[] = [],
): Promise<ReleaseState> {
  const changesetsDirectory = resolve(repositoryRoot, '.changeset')
  const prereleaseState = await readPrereleaseState(
    resolve(changesetsDirectory, 'pre.json'),
  )

  if (!prereleaseState || prereleaseState.mode === 'exit') {
    return {
      mode: 'stable',
      pendingChangesets: [],
      prereleaseReady: false,
    }
  }

  if (prereleaseState.mode !== 'pre' || prereleaseState.tag !== 'beta') {
    throw new Error(
      'Changesets prerelease state must be pre/beta or exit before release automation runs.',
    )
  }
  if (
    !Array.isArray(prereleaseState.changesets) ||
    prereleaseState.changesets.some(
      (changeset) => typeof changeset !== 'string',
    )
  ) {
    throw new Error(
      'Changesets prerelease state must list the consumed changeset identifiers.',
    )
  }

  const consumedChangesets = new Set(
    prereleaseState.changesets as string[],
  )
  const publishablePackageNames =
    manifestPaths.length === 0
      ? null
      : new Set(
          await Promise.all(
            manifestPaths.map(async (manifestPath): Promise<string> => {
              const manifest =
                await readCurrentJson<PackageVersionManifest>(
                  repositoryRoot,
                  manifestPath,
                )
              if (
                manifest.private === true ||
                typeof manifest.name !== 'string' ||
                manifest.name.length === 0
              ) {
                throw new Error(
                  `${manifestPath} must identify a publishable package.`,
                )
              }
              return manifest.name
            }),
          ),
        )
  const changesetEntries = await readdir(changesetsDirectory, {
    withFileTypes: true,
  })
  const pendingChangesets = (
    await Promise.all(
      changesetEntries
        .filter(
          (entry) =>
            entry.isFile() &&
            entry.name.endsWith('.md') &&
            entry.name !== 'README.md',
        )
        .map(async (entry): Promise<string | null> => {
          const changesetId = entry.name.slice(0, -'.md'.length)
          if (consumedChangesets.has(changesetId)) {
            return null
          }
          const contents = await readFile(
            resolve(changesetsDirectory, entry.name),
            'utf8',
          )
          return hasPackageRelease(contents, publishablePackageNames)
            ? changesetId
            : null
        }),
    )
  )
    .filter((changesetId): changesetId is string => changesetId !== null)
    .sort()

  return {
    mode: 'beta',
    pendingChangesets,
    prereleaseReady: pendingChangesets.length === 0,
  }
}

async function readCurrentJson<T>(
  repositoryRoot: string,
  filePath: string,
): Promise<T> {
  return JSON.parse(
    await readFile(resolve(repositoryRoot, filePath), 'utf8'),
  ) as T
}

async function readPreviousJson<T>(
  repositoryRoot: string,
  beforeSha: string,
  filePath: string,
): Promise<T | null> {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['show', beforeSha + ':' + filePath],
      { cwd: repositoryRoot, encoding: 'utf8' },
    )
    return JSON.parse(stdout) as T
  } catch {
    return null
  }
}

async function readGitOutput(
  repositoryRoot: string,
  arguments_: readonly string[],
): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('git', [...arguments_], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    })
    return stdout.trim()
  } catch {
    return null
  }
}

async function gitCommandSucceeds(
  repositoryRoot: string,
  arguments_: readonly string[],
): Promise<boolean> {
  try {
    await execFileAsync('git', [...arguments_], { cwd: repositoryRoot })
    return true
  } catch {
    return false
  }
}

async function resolveReleaseCommitContext(
  repositoryRoot: string,
  manifestPaths: readonly string[],
  options: ReleaseCommitOptions,
): Promise<{
  beforeSha: string
  eventName: 'push' | 'workflow_dispatch'
} | null> {
  const beforeSha = options.beforeSha
  if (
    (options.eventName !== 'push' &&
      options.eventName !== 'workflow_dispatch') ||
    manifestPaths.length === 0
  ) {
    return null
  }

  const isValidBeforeSha = (sha: string): boolean =>
    /^[a-f0-9]{40,64}$/i.test(sha) && !/^0+$/.test(sha)
  if (!beforeSha || !isValidBeforeSha(beforeSha)) return null

  const defaultBranch = options.defaultBranch
  const requestedHeadSha = options.headSha
  if (
    (defaultBranch !== 'main' && defaultBranch !== 'master') ||
    !requestedHeadSha ||
    !isValidBeforeSha(requestedHeadSha)
  ) {
    return null
  }
  const currentHeadSha = await readGitOutput(repositoryRoot, [
    'rev-parse',
    'HEAD',
  ])
  const remoteHeadOutput = await readGitOutput(repositoryRoot, [
    'ls-remote',
    '--heads',
    'origin',
    `refs/heads/${defaultBranch}`,
  ])
  const remoteHeadFields = remoteHeadOutput?.split(/\s+/) ?? []
  const remoteHeadSha =
    remoteHeadFields.length === 2 ? remoteHeadFields[0] : null
  if (
    currentHeadSha?.toLowerCase() !== requestedHeadSha.toLowerCase() ||
    remoteHeadSha?.toLowerCase() !== requestedHeadSha.toLowerCase()
  ) {
    return null
  }

  return { beforeSha, eventName: options.eventName }
}

export async function detectPrereleaseVersionCommit(
  repositoryRoot: string,
  manifestPaths: readonly string[],
  options: ReleaseCommitOptions = {},
): Promise<boolean> {
  const context = await resolveReleaseCommitContext(
    repositoryRoot,
    manifestPaths,
    options,
  )
  if (!context) return false

  return detectPrereleaseVersionCommitSince(
    repositoryRoot,
    manifestPaths,
    context.beforeSha,
    context.eventName,
  )
}

async function detectPrereleaseVersionCommitSince(
  repositoryRoot: string,
  manifestPaths: readonly string[],
  beforeSha: string,
  eventName: string,
): Promise<boolean> {
  const previousPrereleaseState =
    await readPreviousJson<ChangesetsPrereleaseState>(
      repositoryRoot,
      beforeSha,
      '.changeset/pre.json',
    )
  if (!previousPrereleaseState) return false

  const beforeIsAncestorOfHead = await gitCommandSucceeds(repositoryRoot, [
    'merge-base',
    '--is-ancestor',
    beforeSha,
    'HEAD',
  ])
  const changedFilesOutput = await readGitOutput(repositoryRoot, [
    'diff',
    '--name-only',
    '--diff-filter=ACDMRT',
    beforeSha,
    'HEAD',
  ])
  if (!beforeIsAncestorOfHead || changedFilesOutput === null) return false
  const changedFiles = changedFilesOutput
    .split('\n')
    .filter((filePath) => filePath.length > 0)

  const currentPrereleaseState =
    await readCurrentJson<ChangesetsPrereleaseState>(
      repositoryRoot,
      '.changeset/pre.json',
    )
  const previousManifests = await Promise.all(
    manifestPaths.map((manifestPath) =>
      readPreviousJson<PackageVersionManifest>(
        repositoryRoot,
        beforeSha,
        manifestPath,
      ),
    ),
  )
  if (previousManifests.some((manifest) => manifest === null)) return false
  const currentManifests = await Promise.all(
    manifestPaths.map((manifestPath) =>
      readCurrentJson<PackageVersionManifest>(repositoryRoot, manifestPath),
    ),
  )

  return isPrereleaseVersionCommit({
    beforeIsAncestorOfHead,
    changedFiles,
    currentPrereleaseState,
    currentVersions: currentManifests.map((manifest) => manifest.version),
    eventName,
    manifestPaths,
    previousPrereleaseState,
    previousVersions: previousManifests.map((manifest) => manifest?.version),
  })
}

export async function detectStableVersionCommit(
  repositoryRoot: string,
  manifestPaths: readonly string[],
  options: ReleaseCommitOptions = {},
): Promise<boolean> {
  const context = await resolveReleaseCommitContext(
    repositoryRoot,
    manifestPaths,
    options,
  )
  if (!context) return false

  const beforeIsAncestorOfHead = await gitCommandSucceeds(repositoryRoot, [
    'merge-base',
    '--is-ancestor',
    context.beforeSha,
    'HEAD',
  ])
  const changedFilesOutput = await readGitOutput(repositoryRoot, [
    'diff',
    '--name-only',
    '--diff-filter=ACDMRT',
    context.beforeSha,
    'HEAD',
  ])
  const deletedFilesOutput = await readGitOutput(repositoryRoot, [
    'diff',
    '--name-only',
    '--diff-filter=D',
    context.beforeSha,
    'HEAD',
  ])
  if (
    !beforeIsAncestorOfHead ||
    changedFilesOutput === null ||
    deletedFilesOutput === null
  ) {
    return false
  }
  const changedFiles = changedFilesOutput
    .split('\n')
    .filter((filePath) => filePath.length > 0)
  const deletedFiles = deletedFilesOutput
    .split('\n')
    .filter((filePath) => filePath.length > 0)

  const previousPrereleaseState =
    await readPreviousJson<ChangesetsPrereleaseState>(
      repositoryRoot,
      context.beforeSha,
      '.changeset/pre.json',
    )
  const currentPrereleaseState = await readPrereleaseState(
    resolve(repositoryRoot, '.changeset/pre.json'),
  )
  const previousManifests = await Promise.all(
    manifestPaths.map((manifestPath) =>
      readPreviousJson<PackageVersionManifest>(
        repositoryRoot,
        context.beforeSha,
        manifestPath,
      ),
    ),
  )
  if (previousManifests.some((manifest) => manifest === null)) return false
  const currentManifests = await Promise.all(
    manifestPaths.map((manifestPath) =>
      readCurrentJson<PackageVersionManifest>(repositoryRoot, manifestPath),
    ),
  )
  const publishablePackageNames = new Set(
    currentManifests
      .filter(
        (manifest) =>
          manifest.private !== true && typeof manifest.name === 'string',
      )
      .map((manifest) => manifest.name as string),
  )
  if (publishablePackageNames.size !== manifestPaths.length) return false

  const deletedChangesets = deletedFiles.filter((filePath) =>
    /^\.changeset\/[^/]+\.md$/.test(filePath),
  )
  const removedPackageChangeset = (
    await Promise.all(
      deletedChangesets.map(async (filePath) => {
        const contents = await readGitOutput(repositoryRoot, [
          'show',
          `${context.beforeSha}:${filePath}`,
        ])
        return contents
          ? hasPackageRelease(contents, publishablePackageNames)
          : false
      }),
    )
  ).some(Boolean)

  return isStableVersionCommit({
    beforeIsAncestorOfHead,
    changedFiles,
    currentPrereleaseState,
    currentVersions: currentManifests.map((manifest) => manifest.version),
    deletedFiles,
    eventName: context.eventName,
    manifestPaths,
    previousPrereleaseState,
    previousVersions: previousManifests.map((manifest) => manifest?.version),
    removedPackageChangeset,
  })
}

async function main(): Promise<void> {
  const manifestPaths = process.argv.slice(2)
  const state = await inspectReleaseState(process.cwd(), manifestPaths)
  const releaseOptions: ReleaseCommitOptions = {
    beforeSha: process.env.RELEASE_BEFORE_SHA,
    defaultBranch: process.env.RELEASE_DEFAULT_BRANCH,
    eventName: process.env.RELEASE_EVENT_NAME,
    headSha: process.env.RELEASE_HEAD_SHA,
  }
  const releaseCommit =
    state.mode === 'beta'
      ? await detectPrereleaseVersionCommit(
          process.cwd(),
          manifestPaths,
          releaseOptions,
        )
      : await detectStableVersionCommit(
          process.cwd(),
          manifestPaths,
          releaseOptions,
        )
  const outputs = [
    'release_commit=' + String(releaseCommit),
    `mode=${state.mode}`,
    `prerelease_ready=${String(state.prereleaseReady)}`,
  ].join('\n')
  const githubOutputPath = process.env.GITHUB_OUTPUT

  if (githubOutputPath) {
    await appendFile(githubOutputPath, `${outputs}\n`)
  } else {
    console.log(outputs)
  }
  if (state.pendingChangesets.length > 0) {
    console.log(
      `Pending prerelease changesets: ${state.pendingChangesets.join(', ')}`,
    )
  }
}

const entryPath = process.argv[1]
if (entryPath && import.meta.url === pathToFileURL(resolve(entryPath)).href) {
  void main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
