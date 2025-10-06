import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_TRAINING_CONFIG } from '~/libs/domains/training/TrainingConfig'
import { TrainingSession } from '~/libs/domains/training/TrainingSession'

const findAll = vi.fn()
const create = vi.fn()
const stop = vi.fn()
const getMetrics = vi.fn()

const mockRepository = {
  findAll,
  findById: vi.fn(),
  create,
  stop,
  getMetrics,
}

vi.mock('~/libs/repositories/training/TrainingRepositoryImpl', () => ({
  TrainingRepositoryImpl: vi.fn(() => mockRepository),
}))

describe('useTraining', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  const loadComposable = async () => {
    const { useTraining } = await import('~/composables/useTraining')
    return useTraining()
  }

  const createSession = () =>
    new TrainingSession(
      1,
      'Session',
      'ppo',
      'standard',
      'running',
      10_000,
      5_000,
      10,
      10,
      10,
      1,
      2,
      3,
      null,
      null,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T01:00:00Z'),
      null,
    )

  it('fetches sessions and populates refs', async () => {
    const composable = await loadComposable()
    findAll.mockResolvedValue([createSession()])

    await composable.fetchSessions()

    expect(composable.sessions.value).toHaveLength(1)
    expect(composable.activeSessions.value).toHaveLength(1)
    expect(composable.error.value).toBeNull()
    expect(composable.isLoading.value).toBe(false)
  })

  it('handles fetch errors', async () => {
    const composable = await loadComposable()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    findAll.mockRejectedValue(new Error('fail'))

    await composable.fetchSessions()

    expect(composable.error.value).toBe('Failed to fetch training sessions')

    consoleSpy.mockRestore()
  })

  it('creates a session and sets current session', async () => {
    const composable = await loadComposable()
    const session = createSession()
    create.mockResolvedValue(session)

    const result = await composable.createSession({
      ...DEFAULT_TRAINING_CONFIG,
      name: 'New Session',
    })

    expect(result).toBe(session)
    expect(composable.sessions.value[0]?.id).toBe(session.id)
    expect(composable.currentSession.value?.id).toBe(session.id)
  })

  it('handles create errors', async () => {
    const composable = await loadComposable()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    create.mockRejectedValue(new Error('fail'))

    const result = await composable.createSession({
      ...DEFAULT_TRAINING_CONFIG,
      name: 'Error',
    })

    expect(result).toBeNull()
    expect(composable.error.value).toBe('Failed to create training session')

    consoleSpy.mockRestore()
  })

  it('stops session and refreshes list on success', async () => {
    const composable = await loadComposable()
    stop.mockResolvedValue(true)
    findAll.mockResolvedValue([createSession()])

    const success = await composable.stopSession(1)

    expect(success).toBe(true)
    expect(findAll).toHaveBeenCalled()
  })

  it('handles stop errors', async () => {
    const composable = await loadComposable()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    stop.mockRejectedValue(new Error('fail'))

    const success = await composable.stopSession(1)

    expect(success).toBe(false)
    expect(composable.error.value).toBe('Failed to stop training session')

    consoleSpy.mockRestore()
  })

  it('fetches metrics', async () => {
    const composable = await loadComposable()
    const metrics = [{ id: 1 }]
    getMetrics.mockResolvedValue(metrics)

    await composable.fetchMetrics(1)

    expect(getMetrics).toHaveBeenCalledWith(1)
    expect(composable.metrics.value).toEqual(metrics)
  })
})
