import type { TrainingAlgorithm, TrainingEnvironmentType } from './TrainingSession'
/**
 * Training parameter constraints
 * Used for both domain validation and UI component configuration
 */
export const TRAINING_CONSTRAINTS = {
  learningRate: {
    min: 0.00001,
    max: 1,
    step: 0.0001,
    precision: 5,
  },
  batchSize: {
    min: 1,
    max: 1024,
    step: 1,
  },
  numWorkers: {
    min: 1,
    max: 16,
    step: 1,
  },
} as const

export interface TrainingConfig {
  name: string
  algorithm: TrainingAlgorithm
  environmentType: TrainingEnvironmentType
  totalTimesteps: number
  envWidth: number
  envHeight: number
  coverageWeight: number
  explorationWeight: number
  diversityWeight: number
  // Additional training parameters (Backend required)
  learningRate?: number
  batchSize?: number
  numWorkers?: number
}

export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  name: '',
  algorithm: 'ppo',
  environmentType: 'standard',
  totalTimesteps: 10000,
  envWidth: 8,
  envHeight: 8,
  coverageWeight: 1.5,
  explorationWeight: 3.0,
  diversityWeight: 2.0,
  learningRate: 0.0003,
  batchSize: 64,
  numWorkers: 1,
}

export const createTrainingConfig = (overrides: Partial<TrainingConfig> = {}): TrainingConfig => ({
  ...DEFAULT_TRAINING_CONFIG,
  ...overrides,
})

export const validateTrainingConfig = (config: TrainingConfig): void => {
  if (!config.name.trim()) {
    throw new Error('Training session name is required')
  }

  if (config.totalTimesteps < 1000) {
    throw new Error('Total timesteps must be at least 1000')
  }

  if (config.envWidth < 5 || config.envWidth > 50) {
    throw new Error('Environment width must be between 5 and 50')
  }

  if (config.envHeight < 5 || config.envHeight > 50) {
    throw new Error('Environment height must be between 5 and 50')
  }

  const weights: Array<[string, number]> = [
    ['Coverage weight', config.coverageWeight],
    ['Exploration weight', config.explorationWeight],
    ['Diversity weight', config.diversityWeight],
  ]

  weights.forEach(([label, value]) => {
    if (value < 0 || value > 10) {
      throw new Error(`${label} must be between 0 and 10`)
    }
  })

  // 追加パラメータのバリデーション
  if (config.learningRate !== undefined) {
    if (
      config.learningRate < TRAINING_CONSTRAINTS.learningRate.min ||
      config.learningRate > TRAINING_CONSTRAINTS.learningRate.max
    ) {
      throw new Error(
        `Learning rate must be between ${TRAINING_CONSTRAINTS.learningRate.min} and ${TRAINING_CONSTRAINTS.learningRate.max}`
      )
    }
  }

  if (config.batchSize !== undefined) {
    if (
      config.batchSize < TRAINING_CONSTRAINTS.batchSize.min ||
      config.batchSize > TRAINING_CONSTRAINTS.batchSize.max
    ) {
      throw new Error(
        `Batch size must be between ${TRAINING_CONSTRAINTS.batchSize.min} and ${TRAINING_CONSTRAINTS.batchSize.max}`
      )
    }
  }

  if (config.numWorkers !== undefined) {
    if (
      config.numWorkers < TRAINING_CONSTRAINTS.numWorkers.min ||
      config.numWorkers > TRAINING_CONSTRAINTS.numWorkers.max
    ) {
      throw new Error(
        `Number of workers must be between ${TRAINING_CONSTRAINTS.numWorkers.min} and ${TRAINING_CONSTRAINTS.numWorkers.max}`
      )
    }
  }
}
