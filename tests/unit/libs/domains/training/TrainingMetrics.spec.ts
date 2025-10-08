import { describe, expect, it } from 'vitest'

import { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'

type MetricsOverrides = {
  id?: number
  sessionId?: number
  timestep?: number
  episode?: number
  reward?: number
  loss?: number
  coverageRatio?: number
  explorationScore?: number
  timestamp?: Date
}

describe('TrainingMetrics', () => {
  const createMetrics = (overrides: MetricsOverrides = {}) =>
    new TrainingMetrics(
      overrides.id ?? 1,
      overrides.sessionId ?? 2,
      overrides.timestep ?? 10,
      overrides.episode ?? 1,
      overrides.reward ?? 25,
      overrides.loss ?? 0.02,
      overrides.coverageRatio ?? 0.75,
      overrides.explorationScore ?? 0.5,
      overrides.timestamp ?? new Date('2024-01-01T00:00:00Z')
    )

  it('returns coverage percentage rounded', () => {
    const metrics = createMetrics({ coverageRatio: 0.755 })

    expect(metrics.coveragePercentage).toBe(76)
  })

  it('returns ISO timestamp when available', () => {
    const metrics = createMetrics()

    expect(metrics.isoTimestamp).toBe('2024-01-01T00:00:00.000Z')
  })

  it('validates coverage ratio range', () => {
    expect(() => createMetrics({ coverageRatio: 1.5 })).toThrow('Coverage ratio must be between 0 and 1')
  })

  it('validates exploration score range', () => {
    expect(() => createMetrics({ explorationScore: -0.2 })).toThrow('Exploration score must be between 0 and 1')
  })
})
