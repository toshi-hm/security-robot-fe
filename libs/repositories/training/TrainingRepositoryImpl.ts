import { API_ENDPOINTS } from '~/configs/api'
import type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'
import type { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'
import type { TrainingSession } from '~/libs/domains/training/TrainingSession'
import { TrainingMetricsEntity, type TrainingMetricsDTO } from '~/libs/entities/training/TrainingMetricsEntity'
import { TrainingSessionEntity, type TrainingSessionDTO } from '~/libs/entities/training/TrainingSessionEntity'

import type { TrainingRepository } from './TrainingRepository'

/**
 * 学習リポジトリ実装
 *
 * 実際のAPI通信を行う
 */
export class TrainingRepositoryImpl implements TrainingRepository {
  async findAll(): Promise<TrainingSession[]> {
    try {
      const response = await $fetch<TrainingSessionDTO[]>(API_ENDPOINTS.training.sessions)
      return response.map((dto) => TrainingSessionEntity.toDomain(dto))
    } catch (error) {
      console.error('Failed to fetch training sessions:', error)
      throw error
    }
  }

  async findById(id: number): Promise<TrainingSession | null> {
    try {
      const response = await $fetch<TrainingSessionDTO>(API_ENDPOINTS.training.status(id))
      return TrainingSessionEntity.toDomain(response)
    } catch (error) {
      console.error(`Failed to fetch training session ${id}:`, error)
      return null
    }
  }

  async create(config: TrainingConfig): Promise<TrainingSession> {
    try {
      const response = await $fetch<TrainingSessionDTO>(API_ENDPOINTS.training.start, {
        method: 'POST',
        body: config,
      })
      return TrainingSessionEntity.toDomain(response)
    } catch (error) {
      console.error('Failed to create training session:', error)
      throw error
    }
  }

  async stop(id: number): Promise<boolean> {
    try {
      await $fetch(API_ENDPOINTS.training.stop(id), {
        method: 'POST',
      })
      return true
    } catch (error) {
      console.error(`Failed to stop training session ${id}:`, error)
      return false
    }
  }

  async getMetrics(id: number, limit: number = 100): Promise<TrainingMetrics[]> {
    try {
      const response = await $fetch<TrainingMetricsDTO[]>(API_ENDPOINTS.training.metrics(id), {
        params: { limit },
      })
      return response.map((dto) => TrainingMetricsEntity.toDomain(dto))
    } catch (error) {
      console.error(`Failed to fetch metrics for session ${id}:`, error)
      throw error
    }
  }
}
