import { API_ENDPOINTS } from '../../../configs/api'
import type { TrainingConfig } from '../../domains/training/TrainingConfig'
import type { TrainingMetricsEntity } from '../../entities/training/TrainingMetricsEntity'
import type { TrainingSessionEntity } from '../../entities/training/TrainingSessionEntity'
import type { TrainingRepository } from './TrainingRepository'

export class TrainingRepositoryImpl implements TrainingRepository {
  async listSessions(): Promise<TrainingSessionEntity[]> {
    return await $fetch(`${API_ENDPOINTS.training}/sessions`)
  }

  async startSession(config: TrainingConfig): Promise<TrainingSessionEntity> {
    return await $fetch(`${API_ENDPOINTS.training}/sessions`, {
      method: 'POST',
      body: config,
    })
  }

  async fetchMetrics(sessionId: string): Promise<TrainingMetricsEntity> {
    return await $fetch(`${API_ENDPOINTS.training}/sessions/${sessionId}/metrics`)
  }
}
