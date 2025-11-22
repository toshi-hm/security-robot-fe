import { describe, it, expect } from 'vitest'

import { getChargingStationPosition, hasChargingStationPosition } from '~/utils/batteryHelpers'

describe('batteryHelpers', () => {
  describe('getChargingStationPosition', () => {
    it('returns position object when both coordinates are available', () => {
      const state = {
        charging_station_position_x: 5,
        charging_station_position_y: 10,
      }

      const result = getChargingStationPosition(state)

      expect(result).toEqual({ x: 5, y: 10 })
    })

    it('returns null when x coordinate is missing', () => {
      const state = {
        charging_station_position_y: 10,
      }

      const result = getChargingStationPosition(state)

      expect(result).toBeNull()
    })

    it('returns null when y coordinate is missing', () => {
      const state = {
        charging_station_position_x: 5,
      }

      const result = getChargingStationPosition(state)

      expect(result).toBeNull()
    })

    it('returns null when both coordinates are missing', () => {
      const state = {}

      const result = getChargingStationPosition(state)

      expect(result).toBeNull()
    })

    it('handles zero coordinates correctly', () => {
      const state = {
        charging_station_position_x: 0,
        charging_station_position_y: 0,
      }

      const result = getChargingStationPosition(state)

      expect(result).toEqual({ x: 0, y: 0 })
    })

    it('returns null when x coordinate is null', () => {
      const state = {
        charging_station_position_x: null as unknown as number,
        charging_station_position_y: 10,
      }

      const result = getChargingStationPosition(state)

      expect(result).toBeNull()
    })

    it('returns null when y coordinate is null', () => {
      const state = {
        charging_station_position_x: 5,
        charging_station_position_y: null as unknown as number,
      }

      const result = getChargingStationPosition(state)

      expect(result).toBeNull()
    })
  })

  describe('hasChargingStationPosition', () => {
    it('returns true when both coordinates are available', () => {
      const state = {
        charging_station_position_x: 5,
        charging_station_position_y: 10,
      }

      const result = hasChargingStationPosition(state)

      expect(result).toBe(true)
    })

    it('returns false when x coordinate is missing', () => {
      const state = {
        charging_station_position_y: 10,
      }

      const result = hasChargingStationPosition(state)

      expect(result).toBe(false)
    })

    it('returns false when y coordinate is missing', () => {
      const state = {
        charging_station_position_x: 5,
      }

      const result = hasChargingStationPosition(state)

      expect(result).toBe(false)
    })

    it('returns false when both coordinates are missing', () => {
      const state = {}

      const result = hasChargingStationPosition(state)

      expect(result).toBe(false)
    })

    it('returns true when coordinates are zero', () => {
      const state = {
        charging_station_position_x: 0,
        charging_station_position_y: 0,
      }

      const result = hasChargingStationPosition(state)

      expect(result).toBe(true)
    })

    it('returns false when x coordinate is null', () => {
      const state = {
        charging_station_position_x: null as unknown as number,
        charging_station_position_y: 10,
      }

      const result = hasChargingStationPosition(state)

      expect(result).toBe(false)
    })

    it('returns false when y coordinate is null', () => {
      const state = {
        charging_station_position_x: 5,
        charging_station_position_y: null as unknown as number,
      }

      const result = hasChargingStationPosition(state)

      expect(result).toBe(false)
    })
  })
})
