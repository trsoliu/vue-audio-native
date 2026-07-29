import { describe, expect, it } from 'vitest'

import { normalizeInput, normalizeSources } from '../src/source'

describe('source normalization', () => {
  it('normalizes a URL into a typed source', () => {
    expect(normalizeSources('track.mp3')).toEqual([{ src: 'track.mp3' }])
  })

  it('drops blank and duplicate sources while preserving order', () => {
    expect(
      normalizeSources([
        { src: ' first.mp3 ', type: 'audio/mpeg' },
        { src: '' },
        { src: 'first.mp3', type: 'audio/mpeg' },
        { src: 'fallback.ogg', type: 'audio/ogg' },
      ]),
    ).toEqual([
      { src: 'first.mp3', type: 'audio/mpeg' },
      { src: 'fallback.ogg', type: 'audio/ogg' },
    ])
  })

  it('prefers a non-empty playlist over a direct source', () => {
    const result = normalizeInput({
      src: 'ignored.mp3',
      tracks: [
        {
          id: 'one',
          sources: { src: 'one.mp3', type: 'audio/mpeg' },
          title: 'One',
        },
      ],
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('one')
  })

  it('creates a stable synthetic track for a direct source', () => {
    expect(normalizeInput({ src: 'one.mp3' })).toEqual([
      { id: 'audio-source', sources: [{ src: 'one.mp3' }] },
    ])
  })

  it('returns no tracks for an empty input or invalid playlist entries', () => {
    expect(normalizeInput({})).toEqual([])
    expect(
      normalizeInput({ tracks: [{ id: 'empty', sources: { src: ' ' } }] }),
    ).toEqual([])
  })

  it('normalizes a blank MIME type without emitting an undefined field', () => {
    expect(normalizeSources({ src: 'one.mp3', type: ' ' })).toEqual([
      { src: 'one.mp3' },
    ])
  })
})
