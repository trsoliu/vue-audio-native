import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const repositoryRoot = resolve(import.meta.dirname, '..')
const workflowPath = resolve(
  repositoryRoot,
  '.github/workflows/bootstrap-beta.yml',
)

describe('bootstrap npm beta workflow', () => {
  it('is a manual, master-only release with an explicit confirmation', async () => {
    const workflow = await readFile(workflowPath, 'utf8')

    expect(workflow).toContain('workflow_dispatch:')
    expect(workflow).not.toMatch(/^\s+push:/m)
    expect(workflow).toContain("github.ref == 'refs/heads/master'")
    expect(workflow).toContain("inputs.mode == 'publish-vue-beta'")
    expect(workflow).toContain("inputs.confirm == 'publish-beta.2'")
    expect(workflow).toContain("inputs.mode == 'finalize-legacy'")
    expect(workflow).toContain("inputs.confirm == 'finalize-legacy'")
    expect(workflow).toContain('environment: npm')
  })

  it('uses minimum permissions and a GitHub environment secret', async () => {
    const workflow = await readFile(workflowPath, 'utf8')

    expect(workflow).toContain('contents: read')
    expect(workflow).toContain('id-token: write')
    expect(workflow).not.toContain('contents: write')
    expect(workflow).toContain('secrets.NPM_BOOTSTRAP_TOKEN')
    expect(workflow).not.toMatch(/_authToken\s*[:=]\s*npm_/)
  })

  it('pins every action to an immutable commit', async () => {
    const workflow = await readFile(workflowPath, 'utf8')
    const actionReferences = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s]+)/g)]

    expect(actionReferences.length).toBeGreaterThan(0)
    for (const reference of actionReferences) {
      expect(reference[1]).toMatch(/^[a-f0-9]{40}$/)
    }
  })

  it('runs every release gate before publishing in dependency order', async () => {
    const workflow = await readFile(workflowPath, 'utf8')

    const requiredCommands = [
      'pnpm security:audit',
      'pnpm lint',
      'pnpm typecheck',
      'pnpm test:coverage',
      'pnpm build',
      'pnpm docs:build',
      'pnpm docs:index',
      'pnpm docs:audit',
      'pnpm docs:eval',
      'pnpm test:pack',
      'pnpm test:e2e',
    ]

    for (const command of requiredCommands) {
      expect(workflow).toContain(command)
    }

    const corePublish = workflow.indexOf('packages/audio-core')
    const vuePublish = workflow.indexOf('packages/vue-audio-native')
    expect(corePublish).toBeGreaterThan(-1)
    expect(vuePublish).toBeGreaterThan(corePublish)
    expect(workflow).toContain('npm publish --tag next --access public')
  })

  it('delays the Vue 2 compatibility tag until all three betas exist', async () => {
    const workflow = await readFile(workflowPath, 'utf8')

    const reactVerification = workflow.indexOf(
      'react-audio-native@1.0.0-beta.1',
    )
    const legacyTag = workflow.indexOf(
      'npm dist-tag add vue-audio-native@0.1.41 legacy',
    )
    expect(reactVerification).toBeGreaterThan(-1)
    expect(legacyTag).toBeGreaterThan(reactVerification)
  })

  it('checks exact registry versions and retries propagation after publishing', async () => {
    const workflow = await readFile(workflowPath, 'utf8')

    expect(workflow).toContain(
      'https://registry.npmjs.org/@trsoliu%2faudio-core/1.0.0-beta.1',
    )
    expect(workflow).toContain(
      'https://registry.npmjs.org/vue-audio-native/1.0.0-beta.2',
    )
    expect(workflow.match(/for attempt in \{1\.\.12\}/g)?.length).toBe(2)
    expect(workflow.match(/sleep 5/g)?.length).toBe(2)
  })

  it('keeps next authoritative without trying to remove the first-version latest tag', async () => {
    const workflow = await readFile(workflowPath, 'utf8')

    expect(workflow).not.toContain(
      'npm dist-tag rm @trsoliu/audio-core latest --registry=https://registry.npmjs.org',
    )
    expect(workflow).toContain(
      'npm requires a latest tag while a package has no stable version',
    )
    expect(workflow).toContain(
      'npm dist-tag add @trsoliu/audio-core@1.0.0-beta.1 next',
    )
    expect(workflow).toContain(
      'npm dist-tag add vue-audio-native@1.0.0-beta.2 next',
    )
  })
})
