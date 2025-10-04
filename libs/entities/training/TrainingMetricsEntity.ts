import type { TrainingMetrics } from '../../domains/training/TrainingMetrics'

export interface TrainingMetricsEntity extends TrainingMetrics {
  rollingAverageReward: number[]
}
