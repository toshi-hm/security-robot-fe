import { describe, it, expect } from 'vitest'

import { calculateAverageThreat, calculateMaxThreat, countObstacles, normalizeGridMatrix } from '~/utils/gridHelpers'

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
    expect(normalizeGridMatrix([{ 0: 1 }, null as unknown as number[], [undefined, 2]])).toEqual([[1], [], [0, 2]])
  })
})

describe('countObstacles', () => {
  it('counts true values across the grid', () => {
    const grid = [
      [true, false, false],
      [false, true, true],
    ]

    expect(countObstacles(grid)).toBe(3)
  })

  it('returns 0 for empty input', () => {
    expect(countObstacles([])).toBe(0)
  })
})

describe('calculateAverageThreat', () => {
  it('calculates the average across all cells', () => {
    const grid = [
      [0, 0.5],
      [1, 1],
    ]

    expect(calculateAverageThreat(grid)).toBeCloseTo(0.625)
  })

  it('returns 0 when grid is empty', () => {
    expect(calculateAverageThreat([])).toBe(0)
  })
})

describe('calculateMaxThreat', () => {
  it('returns the maximum value in the grid', () => {
    const grid = [
      [0.1, 0.2],
      [0.5, 0.3],
    ]

    expect(calculateMaxThreat(grid)).toBe(0.5)
  })

  it('returns 0 for empty or sparse grids', () => {
    expect(calculateMaxThreat([])).toBe(0)
    expect(calculateMaxThreat([[], []])).toBe(0)
  })
})
