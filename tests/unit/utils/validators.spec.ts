import { describe, it, expect } from 'vitest'
import { isPositiveNumber } from '~/utils/validators'

describe('validators', () => {
  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true)
      expect(isPositiveNumber(0.1)).toBe(true)
      expect(isPositiveNumber(100)).toBe(true)
      expect(isPositiveNumber(0.0001)).toBe(true)
    })

    it('should return false for zero', () => {
      expect(isPositiveNumber(0)).toBe(false)
    })

    it('should return false for negative numbers', () => {
      expect(isPositiveNumber(-1)).toBe(false)
      expect(isPositiveNumber(-0.1)).toBe(false)
      expect(isPositiveNumber(-100)).toBe(false)
    })

    it('should return true for very large positive numbers', () => {
      expect(isPositiveNumber(Number.MAX_SAFE_INTEGER)).toBe(true)
      expect(isPositiveNumber(1e10)).toBe(true)
    })

    it('should return false for very large negative numbers', () => {
      expect(isPositiveNumber(Number.MIN_SAFE_INTEGER)).toBe(false)
      expect(isPositiveNumber(-1e10)).toBe(false)
    })

    it('should handle decimal values correctly', () => {
      expect(isPositiveNumber(0.0000001)).toBe(true)
      expect(isPositiveNumber(-0.0000001)).toBe(false)
    })

    it('should return false for -0', () => {
      expect(isPositiveNumber(-0)).toBe(false)
    })
  })
})
