export interface TrainingMetricPoint {
  step: number
  reward: number
  loss: number
  timestamp: string
}

export interface TrainingMetrics {
  sessionId: string
  points: TrainingMetricPoint[]
}
