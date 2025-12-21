import { API_ENDPOINTS } from '~/configs/api'
import type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'
import type { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'
import type { TrainingSession } from '~/libs/domains/training/TrainingSession'
import { TrainingMetricsEntity, type TrainingMetricsDTO } from '~/libs/entities/training/TrainingMetricsEntity'
import { TrainingSessionEntity, type TrainingSessionDTO } from '~/libs/entities/training/TrainingSessionEntity'
import type { TrainingSessionCreateRequest, ApiError } from '~/types/api'

import type { TrainingRepository } from './TrainingRepository'

/**
 * 学習リポジトリ実装
 *
 * Backend API実装に基づいて実装
 * API responses follow pagination pattern: { total, page, page_size, data: [...] }
 */

/**
 * $fetchのオプション型
 * Nuxt/Nitroの$fetchに対応
 */
interface FetchOptions {
  method?:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'OPTIONS'
    | 'get'
    | 'post'
    | 'put'
    | 'delete'
    | 'patch'
    | 'head'
    | 'options'
  body?: BodyInit | Record<string, any> | null
  params?: Record<string, unknown>
  signal?: AbortSignal
  [key: string]: unknown
}

/**
 * リトライ付きfetch関数
 * ネットワーク不安定時に自動的にリトライする
 *
 * @param url - リクエストURL
 * @param options - $fetchのオプション (method, body, params等)
 * @param maxRetries - 最大リトライ回数
 * @param delayMs - 初期リトライ遅延(ms)
 * @param timeoutMs - タイムアウト時間(ms)
 */
async function fetchWithRetry<T>(
  url: string,
  options?: FetchOptions,
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
      } catch (fetchError) {
        clearTimeout(timeoutId)

        // AbortError（タイムアウト）の場合
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('API応答タイムアウト。Worker が起動していない可能性があります。')
        }

        throw fetchError
      }
    } catch (error) {
      const apiError = error as ApiError

      // 最後のリトライの場合はエラーをスロー
      if (i === maxRetries - 1) {
        throw error
      }

      // クライアントエラー(4xx)の場合はリトライしない
      if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
        throw error
      }

      // タイムアウトエラーはリトライしない
      if (apiError.message && apiError.message.includes('タイムアウト')) {
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
      // Convert camelCase to snake_case for backend API
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
        num_robots: config.numRobots ?? 1, // Multi-Agent Support
        num_envs: config.numEnvs ?? 1, // GPU Optimization
        policy_type: config.policyType ?? 'MlpPolicy',
        config: {
          ...(config.mapConfig
            ? {
                map_config: {
                  map_type: config.mapConfig.mapType,
                  seed: config.mapConfig.seed,
                  count: config.mapConfig.count,
                  initial_wall_probability: config.mapConfig.initialWallProbability,
                },
              }
            : {}),
          // Additional Params
          strategic_init_mode: config.strategicInitMode,
          battery_drain_rate: config.batteryDrainRate,
          threat_penalty_weight: config.threatPenaltyWeight,
        },
      }

      // Backend: POST /api/v1/training/start
      const response = await fetchWithRetry<TrainingSessionDTO>(
        API_ENDPOINTS.training.start,
        {
          method: 'POST',
          body: apiRequest,
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
