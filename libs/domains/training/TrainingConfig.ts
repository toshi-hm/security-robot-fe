import type { TrainingAlgorithm, TrainingEnvironmentType } from './TrainingSession'

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
}
