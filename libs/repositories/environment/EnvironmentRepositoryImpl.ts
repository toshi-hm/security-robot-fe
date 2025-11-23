import type { TrainingSessionCreateRequest } from '~/types/api'

import { API_ENDPOINTS } from '../../../configs/api'
import { TrainingSessionEntity, type TrainingSessionDTO } from '../../entities/training/TrainingSessionEntity'

import type { EnvironmentRepository } from './EnvironmentRepository'
import type { EnvironmentDefinition } from '../../domains/environment/Environment'
import type { TrainingConfig } from '../../domains/training/TrainingConfig'
import type { TrainingSession } from '../../domains/training/TrainingSession'
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

  async createSession(config: TrainingConfig): Promise<TrainingSession> {
    try {
      // Backend: POST /api/v1/environment/sessions
      // Note: Assuming this endpoint accepts TrainingSessionCreateRequest structure
      // similar to TrainingRepository.create
      const apiRequest: TrainingSessionCreateRequest = {
        name: config.name,
        algorithm: config.algorithm,
        environment_type: config.environmentType,
        total_timesteps: config.totalTimesteps,
        env_width: config.envWidth,
        env_height: config.envHeight,
        coverage_weight: config.coverageWeight,
        exploration_weight: config.explorationWeight,
        diversity_weight: config.diversityWeight,
        learning_rate: config.learningRate ?? 0.0003,
        batch_size: config.batchSize ?? 64,
        num_workers: config.numWorkers ?? 1,
      }

      const response = await $fetch<{ data: TrainingSessionDTO }>(API_ENDPOINTS.environment.sessions, {
        method: 'POST',
        body: apiRequest,
      })
      return TrainingSessionEntity.toDomain(response.data)
    } catch (error) {
      console.error('Failed to create environment session:', error)
      throw error
    }
  }
}
