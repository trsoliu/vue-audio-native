import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAudioController } from '../src/controller'
import type { AudioPlayerBridge, AudioTrack } from '../src/types'
import { FakeAudioElement, FakeTimeRanges } from './fake-audio'

const tracks: readonly AudioTrack[] = [
  {
    id: 'one',
    title: 'One',
    sources: [
      { src: 'one.ogg', type: 'audio/ogg' },
      { src: 'one.mp3', type: 'audio/mpeg' },
    ],
  },
  {
    id: 'two',
    title: 'Two',
    sources: { src: 'two.mp3', type: 'audio/mpeg' },
  },
]

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createAudioController', () => {
  it('tracks media lifecycle state without polling readyState', async () => {
    const audio = new FakeAudioElement()
    audio.supportedTypes.set('audio/ogg', '')
    audio.supportedTypes.set('audio/mpeg', 'probably')
    const controller = createAudioController({ tracks })

    controller.attach(audio.asAudioElement())
    expect(audio.src).toBe('one.mp3')
    expect(controller.getSnapshot().state).toBe('loading')

    audio.duration = 125.8
    audio.emit('loadedmetadata')
    audio.emit('canplay')
    expect(controller.getSnapshot()).toMatchObject({
      duration: 125.8,
      state: 'ready',
      trackIndex: 0,
    })

    await controller.play()
    expect(controller.getSnapshot().state).toBe('playing')

    audio.currentTime = 12.5
    audio.buffered = new FakeTimeRanges([{ start: 0, end: 45 }])
    audio.emit('timeupdate')
    expect(controller.getSnapshot()).toMatchObject({
      buffered: [{ start: 0, end: 45 }],
      currentTime: 12.5,
    })
  })

  it('notifies subscribers once for a single pause event', () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())
    const listener = vi.fn()
    controller.subscribe(listener)

    audio.emit('pause')

    expect(listener).toHaveBeenCalledOnce()
  })

  it('reports autoplay blocking without making the player terminal', async () => {
    const audio = new FakeAudioElement()
    audio.playError = new DOMException('User activation required', 'NotAllowedError')
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())
    audio.emit('canplay')

    await expect(controller.play()).rejects.toMatchObject({
      code: 'AUTOPLAY_BLOCKED',
    })
    expect(controller.getSnapshot()).toMatchObject({
      error: { code: 'AUTOPLAY_BLOCKED' },
      state: 'ready',
    })
  })

  it('falls back to the next source and preserves active playback intent', async () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({ tracks })
    controller.attach(audio.asAudioElement())

    expect(audio.src).toBe('one.ogg')
    await controller.play()
    audio.paused = true
    audio.error = { code: 4, message: 'unsupported' } as MediaError
    audio.emit('error')
    await Promise.resolve()
    expect(audio.src).toBe('one.mp3')
    expect(audio.paused).toBe(false)
    expect(controller.getSnapshot().state).toBe('playing')

    audio.emit('error')
    expect(controller.getSnapshot()).toMatchObject({
      error: { code: 'SOURCE_NOT_SUPPORTED', mediaErrorCode: 4 },
      state: 'error',
    })
  })

  it('clamps an unbuffered seek when waitBuffer is disabled', () => {
    const audio = new FakeAudioElement()
    audio.duration = 100
    audio.buffered = new FakeTimeRanges([{ start: 0, end: 30 }])
    const controller = createAudioController({
      src: 'one.mp3',
      waitBuffer: false,
    })
    controller.attach(audio.asAudioElement())
    audio.emit('loadedmetadata')

    controller.seekTo(70)
    expect(audio.currentTime).toBe(30)
  })

  it('advances tracks and wraps when repeat-all is enabled', async () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({ repeatMode: 'all', tracks })
    controller.attach(audio.asAudioElement())
    await controller.play()

    audio.paused = true
    audio.emit('ended')
    await Promise.resolve()
    expect(controller.getSnapshot().trackIndex).toBe(1)
    expect(audio.src).toBe('two.mp3')
    expect(audio.paused).toBe(false)

    audio.paused = true
    audio.emit('ended')
    await Promise.resolve()
    expect(controller.getSnapshot().trackIndex).toBe(0)
  })

  it('replays the same track in repeat-one mode', async () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({
      repeatMode: 'one',
      src: 'one.mp3',
    })
    controller.attach(audio.asAudioElement())
    audio.currentTime = 42

    audio.emit('ended')
    await Promise.resolve()
    expect(audio.currentTime).toBe(0)
    expect(audio.paused).toBe(false)
  })

  it('pauses another exclusive controller in the same group', async () => {
    const firstAudio = new FakeAudioElement()
    const secondAudio = new FakeAudioElement()
    const first = createAudioController({
      exclusive: true,
      group: 'demo',
      src: 'one.mp3',
    })
    const second = createAudioController({
      exclusive: true,
      group: 'demo',
      src: 'two.mp3',
    })
    first.attach(firstAudio.asAudioElement())
    second.attach(secondAudio.asAudioElement())

    await first.play()
    await second.play()

    expect(firstAudio.paused).toBe(true)
    expect(secondAudio.paused).toBe(false)
    first.destroy()
    second.destroy()
  })

  it('removes all listeners when destroyed', () => {
    const audio = new FakeAudioElement()
    const listener = vi.fn()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())
    controller.subscribe(listener)
    controller.destroy()
    listener.mockClear()

    audio.currentTime = 10
    audio.emit('timeupdate')
    expect(listener).not.toHaveBeenCalled()
  })

  it('cannot reattach and recreate side effects after destruction', () => {
    const firstAudio = new FakeAudioElement()
    const secondAudio = new FakeAudioElement()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(firstAudio.asAudioElement())
    controller.destroy()

    controller.attach(secondAudio.asAudioElement())

    expect(controller.getElement()).toBeNull()
    expect(secondAudio.loadCalls).toBe(0)
  })

  it('rejects play and enters an error state when no source exists', async () => {
    const controller = createAudioController()

    await expect(controller.play()).rejects.toMatchObject({
      code: 'SOURCE_NOT_SUPPORTED',
    })
    expect(controller.getSnapshot().state).toBe('error')
  })

  it('toggles playback and stops at the beginning', async () => {
    const audio = new FakeAudioElement()
    audio.duration = 90
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())

    await controller.toggle()
    expect(audio.paused).toBe(false)

    await controller.toggle()
    expect(audio.paused).toBe(true)

    audio.currentTime = 40
    controller.stop()
    expect(audio.currentTime).toBe(0)
  })

  it('clamps volume and playback rate and synchronizes native changes', () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())

    controller.setVolume(4)
    controller.setPlaybackRate(0.1)
    controller.setMuted(true)
    expect(controller.getSnapshot()).toMatchObject({
      muted: true,
      playbackRate: 0.25,
      volume: 1,
    })

    audio.volume = 0.4
    audio.muted = false
    audio.playbackRate = 1.5
    audio.emit('volumechange')
    audio.emit('ratechange')
    expect(controller.getSnapshot()).toMatchObject({
      muted: false,
      playbackRate: 1.5,
      volume: 0.4,
    })
  })

  it('supports skip, previous, next, and validated track selection', async () => {
    const audio = new FakeAudioElement()
    audio.duration = 100
    const controller = createAudioController({ tracks })
    controller.attach(audio.asAudioElement())
    audio.emit('loadedmetadata')

    audio.currentTime = 10
    controller.skipBy(15)
    expect(audio.currentTime).toBe(25)

    await controller.previous()
    expect(audio.currentTime).toBe(0)

    await controller.next()
    expect(controller.getSnapshot().trackIndex).toBe(1)
    await controller.previous()
    expect(controller.getSnapshot().trackIndex).toBe(0)

    await expect(controller.selectTrack(99)).rejects.toBeInstanceOf(RangeError)
    await expect(controller.selectTrack(0.5)).rejects.toBeInstanceOf(RangeError)
  })

  it('wraps previous and next only in repeat-all mode', async () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({ repeatMode: 'all', tracks })
    controller.attach(audio.asAudioElement())

    await controller.previous()
    expect(controller.getSnapshot().trackIndex).toBe(1)
    await controller.next()
    expect(controller.getSnapshot().trackIndex).toBe(0)

    controller.setRepeatMode('off')
    await controller.selectTrack(1)
    await controller.next()
    expect(controller.getSnapshot().state).toBe('ended')
  })

  it('replaces and clears input without recreating the controller', () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())

    controller.setInput({ src: 'replacement.mp3' })
    expect(audio.src).toBe('replacement.mp3')
    expect(controller.getSnapshot().track?.id).toBe('audio-source')

    controller.setInput({})
    expect(audio.src).toBe('')
    expect(controller.getSnapshot()).toMatchObject({
      state: 'idle',
      track: null,
      trackIndex: -1,
    })
  })

  it('updates options and applies them to the attached media element', () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())

    controller.updateOptions({
      autoplay: true,
      muted: true,
      playbackRate: 2,
      preload: 'auto',
      repeatMode: 'all',
      volume: 0.25,
    })

    expect(audio).toMatchObject({
      autoplay: true,
      muted: true,
      playbackRate: 2,
      preload: 'auto',
      volume: 0.25,
    })
    expect(controller.getSnapshot().repeatMode).toBe('all')

    controller.updateOptions({ src: 'changed.mp3' })
    expect(audio.src).toBe('changed.mp3')
  })

  it('detaches from a previous element before attaching another', () => {
    const first = new FakeAudioElement()
    const second = new FakeAudioElement()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(first.asAudioElement())
    controller.attach(first.asAudioElement())
    controller.attach(second.asAudioElement())

    first.currentTime = 30
    first.emit('timeupdate')
    expect(controller.getSnapshot().currentTime).toBe(0)
    expect(controller.getElement()).toBe(second.asAudioElement())

    controller.attach(null)
    expect(controller.getElement()).toBeNull()
  })

  it('supports subscription cancellation', () => {
    const audio = new FakeAudioElement()
    const listener = vi.fn()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())
    const unsubscribe = controller.subscribe(listener)

    audio.emit('canplay')
    expect(listener).toHaveBeenCalled()
    unsubscribe()
    listener.mockClear()
    audio.emit('waiting')
    expect(listener).not.toHaveBeenCalled()
  })

  it('enters buffering only while playback is active', async () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())

    audio.emit('waiting')
    expect(controller.getSnapshot().state).toBe('loading')

    await controller.play()
    audio.emit('stalled')
    expect(controller.getSnapshot().state).toBe('buffering')
    audio.emit('playing')
    expect(controller.getSnapshot().state).toBe('playing')
  })

  it('does not let a late canplay event overwrite a paused state', async () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())
    audio.emit('canplay')

    await controller.play()
    audio.pause()
    audio.emit('canplay')

    expect(controller.getSnapshot().state).toBe('paused')
  })

  it('leaves buffering when canplay resumes active playback', async () => {
    const audio = new FakeAudioElement()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())

    await controller.play()
    audio.emit('waiting')
    audio.emit('canplay')

    expect(controller.getSnapshot().state).toBe('playing')
  })

  it('uses currentTime assignment when fastSeek is unavailable', () => {
    const audio = new FakeAudioElement()
    audio.duration = 60
    Object.defineProperty(audio, 'fastSeek', { value: undefined })
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())

    controller.seekTo(80)
    expect(audio.currentTime).toBe(60)
    controller.seekTo(Number.NaN)
    expect(audio.currentTime).toBe(60)
  })

  it('updates progress from requestAnimationFrame and cancels on pause', async () => {
    let callback: FrameRequestCallback | undefined
    const request = vi.fn((next: FrameRequestCallback) => {
      callback = next
      return 7
    })
    const cancel = vi.fn()
    vi.stubGlobal('requestAnimationFrame', request)
    vi.stubGlobal('cancelAnimationFrame', cancel)
    const audio = new FakeAudioElement()
    const controller = createAudioController({ src: 'one.mp3' })
    controller.attach(audio.asAudioElement())

    await controller.play()
    audio.currentTime = 8
    callback?.(16)
    expect(controller.getSnapshot().currentTime).toBe(8)

    audio.pause()
    expect(cancel).toHaveBeenCalledWith(7)
  })

  it('wires Media Session metadata and action handlers when enabled', async () => {
    const handlers = new Map<string, MediaSessionActionHandler | null>()
    const mediaSession = {
      metadata: null,
      playbackState: 'none',
      setActionHandler: vi.fn(
        (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
          handlers.set(action, handler)
        },
      ),
    }
    class FakeMediaMetadata {
      readonly data: MediaMetadataInit

      constructor(data: MediaMetadataInit) {
        this.data = data
      }
    }
    vi.stubGlobal('navigator', { mediaSession })
    vi.stubGlobal('MediaMetadata', FakeMediaMetadata)
    const audio = new FakeAudioElement()
    audio.duration = 100
    const controller = createAudioController({
      mediaSession: true,
      tracks: [
        {
          album: 'Album',
          artist: 'Artist',
          artwork: [{ sizes: '512x512', src: 'cover.png' }],
          id: 'one',
          sources: { src: 'one.mp3', type: 'audio/mpeg' },
          title: 'Title',
        },
      ],
    })
    controller.attach(audio.asAudioElement())
    await controller.play()

    expect(mediaSession.playbackState).toBe('playing')
    expect(mediaSession.metadata).toBeInstanceOf(FakeMediaMetadata)
    handlers.get('seekforward')?.({ action: 'seekforward', seekOffset: 12 })
    expect(audio.currentTime).toBe(12)
    handlers.get('seekto')?.({ action: 'seekto', seekTime: 40 })
    expect(audio.currentTime).toBe(40)
    handlers.get('pause')?.({ action: 'pause' })
    expect(audio.paused).toBe(true)
    handlers.get('play')?.({ action: 'play' })
    await Promise.resolve()
    expect(audio.paused).toBe(false)
    handlers.get('seekbackward')?.({ action: 'seekbackward' })
    expect(audio.currentTime).toBe(30)
    handlers.get('previoustrack')?.({ action: 'previoustrack' })
    await Promise.resolve()
    expect(audio.currentTime).toBe(0)
    handlers.get('nexttrack')?.({ action: 'nexttrack' })
    await Promise.resolve()
    expect(controller.getSnapshot().state).toBe('ended')
    handlers.get('stop')?.({ action: 'stop' })

    controller.updateOptions({ mediaSession: false })
    expect(mediaSession.setActionHandler).toHaveBeenCalledWith('play', null)
    expect(mediaSession.metadata).toBeNull()
    expect(mediaSession.playbackState).toBe('none')
    controller.destroy()
  })

  it('ignores unsupported Media Session actions', async () => {
    const mediaSession = {
      metadata: null,
      playbackState: 'none',
      setActionHandler: vi.fn((action: MediaSessionAction) => {
        if (action === 'stop') throw new Error('unsupported')
      }),
    }
    vi.stubGlobal('navigator', { mediaSession })
    vi.stubGlobal('MediaMetadata', class {})
    const audio = new FakeAudioElement()
    const controller = createAudioController({
      mediaSession: true,
      src: 'one.mp3',
    })
    controller.attach(audio.asAudioElement())

    await expect(controller.play()).resolves.toBeUndefined()
    expect(mediaSession.setActionHandler).toHaveBeenCalled()
    controller.destroy()
  })

  it('emits protocol-neutral bridge events and isolates host errors', async () => {
    const audio = new FakeAudioElement()
    const emit = vi.fn((event) => {
      if (event.type === 'trackchange') throw new Error('host bridge unavailable')
    })
    const bridge: AudioPlayerBridge = { emit }
    const controller = createAudioController({ bridge, tracks })

    expect(emit).not.toHaveBeenCalled()
    expect(() => controller.attach(audio.asAudioElement())).not.toThrow()
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ trackIndex: 0, type: 'trackchange' }),
    )
    audio.emit('canplay')
    await controller.play()
    audio.error = { code: 2, message: 'network' } as MediaError
    audio.emit('error')
    audio.emit('error')

    expect(emit.mock.calls.map(([event]) => event.type)).toEqual(
      expect.arrayContaining(['trackchange', 'statechange', 'error']),
    )
    expect(
      emit.mock.calls.find(([event]) => event.type === 'statechange')?.[0],
    ).toMatchObject({ snapshot: { trackIndex: 0 }, type: 'statechange' })
    expect(emit.mock.calls.find(([event]) => event.type === 'error')?.[0]).toMatchObject({
      error: { code: 'NETWORK' },
      type: 'error',
    })
  })
})
