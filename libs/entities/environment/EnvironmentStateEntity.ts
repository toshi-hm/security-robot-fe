import type { EnvironmentDefinition } from '../../domains/environment/Environment'
import type { RobotState } from '../../domains/environment/RobotState'

export interface EnvironmentStateEntity {
  definition: EnvironmentDefinition
  robot: RobotState
  robots: RobotState[] // Multi-Agent Support
  activeThreatLevel: number
  obstacles?: boolean[][]
}
