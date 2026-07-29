import { describe, expect, it } from 'vitest'

import { fromMediaError, fromPlayError } from '../src/errors'

describe('audio error mapping', () => {
  it.each([
    [1, 'MEDIA_ABORTED'],
    [2, 'NETWORK'],
    [3, 'DECODE'],
    [4, 'SOURCE_NOT_SUPPORTED'],
    [99, 'UNKNOWN'],
  ] as const)('maps media error %s to %s', (mediaCode, expected) => {
    expect(
      fromMediaError({ code: mediaCode, message: 'failure' } as MediaError),
    ).toMatchObject({ code: expected, mediaErrorCode: mediaCode })
  })

  it('maps a missing media error to an unknown failure', () => {
    expect(fromMediaError(null)).toMatchObject({
      code: 'UNKNOWN',
      message: 'The audio resource could not be played.',
    })
  })

  it('preserves an unknown play rejection as its cause', () => {
    const cause = new Error('device unavailable')
    expect(fromPlayError(cause)).toMatchObject({ code: 'UNKNOWN', cause })
  })
})
