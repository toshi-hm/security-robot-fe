import type { TrainingSession } from '../../domains/training/TrainingSession'

export type TrainingSessionEntity = TrainingSession & {
  progress: number
}
