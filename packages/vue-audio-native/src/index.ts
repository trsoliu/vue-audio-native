import './styles.css'

import type { App, Plugin } from 'vue'

import VueAudioNative from './VueAudioNative.vue'

export { VueAudioNative }
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
