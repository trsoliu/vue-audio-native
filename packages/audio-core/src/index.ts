export { createAudioController } from './controller'
export { detectAudioCapabilities } from './capabilities'
export { AudioControllerError } from './errors'
export { formatMediaTime } from './time'
export { normalizeInput, normalizeSources } from './source'
export type {
  AudioController,
  AudioControllerOptions,
  AudioBridgeEvent,
  AudioArtwork,
  AudioInput,
  AudioPlayerError,
  AudioPlayerErrorCode,
  AudioPlayerHandle,
  AudioPlayerBridge,
  AudioRuntimeCapabilities,
  AudioSnapshot,
  AudioSnapshotListener,
  AudioSource,
  AudioSourceInput,
  AudioTrack,
  BufferedRange,
  PlaybackState,
  PreloadMode,
  RepeatMode,
} from './types'
