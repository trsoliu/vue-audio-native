import type { AudioTrack } from '@trsoliu/audio-core'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import plugin, {
  AudioPlayer,
  useAudioPlayer,
  VueAudioNative,
} from '../src/index'

const tracks: readonly AudioTrack[] = [
  {
    id: 'track-one',
    title: 'Track one',
    sources: { src: '/track-one.mp3', type: 'audio/mpeg' },
  },
]

enableAutoUnmount(afterEach)

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined)
  vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockImplementation((type) =>
    type === 'audio/x-demo-unsupported' ? '' : 'probably',
  )
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event('play'))
    this.dispatchEvent(new Event('playing'))
    return Promise.resolve()
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event('pause'))
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('VueAudioNative', () => {
  it('exports aliases and installs both global component names', () => {
    expect(AudioPlayer).toBe(VueAudioNative)
    expect(VueAudioNative.name).toBe('vue-audio-native')
    const app = createApp({})
    app.use(plugin)
    expect(app.component('VueAudioNative')).toBe(VueAudioNative)
    expect(app.component('AudioPlayer')).toBe(VueAudioNative)
  })

  it('prefers tracks over src and legacy url and warns in development', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const wrapper = mount(VueAudioNative, {
      props: {
        src: '/modern.mp3',
        tracks,
        url: '/legacy.mp3',
      },
    })

    expect(wrapper.get('audio').attributes('src')).toContain('track-one.mp3')
    expect(warning).toHaveBeenCalledOnce()
  })

  it('preserves legacy props, events, slot, and audio id behavior', async () => {
    const wrapper = mount(VueAudioNative, {
      props: {
        showControls: true,
        url: '/legacy.mp3',
      },
    })
    const audio = wrapper.get('audio')
    Object.defineProperty(audio.element, 'duration', {
      configurable: true,
      value: 125,
    })
    Object.defineProperty(audio.element, 'currentTime', {
      configurable: true,
      value: 12,
      writable: true,
    })

    expect(audio.attributes()).toHaveProperty('controls')
    expect(wrapper.emitted('on-audioId')?.[0]?.[0]).toMatch(
      /^vue-audio-native-/,
    )

    const metadataEventCount = wrapper.emitted('on-metadata')?.length ?? 0
    await audio.trigger('loadedmetadata')
    await audio.trigger('durationchange')
    await audio.trigger('play')
    await audio.trigger('timeupdate')
    await audio.trigger('pause')

    expect(wrapper.emitted('on-metadata')).toHaveLength(metadataEventCount + 2)
    expect(wrapper.emitted('on-metadata')?.[0]?.[0]).toBeInstanceOf(Event)
    expect(wrapper.emitted('on-change')?.map(([value]) => value)).toEqual([
      true,
      false,
    ])
    expect(wrapper.emitted('on-timeupdate')?.at(-1)?.[0]).toBe(12)
  })

  it('keeps the legacy empty download filename default', () => {
    const wrapper = mount(VueAudioNative, { props: { url: '/legacy.mp3' } })

    expect(wrapper.get('[aria-label="Download audio"]').attributes('download')).toBe('')
  })

  it('renders modern and legacy empty-state slots', () => {
    const modern = mount(VueAudioNative, {
      slots: {
        tip: '<span data-test="modern-tip">Modern tip</span>',
      },
    })
    const legacy = mount(VueAudioNative, {
      slots: {
        slotTip: '<span data-test="legacy-tip">Legacy tip</span>',
      },
    })

    expect(modern.get('[data-test="modern-tip"]').text()).toBe('Modern tip')
    expect(legacy.get('[data-test="legacy-tip"]').text()).toBe('Legacy tip')
  })

  it('exposes the command handle and accessible custom controls', async () => {
    const wrapper = mount(VueAudioNative, {
      props: { src: '/modern.mp3' },
    })

    expect(wrapper.get('[aria-label="Play audio"]')).toBeTruthy()
    expect(wrapper.get('[aria-label="Audio progress"]')).toBeTruthy()
    expect(typeof wrapper.vm.play).toBe('function')

    await wrapper.vm.play()
    await nextTick()
    expect(wrapper.emitted('play')).toHaveLength(1)
    expect(wrapper.emitted('statechange')?.at(-1)?.[0]).toMatchObject({
      state: 'playing',
    })
  })

  it('renders and operates playlist, artwork, waveform, volume, and download UI', async () => {
    const richTracks: readonly AudioTrack[] = [
      {
        artwork: [{ src: '/cover.webp' }],
        downloadName: 'studio-take.mp3',
        id: 'studio-take',
        peaks: Array.from({ length: 160 }, (_, index) => (index % 10) / 10),
        sources: [
          { src: '/studio-take.ogg', type: 'audio/ogg' },
          { src: '/studio-take.mp3', type: 'audio/mpeg' },
        ],
        title: 'Studio take',
      },
      {
        id: 'second-take',
        sources: { src: '/second-take.mp3' },
        title: 'Second take',
      },
    ]
    const wrapper = mount(VueAudioNative, { props: { tracks: richTracks } })
    const audio = wrapper.get('audio')
    Object.defineProperty(audio.element, 'duration', {
      configurable: true,
      value: 100,
    })
    Object.defineProperty(audio.element, 'currentTime', {
      configurable: true,
      value: 0,
      writable: true,
    })
    Object.defineProperty(audio.element, 'fastSeek', {
      configurable: true,
      value: undefined,
    })
    await audio.trigger('loadedmetadata')

    expect(wrapper.get('img').attributes('alt')).toBe('Studio take artwork')
    expect(wrapper.findAll('.audio-native__peak')).toHaveLength(96)
    expect(wrapper.get('[aria-label="Download audio"]').attributes('download')).toBe(
      'studio-take.mp3',
    )

    await wrapper.get('[aria-label="Audio progress"]').setValue(35)
    expect((audio.element as HTMLAudioElement).currentTime).toBe(35)
    await wrapper.get('[aria-label="Audio volume"]').setValue(0.35)
    expect((audio.element as HTMLAudioElement).volume).toBe(0.35)
    await wrapper.get('[aria-label="Mute audio"]').trigger('click')
    expect((audio.element as HTMLAudioElement).muted).toBe(true)

    await wrapper.get('[aria-label="Next track"]').trigger('click')
    await nextTick()
    expect(audio.attributes('src')).toContain('second-take.mp3')
    await wrapper.get('[aria-label="Previous track"]').trigger('click')
    await nextTick()
    expect(audio.attributes('src')).toContain('studio-take')
  })

  it('downloads the source selected after capability-based format fallback', async () => {
    const wrapper = mount(VueAudioNative, {
      props: {
        tracks: [
          {
            id: 'fallback',
            sources: [
              { src: '/unsupported.demo', type: 'audio/x-demo-unsupported' },
              { src: '/selected.wav', type: 'audio/wav' },
            ],
          },
        ],
      },
    })
    await nextTick()

    expect(wrapper.get('[aria-label="Download audio"]').attributes('href')).toContain(
      'selected.wav',
    )
  })

  it('emits modern lifecycle, track, and structured error events', async () => {
    const wrapper = mount(VueAudioNative, { props: { src: '/events.mp3' } })
    const audio = wrapper.get('audio')

    await audio.trigger('canplay')
    expect(wrapper.emitted('ready')?.length).toBeGreaterThanOrEqual(1)
    await audio.trigger('play')
    await audio.trigger('pause')
    await audio.trigger('ended')
    expect(wrapper.emitted('pause')).toHaveLength(1)
    expect(wrapper.emitted('ended')).toHaveLength(1)

    const trackChanges = wrapper.emitted('trackchange')?.length ?? 0
    await wrapper.setProps({ src: '/replacement.mp3' })
    expect(wrapper.emitted('trackchange')).toHaveLength(trackChanges + 1)

    Object.defineProperty(audio.element, 'error', {
      configurable: true,
      value: { code: 4, message: 'unsupported' },
    })
    await audio.trigger('error')
    expect(wrapper.emitted('error')?.at(-1)?.[0]).toMatchObject({
      code: 'SOURCE_NOT_SUPPORTED',
    })
  })

  it('lets nativeControls reactively override the legacy native-control prop', async () => {
    const custom = mount(VueAudioNative, {
      props: {
        nativeControls: false,
        showControls: true,
        src: [{ src: ' ' }, { src: '/array-source.mp3' }],
      },
    })
    const native = mount(VueAudioNative, {
      props: { nativeControls: true, showControls: false, src: '/native.mp3' },
    })

    expect(custom.get('audio').attributes()).not.toHaveProperty('controls')
    expect(custom.get('[aria-label="Play audio"]')).toBeTruthy()
    expect(native.get('audio').attributes()).toHaveProperty('controls')
    expect(native.find('[aria-label="Play audio"]').exists()).toBe(false)

    await custom.setProps({ nativeControls: true })
    expect(custom.get('audio').attributes()).toHaveProperty('controls')
  })

  it('updates runtime options without reloading an unchanged source', async () => {
    const wrapper = mount(VueAudioNative, { props: { src: '/stable.mp3' } })
    const load = vi.mocked(HTMLMediaElement.prototype.load)
    load.mockClear()

    await wrapper.setProps({ mediaSession: true, playbackRate: 1.5 })

    expect(load).not.toHaveBeenCalled()
    expect((wrapper.get('audio').element as HTMLAudioElement).playbackRate).toBe(1.5)
  })

  it('reports a rejected control click without leaving the custom UI unusable', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
      new DOMException('gesture required', 'NotAllowedError'),
    )
    const wrapper = mount(VueAudioNative, { props: { src: '/blocked.mp3' } })

    await wrapper.get('[aria-label="Play audio"]').trigger('click')
    await Promise.resolve()
    expect(wrapper.emitted('error')?.at(-1)?.[0]).toMatchObject({
      code: 'AUTOPLAY_BLOCKED',
    })
    expect(wrapper.get('[aria-label="Play audio"]')).toBeTruthy()
  })

  it('provides a scoped, SSR-safe composable that cleans up on unmount', () => {
    let result: ReturnType<typeof useAudioPlayer> | undefined
    const options = ref({ src: '/headless.mp3', volume: 1 })
    const Harness = defineComponent({
      setup() {
        const player = useAudioPlayer(options)
        result = player
        return () => h('audio', { ref: player.audioRef })
      },
    })
    const wrapper = mount(Harness)

    expect(result?.controls.getElement()).toBeInstanceOf(HTMLAudioElement)
    expect(result?.snapshot.value.state).toBe('loading')
    options.value = { src: '/changed-headless.mp3', volume: 0.4 }
    expect(result?.controls.getElement()?.src).toContain('changed-headless.mp3')
    expect(result?.snapshot.value.volume).toBe(0.4)
    wrapper.unmount()
    expect(result?.controls.getElement()).toBeNull()
  })
})
