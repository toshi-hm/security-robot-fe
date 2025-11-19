import { describe, it, expect } from 'vitest'

import { normalizeGridMatrix } from '~/utils/gridHelpers'

describe('normalizeGridMatrix', () => {
  it('returns empty array for null/undefined', () => {
    expect(normalizeGridMatrix(null)).toEqual([])
    expect(normalizeGridMatrix(undefined)).toEqual([])
  })

  it('converts nested arrays to numbers', () => {
    expect(
      normalizeGridMatrix([
        [0, 0.5, '1'],
        [true, false, 2],
      ])
    ).toEqual([
      [0, 0.5, 1],
      [1, 0, 2],
    ])
  })

  it('converts object-based rows to ordered arrays', () => {
    const input = {
      0: { 0: 0.1, 1: 0.2 },
      1: { 0: 0.3, 1: 0.4 },
    }

    expect(normalizeGridMatrix(input)).toEqual([
      [0.1, 0.2],
      [0.3, 0.4],
    ])
  })

  it('handles sparse rows gracefully', () => {
    expect(
      normalizeGridMatrix([
        { 0: 1 },
        null as unknown as number[],
        [undefined, 2],
      ])
    ).toEqual([
      [1],
      [],
      [0, 2],
    ])
  })
})
