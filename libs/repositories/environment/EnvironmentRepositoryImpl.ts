import { API_ENDPOINTS } from '../../../configs/api'
import type { EnvironmentDefinition } from '../../domains/environment/Environment'
import type { EnvironmentStateEntity } from '../../entities/environment/EnvironmentStateEntity'
import type { EnvironmentRepository } from './EnvironmentRepository'

export class EnvironmentRepositoryImpl implements EnvironmentRepository {
  async listEnvironments(): Promise<EnvironmentDefinition[]> {
    return await $fetch(`${API_ENDPOINTS.environment}/definitions`)
  }

  async fetchState(environmentId: string): Promise<EnvironmentStateEntity> {
    return await $fetch(`${API_ENDPOINTS.environment}/definitions/${environmentId}/state`)
  }
}
