import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

import {
  evaluateDeviceSmoke,
  requiredDeviceEnvironments,
} from './device-smoke-gate'

const execute = promisify(execFile)

describe('stable device-smoke gate', () => {
  it('reports every currently pending required environment', async () => {
    const markdown = await readFile(
      resolve(import.meta.dirname, '../docs/device-smoke.md'),
      'utf8',
    )

    expect(evaluateDeviceSmoke(markdown)).toEqual(requiredDeviceEnvironments)
  })

  it('accepts only a complete table with exact passing statuses', () => {
    const rows = requiredDeviceEnvironments
      .map((environment) => `| ${environment} | evidence | 通过 |`)
      .join('\n')

    expect(evaluateDeviceSmoke(rows)).toEqual([])
    expect(evaluateDeviceSmoke(rows.replace('通过', '待验证'))).toEqual([
      requiredDeviceEnvironments[0],
    ])
  })

  it('runs as a CLI and reports the pending environments', async () => {
    await expect(
      execute(
        process.execPath,
        [
          '--import',
          'tsx',
          resolve(import.meta.dirname, 'device-smoke-gate.ts'),
          'docs/device-smoke.md',
        ],
        { cwd: resolve(import.meta.dirname, '..') },
      ),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining(
        'Stable release blocked by device-smoke evidence',
      ),
    })
  })
})
