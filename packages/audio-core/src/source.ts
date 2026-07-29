import type {
  AudioInput,
  AudioSource,
  AudioSourceInput,
  AudioTrack,
} from './types'

export function normalizeSources(
  input: AudioSourceInput | readonly AudioSourceInput[],
): AudioSource[] {
  const values = Array.isArray(input) ? input : [input]
  const seen = new Set<string>()
  const sources: AudioSource[] = []

  for (const value of values) {
    const source = typeof value === 'string' ? { src: value } : value
    const src = source.src.trim()
    if (!src || seen.has(src)) continue

    seen.add(src)
    const type = source.type?.trim()
    sources.push(type ? { src, type } : { src })
  }

  return sources
}

export function normalizeInput(input: AudioInput): AudioTrack[] {
  if (input.tracks && input.tracks.length > 0) {
    return input.tracks.flatMap((track) => {
      const sources = normalizeSources(track.sources)
      return sources.length > 0 ? [{ ...track, sources }] : []
    })
  }

  if (!input.src) return []
  const sources = normalizeSources(input.src)
  return sources.length > 0 ? [{ id: 'audio-source', sources }] : []
}
