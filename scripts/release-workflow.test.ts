import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const repositoryRoot = resolve(import.meta.dirname, '..')
const workflowPath = resolve(repositoryRoot, '.github/workflows/release.yml')

describe('stable npm release workflow', () => {
  it('runs the device gate after versioning and before publication', async () => {
    const workflow = await readFile(workflowPath, 'utf8')
    const changesets = workflow.indexOf('id: changesets')
    const deviceGate = workflow.indexOf('pnpm release:verify-devices')
    const publish = workflow.indexOf('\n        run: pnpm release\n')

    expect(changesets).toBeGreaterThan(-1)
    expect(deviceGate).toBeGreaterThan(changesets)
    expect(publish).toBeGreaterThan(deviceGate)
    expect(workflow).toContain(
      "if: steps.changesets.outputs.hasChangesets == 'false'",
    )
  })

  it('pins every release action to an immutable commit', async () => {
    const workflow = await readFile(workflowPath, 'utf8')
    const actionReferences = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s]+)/g)]

    expect(actionReferences.length).toBeGreaterThan(0)
    for (const reference of actionReferences) {
      expect(reference[1]).toMatch(/^[a-f0-9]{40}$/)
    }
  })
})
