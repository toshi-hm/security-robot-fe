import { describe, it, expect } from 'vitest'

import { DATE_DISPLAY_FORMAT } from '~/utils/constants'

describe('constants', () => {
  describe('DATE_DISPLAY_FORMAT', () => {
    it('should have the correct format string', () => {
      expect(DATE_DISPLAY_FORMAT).toBe('YYYY-MM-DD HH:mm:ss')
    })

    it('should be a string', () => {
      expect(typeof DATE_DISPLAY_FORMAT).toBe('string')
    })

    it('should contain year, month, day, hour, minute, second placeholders', () => {
      expect(DATE_DISPLAY_FORMAT).toContain('YYYY')
      expect(DATE_DISPLAY_FORMAT).toContain('MM')
      expect(DATE_DISPLAY_FORMAT).toContain('DD')
      expect(DATE_DISPLAY_FORMAT).toContain('HH')
      expect(DATE_DISPLAY_FORMAT).toContain('mm')
      expect(DATE_DISPLAY_FORMAT).toContain('ss')
    })
  })
})
