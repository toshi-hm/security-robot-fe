import { API_ENDPOINTS } from '../../../configs/api'

import type { EnvironmentRepository } from './EnvironmentRepository'
import type { EnvironmentDefinition } from '../../domains/environment/Environment'
import type { EnvironmentStateEntity } from '../../entities/environment/EnvironmentStateEntity'

/**
 * Environment Repository Implementation
 *
 * Backend API実装に基づいて実装
 * API responses are wrapped in { data: ... } pattern
 */
export class EnvironmentRepositoryImpl implements EnvironmentRepository {
  async listEnvironments(): Promise<EnvironmentDefinition[]> {
    try {
      // Backend: GET /api/v1/environment/definitions
      const response = await $fetch<{ data: EnvironmentDefinition[] }>(API_ENDPOINTS.environment.definitions)
      return response.data
    } catch (error) {
      console.error('Failed to fetch environment definitions:', error)
      throw error
    }
  }

  async fetchState(environmentId: string): Promise<EnvironmentStateEntity> {
    try {
      // Backend: GET /api/v1/environment/definitions/{environment_id}/state
      const response = await $fetch<{ data: EnvironmentStateEntity }>(API_ENDPOINTS.environment.state(environmentId))
      return response.data
    } catch (error) {
      console.error(`Failed to fetch environment state for ${environmentId}:`, error)
      throw error
    }
  }

  async createSession(config: any): Promise<any> {
    try {
      // Backend: POST /api/v1/environment/sessions
      const response = await $fetch<{ data: any }>(API_ENDPOINTS.environment.sessions, {
        method: 'POST',
        body: config,
      })
      return response.data
    } catch (error) {
      console.error('Failed to create environment session:', error)
      throw error
    }
  }
}
