import { afterEach, describe, expect, it, vi } from 'vitest'

import { detectAudioCapabilities } from '../src/capabilities'
import { FakeAudioElement } from './fake-audio'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('detectAudioCapabilities', () => {
  it('returns a conservative SSR result without creating an element', () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('navigator', undefined)

    expect(detectAudioCapabilities()).toEqual({
      customControls: false,
      download: false,
      mediaSession: false,
      nativeHls: false,
      pointerEvents: false,
      touch: false,
    })
  })

  it('detects browser and WebView capabilities without user-agent parsing', () => {
    const audio = new FakeAudioElement()
    audio.supportedTypes.set('application/vnd.apple.mpegurl', 'maybe')
    vi.stubGlobal('window', { ontouchstart: null })
    vi.stubGlobal('PointerEvent', class {})
    vi.stubGlobal('navigator', { maxTouchPoints: 5, mediaSession: {} })
    vi.stubGlobal('document', {
      createElement: (tagName: string) => {
        if (tagName === 'audio') return audio.asAudioElement()
        if (tagName === 'a') return { download: '' }
        if (tagName === 'input') return { type: 'range' }
        return {}
      },
    })

    expect(detectAudioCapabilities()).toEqual({
      customControls: true,
      download: true,
      mediaSession: true,
      nativeHls: true,
      pointerEvents: true,
      touch: true,
    })
  })

  it('uses a provided media element and degrades when range input is unavailable', () => {
    const audio = new FakeAudioElement()
    audio.supportedTypes.set('application/vnd.apple.mpegurl', '')
    audio.supportedTypes.set('application/x-mpegURL', '')
    vi.stubGlobal('window', {})
    vi.stubGlobal('document', {
      createElement: (tagName: string) =>
        tagName === 'input' ? { type: 'text' } : { download: '' },
    })
    vi.stubGlobal('navigator', { maxTouchPoints: 0 })

    expect(detectAudioCapabilities(audio.asAudioElement())).toMatchObject({
      customControls: false,
      nativeHls: false,
      touch: false,
    })
  })
})
