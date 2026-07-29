export type PlaybackState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'error'

export type RepeatMode = 'off' | 'one' | 'all'
export type PreloadMode = 'none' | 'metadata' | 'auto'

export interface AudioSource {
  src: string
  type?: string
}

export type AudioSourceInput = string | AudioSource

export type AudioArtwork = MediaImage

export interface AudioTrack {
  id: string
  title?: string
  artist?: string
  album?: string
  artwork?: MediaImage[]
  sources: AudioSource | readonly AudioSource[]
  downloadName?: string
  peaks?: readonly number[]
}

export interface AudioInput {
  src?: AudioSourceInput | readonly AudioSourceInput[]
  tracks?: readonly AudioTrack[]
}

export type AudioPlayerErrorCode =
  | 'AUTOPLAY_BLOCKED'
  | 'SOURCE_NOT_SUPPORTED'
  | 'MEDIA_ABORTED'
  | 'NETWORK'
  | 'DECODE'
  | 'UNKNOWN'

export interface AudioPlayerError {
  code: AudioPlayerErrorCode
  message: string
  mediaErrorCode?: number
  cause?: unknown
}

export interface BufferedRange {
  start: number
  end: number
}

export interface AudioSnapshot {
  state: PlaybackState
  track: AudioTrack | null
  trackIndex: number
  currentTime: number
  duration: number | null
  buffered: readonly BufferedRange[]
  volume: number
  muted: boolean
  playbackRate: number
  repeatMode: RepeatMode
  error: AudioPlayerError | null
}

export type AudioBridgeEvent =
  | { type: 'statechange'; snapshot: AudioSnapshot }
  | {
      type: 'trackchange'
      snapshot: AudioSnapshot
      track: AudioTrack | null
      trackIndex: number
    }
  | { type: 'error'; snapshot: AudioSnapshot; error: AudioPlayerError }

export interface AudioPlayerBridge {
  emit(event: AudioBridgeEvent): void
}

export interface AudioRuntimeCapabilities {
  customControls: boolean
  download: boolean
  mediaSession: boolean
  nativeHls: boolean
  pointerEvents: boolean
  touch: boolean
}

export interface AudioPlayerHandle {
  play(): Promise<void>
  pause(): void
  toggle(): Promise<void>
  stop(): void
  seekTo(seconds: number): void
  skipBy(seconds: number): void
  selectTrack(index: number): Promise<void>
  previous(): Promise<void>
  next(): Promise<void>
  setVolume(volume: number): void
  setMuted(muted: boolean): void
  setPlaybackRate(rate: number): void
  setRepeatMode(mode: RepeatMode): void
  getElement(): HTMLAudioElement | null
}

export interface AudioControllerOptions extends AudioInput {
  autoplay?: boolean
  bridge?: AudioPlayerBridge | null
  exclusive?: boolean
  group?: string
  mediaSession?: boolean
  muted?: boolean
  playbackRate?: number
  preload?: PreloadMode
  repeatMode?: RepeatMode
  volume?: number
  waitBuffer?: boolean
}

export type AudioSnapshotListener = (snapshot: AudioSnapshot) => void

export interface AudioController extends AudioPlayerHandle {
  attach(element: HTMLAudioElement | null): void
  destroy(): void
  getSnapshot(): AudioSnapshot
  setInput(input: AudioInput): void
  subscribe(listener: AudioSnapshotListener): () => void
  updateOptions(options: Partial<AudioControllerOptions>): void
}
