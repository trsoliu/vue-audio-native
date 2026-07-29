import type {
  AudioPlayerError,
  AudioPlayerErrorCode,
} from './types'

export class AudioControllerError
  extends Error
  implements AudioPlayerError
{
  readonly code: AudioPlayerErrorCode
  readonly mediaErrorCode?: number
  override readonly cause?: unknown

  constructor(
    code: AudioPlayerErrorCode,
    message: string,
    options: { cause?: unknown; mediaErrorCode?: number } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'AudioControllerError'
    this.code = code
    if (options.cause !== undefined) this.cause = options.cause
    if (options.mediaErrorCode !== undefined) {
      this.mediaErrorCode = options.mediaErrorCode
    }
  }
}

export function fromMediaError(error: MediaError | null): AudioControllerError {
  const code = error?.code
  const mapped: AudioPlayerErrorCode =
    code === 1
      ? 'MEDIA_ABORTED'
      : code === 2
        ? 'NETWORK'
        : code === 3
          ? 'DECODE'
          : code === 4
            ? 'SOURCE_NOT_SUPPORTED'
            : 'UNKNOWN'

  return new AudioControllerError(
    mapped,
    error?.message || 'The audio resource could not be played.',
    code === undefined ? {} : { mediaErrorCode: code },
  )
}

export function fromPlayError(error: unknown): AudioControllerError {
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String(error.name)
      : ''
  const blocked = name === 'NotAllowedError'

  return new AudioControllerError(
    blocked ? 'AUTOPLAY_BLOCKED' : 'UNKNOWN',
    blocked
      ? 'Playback requires a user gesture in this browser.'
      : 'Playback could not be started.',
    { cause: error },
  )
}
