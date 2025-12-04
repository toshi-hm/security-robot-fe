import { describe, it, expect } from 'vitest'

import type { EnvironmentUpdateMessage } from '~/types/api'
import { updateRobotsFromMessage } from '~/utils/robotStateHelpers'

describe('robotStateHelpers', () => {
  describe('updateRobotsFromMessage', () => {
    it('should use default battery percentage of 0 when not provided in legacy mode', () => {
      const message: EnvironmentUpdateMessage = {
        type: 'environment_update',
        session_id: 1,
        episode: 1,
        step: 1,
        robot_position: { x: 1, y: 1 },
        // No battery_percentage provided
      }

      const robots = updateRobotsFromMessage(message)
      expect(robots).toHaveLength(1)
      expect(robots[0]!.batteryPercentage).toBe(0)
    })

    it('should use provided battery percentage in legacy mode', () => {
      const message: EnvironmentUpdateMessage = {
        type: 'environment_update',
        session_id: 1,
        episode: 1,
        step: 1,
        robot_position: { x: 1, y: 1 },
        battery_percentage: 85,
      }

      const robots = updateRobotsFromMessage(message)
      expect(robots).toHaveLength(1)
      expect(robots[0]!.batteryPercentage).toBe(85)
    })

    it('should handle multi-agent update correctly', () => {
      const message: EnvironmentUpdateMessage = {
        type: 'environment_update',
        session_id: 1,
        episode: 1,
        step: 1,
        robots: [
          {
            id: 1,
            x: 1,
            y: 1,
            orientation: 0,
            battery_percentage: 90,
            is_charging: false,
          },
        ],
      }

      const robots = updateRobotsFromMessage(message)
      expect(robots).toHaveLength(1)
      expect(robots[0]!.batteryPercentage).toBe(90)
    })
  })
})
