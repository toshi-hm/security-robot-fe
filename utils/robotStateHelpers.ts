import type { RobotState } from '~/libs/domains/environment/RobotState'
import type { EnvironmentUpdateMessage } from '~/types/api'

/**
 * EnvironmentUpdateMessageからロボットの状態リストを更新する
 *
 * @param message WebSocketからの更新メッセージ
 * @returns 更新されたRobotStateの配列。ロボット情報がない場合は空配列を返す。
 */
export const updateRobotsFromMessage = (message: EnvironmentUpdateMessage): RobotState[] => {
  // Multi-agent update
  if (message.robots && Array.isArray(message.robots)) {
    return message.robots.map((r) => ({
      id: r.id,
      x: r.x,
      y: r.y,
      orientation: r.orientation,
      batteryPercentage: r.battery_percentage,
      isCharging: r.is_charging,
      actionTaken: r.action_taken ?? undefined,
    }))
  }

  // Legacy single robot update
  if (message.robot_position) {
    const robotPos = Array.isArray(message.robot_position)
      ? { x: message.robot_position[0] ?? 0, y: message.robot_position[1] ?? 0 }
      : message.robot_position

    const newPosition = {
      x: robotPos.x ?? 0,
      y: robotPos.y ?? 0,
    }

    const orientationFromPayload =
      (!Array.isArray(message.robot_position) && typeof robotPos.orientation === 'number'
        ? robotPos.orientation
        : null) ?? (typeof message.robot_orientation === 'number' ? message.robot_orientation : null)

    return [
      {
        id: 0,
        x: newPosition.x,
        y: newPosition.y,
        orientation: orientationFromPayload ?? 0,
        batteryPercentage: typeof message.battery_percentage === 'number' ? message.battery_percentage : 0,
        isCharging: typeof message.is_charging === 'boolean' ? message.is_charging : false,
        actionTaken: typeof message.action_taken === 'number' ? message.action_taken : undefined,
      },
    ]
  }

  // No robot info found
  return []
}
