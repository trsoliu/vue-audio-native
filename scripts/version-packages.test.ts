import { describe, expect, it } from 'vitest'

import { updateReleaseReadme } from './version-packages'

const readme = `# Package

<!-- release-install:start -->
old content
<!-- release-install:end -->

## Quick start
`

describe('versioned package READMEs', () => {
  it('keeps prerelease consumers on the next dist-tag', () => {
    const result = updateReleaseReadme(
      readme,
      '@trsoliu/audio-core',
      '1.0.1-beta.1',
    )

    expect(result).toContain('pnpm add @trsoliu/audio-core@next')
    expect(result).toContain('currently a prerelease')
    expect(result).not.toContain('@trsoliu/audio-core@1.0.1\n')
  })

  it('writes exact stable core and Vue versions', () => {
    const core = updateReleaseReadme(readme, '@trsoliu/audio-core', '1.0.1')
    const vue = updateReleaseReadme(readme, 'vue-audio-native', '1.0.1')

    expect(core).toContain('pnpm add @trsoliu/audio-core@1.0.1')
    expect(core).toContain('Use `@trsoliu/audio-core@next` only')
    expect(vue).toContain('pnpm add vue-audio-native@1.0.1')
    expect(vue).toContain('pnpm add vue-audio-native@legacy')
    expect(vue).toContain('Use `vue-audio-native@next` only')
  })

  it('refuses unsupported package names and unmanaged READMEs', () => {
    expect(() => updateReleaseReadme(readme, 'unknown', '1.0.1')).toThrow(
      'Unsupported package README',
    )
    expect(() =>
      updateReleaseReadme('# unmanaged', 'vue-audio-native', '1.0.1'),
    ).toThrow('managed release install section')
  })
})
