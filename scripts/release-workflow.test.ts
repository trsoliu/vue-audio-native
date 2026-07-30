import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const repositoryRoot = resolve(import.meta.dirname, '..')
const workflowPath = resolve(repositoryRoot, '.github/workflows/release.yml')
const packagePath = resolve(repositoryRoot, 'package.json')
const versionPackagesPath = resolve(
  repositoryRoot,
  'scripts/version-packages.ts',
)

describe('stable npm release workflow', () => {
  it('runs only from the repository default branch', async () => {
    const workflow = await readFile(workflowPath, 'utf8')

    expect(workflow).toContain(
      "if: github.repository == 'trsoliu/vue-audio-native' && github.ref == 'refs/heads/master'",
    )
  })

  it('runs the stable evidence gate after versioning and before publication', async () => {
    const workflow = await readFile(workflowPath, 'utf8')
    const changesets = workflow.indexOf('id: changesets')
    const stableGate = workflow.indexOf('pnpm release:verify-stable')
    const publish = workflow.indexOf('\n        run: pnpm release\n')

    expect(changesets).toBeGreaterThan(-1)
    expect(stableGate).toBeGreaterThan(changesets)
    expect(publish).toBeGreaterThan(stableGate)
    expect(workflow).toContain(
      "if: steps.release_state.outputs.mode == 'stable' && steps.changesets.outputs.hasChangesets == 'false'",
    )
    expect(workflow).toContain(
      "steps.release_state.outputs.release_commit == 'true'",
    )
    expect(workflow).toContain('id: stable_release_head_recheck')
    expect(workflow).toContain(
      "steps.stable_release_head_recheck.outputs.release_commit == 'true'",
    )
  })

  it('publishes prereleases only through the next dist-tag', async () => {
    const workflow = await readFile(workflowPath, 'utf8')
    const releaseState = workflow.indexOf('id: release_state')
    const changesets = workflow.indexOf('id: changesets')
    const prereleaseGate = workflow.indexOf('pnpm release:verify-prerelease')
    const releaseHeadRecheck = workflow.indexOf('id: release_head_recheck')
    const prereleasePublish = workflow.indexOf(
      '\n        run: pnpm release:next\n',
    )
    const prereleaseCondition =
      "if: steps.release_state.outputs.mode == 'beta' && steps.release_state.outputs.prerelease_ready == 'true' && steps.release_state.outputs.release_commit == 'true'"

    expect(releaseState).toBeGreaterThan(-1)
    expect(changesets).toBeGreaterThan(releaseState)
    expect(prereleaseGate).toBeGreaterThan(changesets)
    expect(releaseHeadRecheck).toBeGreaterThan(prereleaseGate)
    expect(prereleasePublish).toBeGreaterThan(releaseHeadRecheck)
    expect(workflow.split(prereleaseCondition)).toHaveLength(4)
    expect(workflow).toContain(
      "if: steps.release_state.outputs.prerelease_ready != 'true'",
    )
    expect(workflow).toContain('RELEASE_EVENT_NAME: ${{ github.event_name }}')
    expect(workflow).toContain('release_before_sha:')
    expect(workflow).toContain('release_head_sha:')
    expect(workflow).toContain('RELEASE_DEFAULT_BRANCH: master')
    expect(workflow).toContain(
      "RELEASE_HEAD_SHA: ${{ github.event_name == 'push' && github.sha || inputs.release_head_sha }}",
    )
    expect(workflow).toContain(
      "steps.release_head_recheck.outputs.release_commit == 'true'",
    )
    const betaConditions = workflow
      .split('\n')
      .filter((line) =>
        line.includes("if: steps.release_state.outputs.mode == 'beta'"),
      )
    expect(betaConditions).toHaveLength(3)
    expect(
      betaConditions.every((line) => !line.includes('hasChangesets')),
    ).toBe(true)

    const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as {
      scripts?: Record<string, string>
    }
    expect(packageJson.scripts?.['release:next']).toContain(
      'scripts/publish-prerelease.ts',
    )
    expect(packageJson.scripts?.['release:next']).not.toContain(
      'changeset publish',
    )
    expect(packageJson.scripts?.['release:verify-prerelease']).toContain(
      'scripts/prerelease-gate.ts',
    )
    expect(packageJson.scripts?.['release:inspect']).toContain(
      'scripts/release-state.ts',
    )
    expect(packageJson.scripts?.['release:inspect']).toContain(
      'packages/audio-core/package.json',
    )
    expect(packageJson.scripts?.['release:verify-stable']).toContain(
      'scripts/stable-release-gate.ts',
    )
    expect(packageJson.scripts?.['release:verify-devices']).toBeUndefined()
  })

  it('pins every release action to an immutable commit', async () => {
    const workflow = await readFile(workflowPath, 'utf8')
    const actionReferences = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s]+)/g)]

    expect(actionReferences.length).toBeGreaterThan(0)
    for (const reference of actionReferences) {
      expect(reference[1]).toMatch(/^[a-f0-9]{40}$/)
    }
  })

  it('uses OIDC without retaining bootstrap token credentials', async () => {
    const workflowsDirectory = resolve(repositoryRoot, '.github/workflows')
    const workflowFiles = await readdir(workflowsDirectory)
    const workflows = await Promise.all(
      workflowFiles.map((file) =>
        readFile(resolve(workflowsDirectory, file), 'utf8'),
      ),
    )

    expect(workflows.join('\n')).not.toContain('NPM_BOOTSTRAP_TOKEN')
    expect(await readFile(workflowPath, 'utf8')).toContain('id-token: write')
  })

  it('uses the typed version command to refresh package READMEs and the lockfile', async () => {
    const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as {
      scripts?: Record<string, string>
    }
    const versionCommand = packageJson.scripts?.['version-packages']

    expect(versionCommand).toContain('scripts/version-packages.ts')

    const script = await readFile(versionPackagesPath, 'utf8')
    expect(script).toContain("['exec', 'changeset', 'version']")
    expect(script).toContain("['install', '--lockfile-only', '--ignore-scripts']")
    expect(script).toContain('void versionPackages().catch')
    expect(script).not.toContain('  await versionPackages()')
  })
})
