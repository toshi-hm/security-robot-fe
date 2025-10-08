import { describe, expect, it } from 'vitest'

import { Environment, type SuspiciousObject } from '~/libs/domains/environment/Environment'

type EnvironmentOverrides = {
  width?: number
  height?: number
  robotX?: number
  robotY?: number
  robotOrientation?: number
  threatGrid?: number[][]
  coverageMap?: boolean[][]
  suspiciousObjects?: SuspiciousObject[]
}

describe('Environment', () => {
  const createEnvironment = (overrides: EnvironmentOverrides = {}) => {
    const width = overrides.width ?? 8
    const height = overrides.height ?? 8
    const threatGrid = overrides.threatGrid ?? Array.from({ length: height }, () => Array(width).fill(0.0))
    const coverageMap = overrides.coverageMap ?? Array.from({ length: height }, () => Array(width).fill(false))

    return new Environment(
      width,
      height,
      overrides.robotX ?? 0,
      overrides.robotY ?? 0,
      overrides.robotOrientation ?? 0,
      threatGrid,
      coverageMap,
      overrides.suspiciousObjects ?? []
    )
  }

  describe('initialization', () => {
    it('creates environment with valid parameters', () => {
      const env = createEnvironment({ width: 10, height: 10 })

      expect(env.width).toBe(10)
      expect(env.height).toBe(10)
      expect(env.robotX).toBe(0)
      expect(env.robotY).toBe(0)
    })

    it('validates robot position is within bounds', () => {
      expect(() => createEnvironment({ width: 8, height: 8, robotX: 10, robotY: 5 })).toThrow(
        'Robot X position 10 out of bounds'
      )
    })

    it('validates robot Y position is within bounds', () => {
      expect(() => createEnvironment({ width: 8, height: 8, robotX: 5, robotY: 10 })).toThrow(
        'Robot Y position 10 out of bounds'
      )
    })

    it('validates robot orientation range', () => {
      expect(() => createEnvironment({ robotOrientation: 5 })).toThrow('Invalid robot orientation 5')
    })

    it('validates threat grid dimensions', () => {
      const invalidThreatGrid = [[0, 0, 0]]
      expect(() => createEnvironment({ width: 8, height: 8, threatGrid: invalidThreatGrid })).toThrow(
        'Threat grid height mismatch'
      )
    })

    it('validates coverage map dimensions', () => {
      const invalidCoverageMap = [[false, false]]
      expect(() => createEnvironment({ width: 8, height: 8, coverageMap: invalidCoverageMap })).toThrow(
        'Coverage map height mismatch'
      )
    })
  })

  describe('orientationText', () => {
    it('returns correct text for north orientation', () => {
      const env = createEnvironment({ robotOrientation: 0 })
      expect(env.orientationText).toBe('北')
    })

    it('returns correct text for east orientation', () => {
      const env = createEnvironment({ robotOrientation: 1 })
      expect(env.orientationText).toBe('東')
    })

    it('returns correct text for south orientation', () => {
      const env = createEnvironment({ robotOrientation: 2 })
      expect(env.orientationText).toBe('南')
    })

    it('returns correct text for west orientation', () => {
      const env = createEnvironment({ robotOrientation: 3 })
      expect(env.orientationText).toBe('西')
    })
  })

  describe('averageThreatLevel', () => {
    it('calculates average threat level correctly', () => {
      const threatGrid = [
        [0.5, 0.3],
        [0.7, 0.1],
      ]
      const env = createEnvironment({ width: 2, height: 2, threatGrid })

      expect(env.averageThreatLevel).toBeCloseTo(0.4)
    })

    it('returns 0 for all-zero threat grid', () => {
      const env = createEnvironment()
      expect(env.averageThreatLevel).toBe(0)
    })
  })

  describe('coverageRatio', () => {
    it('calculates coverage ratio correctly', () => {
      const coverageMap = [
        [true, true, false],
        [false, true, false],
      ]
      const env = createEnvironment({ width: 3, height: 2, coverageMap })

      expect(env.coverageRatio).toBeCloseTo(0.5)
    })

    it('returns 0 for no coverage', () => {
      const env = createEnvironment()
      expect(env.coverageRatio).toBe(0)
    })

    it('returns 1 for full coverage', () => {
      const coverageMap = [
        [true, true],
        [true, true],
      ]
      const env = createEnvironment({ width: 2, height: 2, coverageMap })

      expect(env.coverageRatio).toBe(1)
    })
  })

  describe('suspiciousObjectCount', () => {
    it('returns correct count of suspicious objects', () => {
      const suspiciousObjects: SuspiciousObject[] = [
        { id: 1, x: 2, y: 3, threatLevel: 0.8 },
        { id: 2, x: 5, y: 1, threatLevel: 0.6 },
      ]
      const env = createEnvironment({ suspiciousObjects })

      expect(env.suspiciousObjectCount).toBe(2)
    })

    it('returns 0 when no suspicious objects', () => {
      const env = createEnvironment()
      expect(env.suspiciousObjectCount).toBe(0)
    })
  })

  describe('getThreatLevelAt', () => {
    it('returns threat level at valid position', () => {
      const threatGrid = [
        [0.1, 0.5],
        [0.8, 0.3],
      ]
      const env = createEnvironment({ width: 2, height: 2, threatGrid })

      expect(env.getThreatLevelAt(1, 0)).toBe(0.5)
      expect(env.getThreatLevelAt(0, 1)).toBe(0.8)
    })

    it('returns 0 for out-of-bounds position', () => {
      const env = createEnvironment({ width: 2, height: 2 })

      expect(env.getThreatLevelAt(-1, 0)).toBe(0)
      expect(env.getThreatLevelAt(0, -1)).toBe(0)
      expect(env.getThreatLevelAt(10, 0)).toBe(0)
      expect(env.getThreatLevelAt(0, 10)).toBe(0)
    })
  })

  describe('isCovered', () => {
    it('returns true for covered position', () => {
      const coverageMap = [
        [true, false],
        [false, true],
      ]
      const env = createEnvironment({ width: 2, height: 2, coverageMap })

      expect(env.isCovered(0, 0)).toBe(true)
      expect(env.isCovered(1, 1)).toBe(true)
    })

    it('returns false for uncovered position', () => {
      const coverageMap = [
        [true, false],
        [false, true],
      ]
      const env = createEnvironment({ width: 2, height: 2, coverageMap })

      expect(env.isCovered(1, 0)).toBe(false)
      expect(env.isCovered(0, 1)).toBe(false)
    })

    it('returns false for out-of-bounds position', () => {
      const env = createEnvironment({ width: 2, height: 2 })

      expect(env.isCovered(-1, 0)).toBe(false)
      expect(env.isCovered(0, -1)).toBe(false)
      expect(env.isCovered(10, 0)).toBe(false)
      expect(env.isCovered(0, 10)).toBe(false)
    })
  })
})
