import './styles.css'

import type {
  AudioPlayerError,
  AudioPlayerHandle,
  AudioSnapshot,
  AudioTrack,
} from '@trsoliu/audio-core'
import type {
  App,
  ComponentOptionsMixin,
  DefineComponent,
  Plugin,
} from 'vue'

import VueAudioNativeSfc from './VueAudioNative.vue'
import type { VueAudioNativeProps } from './types'

type EmptyRecord = Record<string, never>

type VueAudioNativeEmits = {
  ended: (snapshot: AudioSnapshot) => void
  error: (error: AudioPlayerError) => void
  'on-audioId': (id: string) => void
  'on-change': (playing: boolean) => void
  'on-metadata': (event: Event) => void
  'on-timeupdate': (currentTime: number) => void
  pause: (snapshot: AudioSnapshot) => void
  play: (snapshot: AudioSnapshot) => void
  ready: (snapshot: AudioSnapshot) => void
  statechange: (snapshot: AudioSnapshot) => void
  timeupdate: (currentTime: number, snapshot: AudioSnapshot) => void
  trackchange: (track: AudioTrack | null, trackIndex: number) => void
}

interface VueAudioNativeSlots {
  'after-controls'?: (props: {
    controls: AudioPlayerHandle
    snapshot: AudioSnapshot
  }) => unknown
  artwork?: (props: { track: AudioTrack }) => unknown
  'before-controls'?: (props: {
    controls: AudioPlayerHandle
    snapshot: AudioSnapshot
  }) => unknown
  slotTip?: (props: EmptyRecord) => unknown
  tip?: (props: EmptyRecord) => unknown
}

type VueAudioNativeComponent = DefineComponent<
  VueAudioNativeProps,
  AudioPlayerHandle,
  EmptyRecord,
  EmptyRecord,
  EmptyRecord,
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  VueAudioNativeEmits,
  keyof VueAudioNativeEmits & string
> &
  (new () => { $slots: VueAudioNativeSlots })

export const VueAudioNative =
  VueAudioNativeSfc as unknown as VueAudioNativeComponent
export const AudioPlayer = VueAudioNative
export { useAudioPlayer } from './use-audio-player'
export type {
  AudioPlayerSize,
  UseAudioPlayerOptions,
  UseAudioPlayerResult,
  VueAudioNativeProps,
} from './types'
export {
  detectAudioCapabilities,
  formatMediaTime,
  type AudioBridgeEvent,
  type AudioArtwork,
  type AudioControllerOptions,
  type AudioInput,
  type AudioPlayerError,
  type AudioPlayerErrorCode,
  type AudioPlayerHandle,
  type AudioPlayerBridge,
  type AudioRuntimeCapabilities,
  type AudioSnapshot,
  type AudioSource,
  type AudioSourceInput,
  type AudioTrack,
  type BufferedRange,
  type PlaybackState,
  type PreloadMode,
  type RepeatMode,
} from '@trsoliu/audio-core'

const plugin: Plugin = {
  install(app: App): void {
    app.component('VueAudioNative', VueAudioNative)
    app.component('AudioPlayer', VueAudioNative)
  },
}

export default plugin
