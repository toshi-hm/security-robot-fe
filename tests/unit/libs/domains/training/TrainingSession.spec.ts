import { describe, expect, it } from 'vitest'

import {
  TrainingSession,
  type TrainingAlgorithm,
  type TrainingEnvironmentType,
  type TrainingStatus,
} from '~/libs/domains/training/TrainingSession'

type SessionOverrides = {
  id?: number
  name?: string
  algorithm?: TrainingAlgorithm
  environmentType?: TrainingEnvironmentType
  status?: TrainingStatus
  totalTimesteps?: number
  currentTimestep?: number
  episodesCompleted?: number
  envWidth?: number
  envHeight?: number
  coverageWeight?: number
  explorationWeight?: number
  diversityWeight?: number
  modelPath?: string | null
  config?: Record<string, unknown> | null
  createdAt?: Date
  startedAt?: Date
  completedAt?: Date | null
}

describe('TrainingSession', () => {
  const createSession = (overrides: SessionOverrides = {}) => {
    return new TrainingSession(
      overrides.id ?? 1,
      overrides.name ?? 'Test Session',
      overrides.algorithm ?? 'ppo',
      overrides.environmentType ?? 'standard',
      overrides.status ?? 'running',
      overrides.totalTimesteps ?? 10_000,
      overrides.currentTimestep ?? 5_000,
      overrides.episodesCompleted ?? 20,
      overrides.envWidth ?? 10,
      overrides.envHeight ?? 10,
      overrides.coverageWeight ?? 1,
      overrides.explorationWeight ?? 2,
      overrides.diversityWeight ?? 3,
      overrides.createdAt ?? new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z'), // updatedAt
      null, // learningRate
      null, // batchSize
      null, // mapConfig
      overrides.modelPath ?? null,
      overrides.config ?? null,
      overrides.startedAt,
      overrides.completedAt ?? null
    )
  }

  it('calculates progress as percentage', () => {
    const session = createSession({ currentTimestep: 7_500, totalTimesteps: 10_000 })

    expect(session.progress).toBe(75)
  })

  it('returns progress of 100 when completed', () => {
    const session = createSession({ currentTimestep: 10_000, totalTimesteps: 10_000 })

    expect(session.progress).toBe(100)
  })

  it('returns duration when started and not completed', () => {
    const now = new Date('2024-01-02T01:00:00Z')
    const startedAt = new Date('2024-01-02T00:00:00Z')
    const session = createSession({
      startedAt,
      completedAt: null,
    })

    const originalDate = global.Date
    global.Date = class extends Date {
      constructor() {
        super()
        return now
      }
    } as DateConstructor

    expect(session.duration).toBe(now.getTime() - startedAt.getTime())

    global.Date = originalDate
  })

  it('returns algorithm display name in uppercase', () => {
    const session = createSession({ algorithm: 'a3c' })

    expect(session.algorithmDisplayName).toBe('A3C')
  })

  it('validates total timesteps minimum', () => {
    expect(() =>
      createSession({
        totalTimesteps: 500,
      })
    ).toThrow('Total timesteps must be at least 1000')
  })

  it('validates environment width range', () => {
    expect(() =>
      createSession({
        envWidth: 3,
      })
    ).toThrow('Environment width must be between 5 and 50')
  })

  it('validates weight range', () => {
    expect(() =>
      createSession({
        coverageWeight: 20,
      })
    ).toThrow('Coverage weight must be between 0 and 10')
  })
})
