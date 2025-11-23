import type { EnvironmentDefinition } from '../../domains/environment/Environment'
import type { TrainingConfig } from '../../domains/training/TrainingConfig'
import type { TrainingSession } from '../../domains/training/TrainingSession'
import type { EnvironmentStateEntity } from '../../entities/environment/EnvironmentStateEntity'

export interface EnvironmentRepository {
  listEnvironments(): Promise<EnvironmentDefinition[]>
  fetchState(environmentId: string): Promise<EnvironmentStateEntity>
  createSession(config: TrainingConfig): Promise<TrainingSession>
}
