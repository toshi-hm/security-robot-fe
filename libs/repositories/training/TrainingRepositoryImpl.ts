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
/**
 * リトライ付きfetch関数
 * ネットワーク不安定時に自動的にリトライする
 */
async function fetchWithRetry<T>(
  url: string,
  options?: any,
  maxRetries: number = 3,
  delayMs: number = 1000,
  timeoutMs: number = 10000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // AbortControllerでタイムアウトを実装
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const response = await $fetch<T>(url, {
          ...options,
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        return response
      } catch (fetchError: any) {
        clearTimeout(timeoutId)

        // AbortError（タイムアウト）の場合
        if (fetchError.name === 'AbortError') {
          throw new Error('API応答タイムアウト。Worker が起動していない可能性があります。')
        }

        throw fetchError
      }
    } catch (error: any) {
      // 最後のリトライの場合はエラーをスロー
      if (i === maxRetries - 1) {
        throw error
      }

      // クライアントエラー(4xx)の場合はリトライしない
      if (error?.status && error.status >= 400 && error.status < 500) {
        throw error
      }

      // タイムアウトエラーはリトライしない
      if (error.message && error.message.includes('タイムアウト')) {
        throw error
      }

      // 指数バックオフで待機
      const backoffDelay = delayMs * Math.pow(2, i)
      console.warn(`Request failed, retrying in ${backoffDelay}ms... (attempt ${i + 1}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, backoffDelay))
    }
  }

  // TypeScriptの型チェック用（実際にはここに到達しない）
  throw new Error('fetchWithRetry failed')
}

export class TrainingRepositoryImpl implements TrainingRepository {
  async findAll(): Promise<TrainingSession[]> {
    try {
      // Backend: GET /api/v1/training/list?page=1&page_size=20
      const response = await fetchWithRetry<{
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
      const response = await fetchWithRetry<TrainingSessionDTO>(API_ENDPOINTS.training.status(id))
      return TrainingSessionEntity.toDomain(response)
    } catch (error) {
      console.error(`Failed to fetch training session ${id}:`, error)
      return null
    }
  }

  async create(config: TrainingConfig): Promise<TrainingSession> {
    try {
      // Backend: POST /api/v1/training/start
      const response = await fetchWithRetry<TrainingSessionDTO>(
        API_ENDPOINTS.training.start,
        {
          method: 'POST',
          body: config,
        },
        2 // POSTリクエストは2回までリトライ（createは冪等でない可能性があるため）
      )
      return TrainingSessionEntity.toDomain(response)
    } catch (error) {
      console.error('Failed to create training session:', error)
      throw error
    }
  }

  async stop(id: number): Promise<boolean> {
    try {
      // Backend: POST /api/v1/training/{session_id}/stop
      await fetchWithRetry(
        API_ENDPOINTS.training.stop(id),
        {
          method: 'POST',
        },
        2 // POSTリクエストは2回までリトライ
      )
      return true
    } catch (error) {
      console.error(`Failed to stop training session ${id}:`, error)
      return false
    }
  }

  async getMetrics(id: number, limit: number = 100): Promise<TrainingMetrics[]> {
    try {
      // Backend: GET /api/v1/training/sessions/{session_id}/metrics?page=1&page_size=50
      const response = await fetchWithRetry<{
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
