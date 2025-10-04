import type { TrainingConfig } from '../../domains/training/TrainingConfig'
import type { TrainingMetricsEntity } from '../../entities/training/TrainingMetricsEntity'
import type { TrainingSessionEntity } from '../../entities/training/TrainingSessionEntity'

export interface TrainingRepository {
  listSessions(): Promise<TrainingSessionEntity[]>
  startSession(config: TrainingConfig): Promise<TrainingSessionEntity>
  fetchMetrics(sessionId: string): Promise<TrainingMetricsEntity>
}
