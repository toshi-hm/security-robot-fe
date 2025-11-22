import type { EnvironmentDefinition } from '../../domains/environment/Environment'
import type { EnvironmentStateEntity } from '../../entities/environment/EnvironmentStateEntity'

export interface EnvironmentRepository {
  listEnvironments(): Promise<EnvironmentDefinition[]>
  fetchState(environmentId: string): Promise<EnvironmentStateEntity>
  createSession(config: any): Promise<any> // TODO: Define proper types for session creation
}
