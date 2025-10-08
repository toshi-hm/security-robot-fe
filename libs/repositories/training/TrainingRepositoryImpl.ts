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
 * Backend API実装に基づいて実装
 * API responses follow pagination pattern: { total, page, page_size, data: [...] }
 */
export class TrainingRepositoryImpl implements TrainingRepository {
  async findAll(): Promise<TrainingSession[]> {
    try {
      // Backend: GET /api/v1/training/list?page=1&page_size=20
      const response = await $fetch<{
        total: number
        page: number
        page_size: number
        sessions: TrainingSessionDTO[]
      }>(API_ENDPOINTS.training.list, {
        params: {
          page: 1,
          page_size: 100, // Get more sessions at once
        },
      })
      return response.sessions.map((dto) => TrainingSessionEntity.toDomain(dto))
    } catch (error) {
      console.error('Failed to fetch training sessions:', error)
      throw error
    }
  }

  async findById(id: number): Promise<TrainingSession | null> {
    try {
      // Backend: GET /api/v1/training/{session_id}/status
      const response = await $fetch<TrainingSessionDTO>(API_ENDPOINTS.training.status(id))
      return TrainingSessionEntity.toDomain(response)
    } catch (error) {
      console.error(`Failed to fetch training session ${id}:`, error)
      return null
    }
  }

  async create(config: TrainingConfig): Promise<TrainingSession> {
    try {
      // Backend: POST /api/v1/training/start
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
      // Backend: POST /api/v1/training/{session_id}/stop
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
      // Backend: GET /api/v1/training/sessions/{session_id}/metrics?page=1&page_size=50
      const response = await $fetch<{
        total: number
        page: number
        page_size: number
        metrics: TrainingMetricsDTO[]
      }>(API_ENDPOINTS.training.metrics(id), {
        params: {
          page: 1,
          page_size: limit,
        },
      })
      return response.metrics.map((dto) => TrainingMetricsEntity.toDomain(dto))
    } catch (error) {
      console.error(`Failed to fetch metrics for session ${id}:`, error)
      throw error
    }
  }
}
