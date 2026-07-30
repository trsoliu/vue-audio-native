import { execFile } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

import {
  evaluateStableRelease,
  requiredDeviceEnvironments,
  verifyStableRelease,
} from './stable-release-gate'

const execute = promisify(execFile)

const assessmentDecision = `
| 发布决策项 | 记录 |
| ---------- | ---- |
| 维护者授权 | trsoliu |
| 决策日期 | 2026-07-30 |
| 适用版本 | 1.0.0 |
| 自动化评估 | 通过 |
| 剩余真机风险 | 已接受 |

${requiredDeviceEnvironments
  .map(
    (environment) =>
      `| ${environment} | evidence | 未执行（维护者接受剩余风险） |`,
  )
  .join('\n')}
`

describe('stable release evidence gate', () => {
  it('accepts the documented maintainer assessment without claiming device evidence', async () => {
    const markdown = await readFile(
      resolve(import.meta.dirname, '../docs/device-smoke.md'),
      'utf8',
    )

    expect(evaluateStableRelease(markdown)).toEqual({
      basis: 'maintainer-assessment',
      blockers: [],
    })
    expect(markdown).toContain('未执行（维护者接受剩余风险）')
  })

  it('continues to accept complete real-device evidence', () => {
    const rows = requiredDeviceEnvironments
      .map((environment) => `| ${environment} | evidence | 通过 |`)
      .join('\n')

    expect(evaluateStableRelease(rows)).toEqual({
      basis: 'device-evidence',
      blockers: [],
    })
  })

  it('rejects pending devices without an explicit assessment decision', () => {
    const rows = requiredDeviceEnvironments
      .map((environment) => `| ${environment} | evidence | 待验证 |`)
      .join('\n')

    const result = evaluateStableRelease(rows)

    expect(result.basis).toBeNull()
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        requiredDeviceEnvironments[0],
        '维护者授权',
        '剩余真机风险',
      ]),
    )
  })

  it('requires every device row to remain documented for an assessment release', () => {
    const result = evaluateStableRelease(
      assessmentDecision.replace(
        `| ${requiredDeviceEnvironments[0]} | evidence | 未执行（维护者接受剩余风险） |`,
        '',
      ),
    )

    expect(result.basis).toBeNull()
    expect(result.blockers).toContain(requiredDeviceEnvironments[0])
  })

  it('rejects unsupported device status values in assessment mode', () => {
    const result = evaluateStableRelease(
      assessmentDecision.replace('未执行（维护者接受剩余风险）', 'banana'),
    )

    expect(result.basis).toBeNull()
    expect(result.blockers).toContain(requiredDeviceEnvironments[0])
  })

  it('rejects an incomplete or malformed assessment decision', () => {
    const result = evaluateStableRelease(
      assessmentDecision
        .replace('2026-07-30', '2026-02-30')
        .replace('已接受', '待定'),
    )

    expect(result.basis).toBeNull()
    expect(result.blockers).toEqual(
      expect.arrayContaining(['决策日期', '剩余真机风险']),
    )
  })

  it('binds an assessment decision to exact stable package versions', async () => {
    const repositoryRoot = await mkdtemp(join(tmpdir(), 'stable-release-gate-'))
    const evidencePath = join(repositoryRoot, 'device-smoke.md')
    const corePath = join(repositoryRoot, 'core.json')
    const adapterPath = join(repositoryRoot, 'adapter.json')
    await writeFile(evidencePath, assessmentDecision)
    await writeFile(
      corePath,
      JSON.stringify({ name: '@trsoliu/audio-core', version: '1.0.0' }),
    )
    await writeFile(
      adapterPath,
      JSON.stringify({ name: 'vue-audio-native', version: '1.0.0' }),
    )

    await expect(
      verifyStableRelease(evidencePath, [corePath, adapterPath]),
    ).resolves.toBe('maintainer-assessment')

    await expect(verifyStableRelease(evidencePath)).rejects.toThrow(
      'requires at least one package manifest',
    )

    await writeFile(
      adapterPath,
      JSON.stringify({ name: 'vue-audio-native', version: '1.0.0-beta.3' }),
    )
    await expect(
      verifyStableRelease(evidencePath, [corePath, adapterPath]),
    ).rejects.toThrow('must be a stable version')
  })

  it('supports exact per-package versions when stable packages drift', async () => {
    const repositoryRoot = await mkdtemp(
      join(tmpdir(), 'stable-release-split-'),
    )
    const evidencePath = join(repositoryRoot, 'device-smoke.md')
    const corePath = join(repositoryRoot, 'core.json')
    const adapterPath = join(repositoryRoot, 'adapter.json')
    await writeFile(
      evidencePath,
      assessmentDecision.replace(
        '| 适用版本 | 1.0.0 |',
        '| 适用版本 | @trsoliu/audio-core@1.0.0, vue-audio-native@1.0.1 |',
      ),
    )
    await writeFile(
      corePath,
      JSON.stringify({ name: '@trsoliu/audio-core', version: '1.0.0' }),
    )
    await writeFile(
      adapterPath,
      JSON.stringify({ name: 'vue-audio-native', version: '1.0.1' }),
    )

    await expect(
      verifyStableRelease(evidencePath, [corePath, adapterPath]),
    ).resolves.toBe('maintainer-assessment')

    await writeFile(
      adapterPath,
      JSON.stringify({ name: 'vue-audio-native', version: '1.0.2' }),
    )
    await expect(
      verifyStableRelease(evidencePath, [corePath, adapterPath]),
    ).rejects.toThrow('is not covered by stable assessment')

    await writeFile(
      evidencePath,
      assessmentDecision.replace(
        '| 适用版本 | 1.0.0 |',
        '| 适用版本 | vue-audio-native@1.0.2 |',
      ),
    )
    await expect(
      verifyStableRelease(evidencePath, [corePath, adapterPath]),
    ).rejects.toThrow('@trsoliu/audio-core@1.0.0 is not covered')
  })

  it('reports the accepted assessment basis from the CLI', async () => {
    const repositoryRoot = await mkdtemp(join(tmpdir(), 'stable-release-cli-'))
    const corePath = join(repositoryRoot, 'core.json')
    const adapterPath = join(repositoryRoot, 'adapter.json')
    await writeFile(
      corePath,
      JSON.stringify({ name: '@trsoliu/audio-core', version: '1.0.1' }),
    )
    await writeFile(
      adapterPath,
      JSON.stringify({ name: 'vue-audio-native', version: '1.0.1' }),
    )
    const result = await execute(
      process.execPath,
      [
        '--import',
        'tsx',
        resolve(import.meta.dirname, 'stable-release-gate.ts'),
        'docs/device-smoke.md',
        corePath,
        adapterPath,
      ],
      { cwd: resolve(import.meta.dirname, '..') },
    )

    expect(result.stdout).toContain(
      'Stable release gate passed via maintainer assessment.',
    )
  })
})
