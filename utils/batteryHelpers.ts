/**
 * Battery system helper utilities
 * Provides helper functions for working with battery and charging station data
 */

export interface ChargingStationPosition {
  x: number
  y: number
}

/**
 * Gets charging station position from state object
 * @param state - Object containing charging_station_position_x and charging_station_position_y
 * @returns Position object with x and y coordinates, or null if position data is not available
 */
export function getChargingStationPosition(state: {
  charging_station_position_x?: number
  charging_station_position_y?: number
}): ChargingStationPosition | null {
  if (state.charging_station_position_x != null && state.charging_station_position_y != null) {
    return {
      x: state.charging_station_position_x,
      y: state.charging_station_position_y,
    }
  }
  return null
}

/**
 * Checks if charging station position is available
 * @param state - Object containing charging_station_position_x and charging_station_position_y
 * @returns true if both x and y coordinates are available
 */
export function hasChargingStationPosition(state: {
  charging_station_position_x?: number
  charging_station_position_y?: number
}): boolean {
  return state.charging_station_position_x != null && state.charging_station_position_y != null
}
