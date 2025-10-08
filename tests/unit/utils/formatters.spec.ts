import { describe, it, expect } from 'vitest'
import { formatPercentage } from '~/utils/formatters'

describe('formatters', () => {
  describe('formatPercentage', () => {
    it('should format 0.5 as "50%"', () => {
      expect(formatPercentage(0.5)).toBe('50%')
    })

    it('should format 0.75 as "75%"', () => {
      expect(formatPercentage(0.75)).toBe('75%')
    })

    it('should format 1.0 as "100%"', () => {
      expect(formatPercentage(1.0)).toBe('100%')
    })

    it('should format 0 as "0%"', () => {
      expect(formatPercentage(0)).toBe('0%')
    })

    it('should round 0.456 to "46%"', () => {
      expect(formatPercentage(0.456)).toBe('46%')
    })

    it('should round 0.455 to "46%"', () => {
      expect(formatPercentage(0.455)).toBe('46%')
    })

    it('should round 0.995 to "100%"', () => {
      expect(formatPercentage(0.995)).toBe('100%')
    })

    it('should handle values greater than 1', () => {
      expect(formatPercentage(1.5)).toBe('150%')
    })

    it('should handle negative values', () => {
      expect(formatPercentage(-0.25)).toBe('-25%')
    })

    it('should handle very small values', () => {
      expect(formatPercentage(0.001)).toBe('0%')
    })
  })
})
