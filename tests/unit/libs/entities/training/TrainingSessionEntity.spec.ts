import { describe, expect, it } from 'vitest'

import { TrainingSession } from '~/libs/domains/training/TrainingSession'
import { TrainingSessionEntity, type TrainingSessionDTO } from '~/libs/entities/training/TrainingSessionEntity'

describe('TrainingSessionEntity', () => {
  const dto: TrainingSessionDTO = {
    id: 1,
    name: 'Session DTO',
    algorithm: 'ppo',
    environment_type: 'enhanced',
    status: 'running',
    total_timesteps: 10_000,
    current_timestep: 2_000,
    episodes_completed: 5,
    env_width: 12,
    env_height: 12,
    coverage_weight: 1,
    exploration_weight: 2,
    diversity_weight: 3,
    model_path: '/models/model.pt',
    config: { seed: 1 },
    created_at: '2024-01-01T00:00:00Z',
    started_at: '2024-01-01T01:00:00Z',
    completed_at: null,
  }

  it('converts DTO to domain model', () => {
    const session = TrainingSessionEntity.toDomain(dto)

    expect(session).toBeInstanceOf(TrainingSession)
    expect(session.name).toBe('Session DTO')
    expect(session.environmentType).toBe('enhanced')
    expect(session.createdAt?.toISOString()).toBe('2024-01-01T00:00:00.000Z')
  })

  it('converts domain model back to DTO', () => {
    const domain = TrainingSessionEntity.toDomain(dto)
    const converted = TrainingSessionEntity.fromDomain(domain)

    expect(converted).toMatchObject({
      id: 1,
      name: 'Session DTO',
      environment_type: 'enhanced',
      current_timestep: 2_000,
    })
    expect(converted.created_at).toBe('2024-01-01T00:00:00.000Z')
  })
})
