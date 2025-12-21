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
  numEnvs: {
    min: 1,
    max: 32,
    step: 1,
  },
  mapConfig: {
    count: {
      min: 1,
      max: 50,
    },
    initialWallProbability: {
      min: 0.0,
      max: 1.0,
      step: 0.01,
    },
  },
  batteryDrainRate: {
    min: 0.0,
    max: 1.0,
    step: 0.001,
    precision: 3,
  },
  threatPenaltyWeight: {
    min: 0.0,
    max: 100.0,
    step: 1.0,
  },
} as const

export type MapType = 'random' | 'maze' | 'room' | 'cave'

export interface MapConfig {
  mapType: MapType
  seed?: number
  count?: number // for random
  initialWallProbability?: number // for cave
}

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
  // Map Configuration
  mapConfig?: MapConfig
  // Additional training parameters (Backend required)
  learningRate?: number
  batchSize?: number
  numWorkers?: number
  numRobots?: number // Multi-Agent Support
  // Cycle 10 Params
  batteryDrainRate?: number
  threatPenaltyWeight?: number
  strategicInitMode?: boolean
  // GPU Optimization
  numEnvs?: number
  policyType?: 'MlpPolicy' | 'CnnPolicy'
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
  mapConfig: {
    mapType: 'random',
    count: 10,
  },
  learningRate: 0.0003,
  batchSize: 64,
  numWorkers: 1,
  numRobots: 1,
  batteryDrainRate: 0.001,
  threatPenaltyWeight: 0.0,
  strategicInitMode: false,
  numEnvs: 1,
  policyType: 'MlpPolicy',
}

export const createTrainingConfig = (overrides: Partial<TrainingConfig> = {}): TrainingConfig => ({
  ...DEFAULT_TRAINING_CONFIG,
  ...overrides,
  mapConfig: {
    ...DEFAULT_TRAINING_CONFIG.mapConfig,
    ...(overrides.mapConfig || {}),
  } as MapConfig,
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

  // Map Config Validation
  if (config.mapConfig) {
    if (config.mapConfig.mapType === 'random') {
      if (config.mapConfig.count === undefined || config.mapConfig.count === null) {
        throw new Error('Obstacle count is required for random map type')
      }
      if (
        config.mapConfig.count < TRAINING_CONSTRAINTS.mapConfig.count.min ||
        config.mapConfig.count > TRAINING_CONSTRAINTS.mapConfig.count.max
      ) {
        throw new Error(
          `Obstacle count must be between ${TRAINING_CONSTRAINTS.mapConfig.count.min} and ${TRAINING_CONSTRAINTS.mapConfig.count.max}`
        )
      }
    }

    if (config.mapConfig.mapType === 'cave') {
      if (
        config.mapConfig.initialWallProbability !== undefined &&
        (config.mapConfig.initialWallProbability < TRAINING_CONSTRAINTS.mapConfig.initialWallProbability.min ||
          config.mapConfig.initialWallProbability > TRAINING_CONSTRAINTS.mapConfig.initialWallProbability.max)
      ) {
        throw new Error(
          `Initial wall probability must be between ${TRAINING_CONSTRAINTS.mapConfig.initialWallProbability.min} and ${TRAINING_CONSTRAINTS.mapConfig.initialWallProbability.max}`
        )
      }
    }
  }

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

  if (config.numRobots !== undefined) {
    if (config.numRobots < 1 || config.numRobots > 10) {
      throw new Error('Number of robots must be between 1 and 10')
    }
  }

  if (config.batteryDrainRate !== undefined) {
    if (
      config.batteryDrainRate < TRAINING_CONSTRAINTS.batteryDrainRate.min ||
      config.batteryDrainRate > TRAINING_CONSTRAINTS.batteryDrainRate.max
    ) {
      throw new Error(
        `Battery drain rate must be between ${TRAINING_CONSTRAINTS.batteryDrainRate.min} and ${TRAINING_CONSTRAINTS.batteryDrainRate.max}`
      )
    }
  }

  if (config.threatPenaltyWeight !== undefined) {
    if (
      config.threatPenaltyWeight < TRAINING_CONSTRAINTS.threatPenaltyWeight.min ||
      config.threatPenaltyWeight > TRAINING_CONSTRAINTS.threatPenaltyWeight.max
    ) {
      throw new Error(
        `Threat penalty weight must be between ${TRAINING_CONSTRAINTS.threatPenaltyWeight.min} and ${TRAINING_CONSTRAINTS.threatPenaltyWeight.max}`
      )
    }
  }

  if (config.numEnvs !== undefined) {
    if (config.numEnvs < TRAINING_CONSTRAINTS.numEnvs.min || config.numEnvs > TRAINING_CONSTRAINTS.numEnvs.max) {
      throw new Error(
        `Number of parallel environments must be between ${TRAINING_CONSTRAINTS.numEnvs.min} and ${TRAINING_CONSTRAINTS.numEnvs.max}`
      )
    }
  }
}
