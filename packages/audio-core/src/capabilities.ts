import type { AudioRuntimeCapabilities } from './types'

const HLS_MIME_TYPES = [
  'application/vnd.apple.mpegurl',
  'application/x-mpegURL',
] as const

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): HTMLElementTagNameMap[K] | null {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    return null
  }

  try {
    return document.createElement(tagName)
  } catch {
    return null
  }
}

function supportsRangeInput(): boolean {
  const input = createElement('input')
  if (!input) return false

  try {
    if (typeof input.setAttribute === 'function') input.setAttribute('type', 'range')
    return input.type === 'range'
  } catch {
    return false
  }
}

export function detectAudioCapabilities(
  providedElement?: HTMLAudioElement | null,
): AudioRuntimeCapabilities {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      customControls: false,
      download: false,
      mediaSession: false,
      nativeHls: false,
      pointerEvents: false,
      touch: false,
    }
  }

  const audio = providedElement ?? createElement('audio')
  const anchor = createElement('a')
  const mediaSession =
    typeof navigator !== 'undefined' && 'mediaSession' in navigator
  const pointerEvents = typeof PointerEvent !== 'undefined'
  const touch =
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
    'ontouchstart' in window
  const nativeHls = Boolean(
    audio &&
      typeof audio.canPlayType === 'function' &&
      HLS_MIME_TYPES.some((type) => audio.canPlayType(type) !== ''),
  )
  const customControls = Boolean(
    audio &&
      typeof audio.play === 'function' &&
      typeof audio.pause === 'function' &&
      typeof audio.addEventListener === 'function' &&
      typeof audio.removeEventListener === 'function' &&
      supportsRangeInput(),
  )

  return {
    customControls,
    download: Boolean(anchor && 'download' in anchor),
    mediaSession,
    nativeHls,
    pointerEvents,
    touch,
  }
}
