import { describe, expect, it } from 'vitest'

import { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'
import { TrainingMetricsEntity, type TrainingMetricsDTO } from '~/libs/entities/training/TrainingMetricsEntity'

describe('TrainingMetricsEntity', () => {
  const dto: TrainingMetricsDTO = {
    id: 10,
    session_id: 1,
    timestep: 100,
    episode: 5,
    reward: 50,
    loss: 0.05,
    coverage_ratio: 0.85,
    exploration_score: 0.6,
    timestamp: '2024-01-01T00:00:00Z',
  }

  it('converts DTO to domain model', () => {
    const domain = TrainingMetricsEntity.toDomain(dto)

    expect(domain).toBeInstanceOf(TrainingMetrics)
    expect(domain.coverageRatio).toBe(0.85)
    expect(domain.timestamp?.toISOString()).toBe('2024-01-01T00:00:00.000Z')
  })

  it('converts domain to DTO', () => {
    const domain = TrainingMetricsEntity.toDomain(dto)
    const converted = TrainingMetricsEntity.fromDomain(domain)

    expect(converted).toMatchObject({
      id: 10,
      session_id: 1,
      coverage_ratio: 0.85,
    })
    expect(converted.timestamp).toBe('2024-01-01T00:00:00.000Z')
  })
})
