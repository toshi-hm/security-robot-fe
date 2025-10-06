import type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'

export type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'
export type {
  TrainingAlgorithm,
  TrainingEnvironmentType,
  TrainingStatus,
} from '~/libs/domains/training/TrainingSession'
export type { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'

export type TrainingStartPayload = TrainingConfig
