import { describe, expect, it } from 'vitest'

import {
  DEFAULT_TRAINING_CONFIG,
  createTrainingConfig,
  validateTrainingConfig,
} from '~/libs/domains/training/TrainingConfig'

describe('TrainingConfig utilities', () => {
  it('creates config with overrides', () => {
    const config = createTrainingConfig({ name: 'Custom', envWidth: 12 })

    expect(config.name).toBe('Custom')
    expect(config.envWidth).toBe(12)
    expect(config.algorithm).toBe(DEFAULT_TRAINING_CONFIG.algorithm)
  })

  it('validates required name', () => {
    expect(() => validateTrainingConfig({ ...DEFAULT_TRAINING_CONFIG, name: '   ' })).toThrow(
      'Training session name is required'
    )
  })

  it('validates weight bounds', () => {
    expect(() =>
      validateTrainingConfig({
        ...DEFAULT_TRAINING_CONFIG,
        name: 'Valid Name',
        coverageWeight: 20,
      })
    ).toThrow('Coverage weight must be between 0 and 10')
  })

  it('validates learning rate bounds', () => {
    expect(() =>
      validateTrainingConfig({
        ...DEFAULT_TRAINING_CONFIG,
        name: 'Valid Name',
        learningRate: 1.5,
      })
    ).toThrow('Learning rate must be between 0.00001 and 1')

    expect(() =>
      validateTrainingConfig({
        ...DEFAULT_TRAINING_CONFIG,
        name: 'Valid Name',
        learningRate: 0,
      })
    ).toThrow('Learning rate must be between 0.00001 and 1')
  })

  it('validates batch size bounds', () => {
    expect(() =>
      validateTrainingConfig({
        ...DEFAULT_TRAINING_CONFIG,
        name: 'Valid Name',
        batchSize: 0,
      })
    ).toThrow('Batch size must be between 1 and 1024')

    expect(() =>
      validateTrainingConfig({
        ...DEFAULT_TRAINING_CONFIG,
        name: 'Valid Name',
        batchSize: 2000,
      })
    ).toThrow('Batch size must be between 1 and 1024')
  })

  it('validates num workers bounds', () => {
    expect(() =>
      validateTrainingConfig({
        ...DEFAULT_TRAINING_CONFIG,
        name: 'Valid Name',
        numWorkers: 0,
      })
    ).toThrow('Number of workers must be between 1 and 16')

    expect(() =>
      validateTrainingConfig({
        ...DEFAULT_TRAINING_CONFIG,
        name: 'Valid Name',
        numWorkers: 20,
      })
    ).toThrow('Number of workers must be between 1 and 16')
  })
})
