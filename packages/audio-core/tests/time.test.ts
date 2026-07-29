import { describe, expect, it } from 'vitest'

import { formatMediaTime } from '../src/time'

describe('formatMediaTime', () => {
  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, null])(
    'returns a placeholder for an invalid duration (%s)',
    (value) => {
      expect(formatMediaTime(value)).toBe('--:--')
    },
  )

  it.each([
    [0, '00:00'],
    [9.99, '00:09'],
    [59.99, '00:59'],
    [60, '01:00'],
    [3_661, '01:01:01'],
  ])('formats %s seconds as %s', (seconds, expected) => {
    expect(formatMediaTime(seconds)).toBe(expected)
  })
})
