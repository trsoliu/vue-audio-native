import type {
  AudioControllerOptions,
  AudioPlayerHandle,
  AudioSnapshot,
  AudioSourceInput,
  AudioTrack,
  PreloadMode,
  RepeatMode,
} from '@trsoliu/audio-core'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'

export type AudioPlayerSize = 'small' | 'default' | 'large'

export type UseAudioPlayerOptions = MaybeRefOrGetter<AudioControllerOptions>

export interface VueAudioNativeProps {
  autoplay?: boolean
  downloadName?: string
  exclusive?: boolean
  group?: string
  hint?: string
  mediaSession?: boolean
  muted?: boolean
  nativeControls?: boolean
  playbackRate?: number
  preload?: PreloadMode
  repeatMode?: RepeatMode
  showControls?: boolean
  showCurrentTime?: boolean
  showDownload?: boolean
  showVolume?: boolean
  size?: AudioPlayerSize
  src?: AudioSourceInput | readonly AudioSourceInput[]
  tracks?: readonly AudioTrack[]
  url?: string
  volume?: number
  waitBuffer?: boolean
}

export interface UseAudioPlayerResult {
  audioRef: ShallowRef<HTMLAudioElement | null>
  snapshot: ShallowRef<AudioSnapshot>
  controls: AudioPlayerHandle
}
