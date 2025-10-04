import type { EnvironmentDefinition } from '../../domains/environment/Environment'
import type { RobotState } from '../../domains/environment/RobotState'

export interface EnvironmentStateEntity {
  definition: EnvironmentDefinition
  robot: RobotState
  activeThreatLevel: number
}
