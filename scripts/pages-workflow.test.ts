import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const repositoryRoot = resolve(import.meta.dirname, '..')
const workflowPath = resolve(repositoryRoot, '.github/workflows/pages.yml')

describe('GitHub Pages Agent Contract deployment', () => {
  it('includes the generated .well-known directory in the Pages artifact', async () => {
    const workflow = await readFile(workflowPath, 'utf8')
    const uploadStepStart = workflow.indexOf('actions/upload-pages-artifact@')
    const uploadStepEnd = workflow.indexOf('\n\n', uploadStepStart)
    const uploadStep = workflow.slice(uploadStepStart, uploadStepEnd)

    expect(uploadStepStart).toBeGreaterThan(-1)
    expect(uploadStep).toContain('include-hidden-files: true')
  })
})
