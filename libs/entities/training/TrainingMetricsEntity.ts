import { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'

export interface TrainingMetricsDTO {
  id: number
  session_id: number
  timestep: number
  episode: number
  reward: number
  loss: number
  coverage_ratio: number
  exploration_score: number
  timestamp?: string | null
}

export class TrainingMetricsEntity {
  static toDomain(dto: TrainingMetricsDTO): TrainingMetrics {
    return new TrainingMetrics(
      dto.id,
      dto.session_id,
      dto.timestep,
      dto.episode,
      dto.reward,
      dto.loss,
      dto.coverage_ratio,
      dto.exploration_score,
      dto.timestamp ? new Date(dto.timestamp) : undefined
    )
  }

  static fromDomain(domain: TrainingMetrics): TrainingMetricsDTO {
    return {
      id: domain.id,
      session_id: domain.sessionId,
      timestep: domain.timestep,
      episode: domain.episode,
      reward: domain.reward,
      loss: domain.loss,
      coverage_ratio: domain.coverageRatio,
      exploration_score: domain.explorationScore,
      timestamp: domain.timestamp?.toISOString() ?? null,
    }
  }
}
