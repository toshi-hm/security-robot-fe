import { describe, expect, it } from 'vitest'

import { DEFAULT_TRAINING_CONFIG, createTrainingConfig, validateTrainingConfig } from '~/libs/domains/training/TrainingConfig'

describe('TrainingConfig utilities', () => {
  it('creates config with overrides', () => {
    const config = createTrainingConfig({ name: 'Custom', envWidth: 12 })

    expect(config.name).toBe('Custom')
    expect(config.envWidth).toBe(12)
    expect(config.algorithm).toBe(DEFAULT_TRAINING_CONFIG.algorithm)
  })

  it('validates required name', () => {
    expect(() => validateTrainingConfig({ ...DEFAULT_TRAINING_CONFIG, name: '   ' })).toThrow(
      'Training session name is required',
    )
  })

  it('validates weight bounds', () => {
    expect(() =>
      validateTrainingConfig({
        ...DEFAULT_TRAINING_CONFIG,
        name: 'Valid Name',
        coverageWeight: 20,
      }),
    ).toThrow('Coverage weight must be between 0 and 10')
  })
})
