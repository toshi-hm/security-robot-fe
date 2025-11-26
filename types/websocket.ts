export interface TrainingProgressEvent {
  sessionId: string
  step: number
  reward: number
  coverage_ratio?: number
  exploration_score?: number
}
