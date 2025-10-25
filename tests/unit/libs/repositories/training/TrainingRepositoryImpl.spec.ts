import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API_ENDPOINTS } from '~/configs/api'
import { TrainingRepositoryImpl } from '~/libs/repositories/training/TrainingRepositoryImpl'

describe('TrainingRepositoryImpl', () => {
  const repository = new TrainingRepositoryImpl()
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('$fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches all training sessions', async () => {
    // Backend returns paginated response
    fetchMock.mockResolvedValue({
      total: 1,
      page: 1,
      page_size: 100,
      sessions: [
        {
          id: 1,
          name: 'Session 1',
          algorithm: 'ppo',
          environment_type: 'standard',
          status: 'running',
          total_timesteps: 10_000,
          current_timestep: 5_000,
          episodes_completed: 10,
          env_width: 10,
          env_height: 10,
          coverage_weight: 1,
          exploration_weight: 2,
          diversity_weight: 3,
        },
      ],
    })

    const sessions = await repository.findAll()

    expect(fetchMock).toHaveBeenCalledWith(
      API_ENDPOINTS.training.list,
      expect.objectContaining({
        params: { page: 1, page_size: 100 },
      })
    )
    expect(sessions).toHaveLength(1)
    expect(sessions[0]!.name).toBe('Session 1')
  })

  it('returns null when findById fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const session = await repository.findById(99)

    expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.training.status(99), expect.anything())
    expect(session).toBeNull()

    consoleSpy.mockRestore()
  })

  it('creates a training session', async () => {
    const dto = {
      id: 1,
      name: 'New Session',
      algorithm: 'ppo',
      environment_type: 'standard',
      status: 'created',
      total_timesteps: 10_000,
      current_timestep: 0,
      episodes_completed: 0,
      env_width: 10,
      env_height: 10,
      coverage_weight: 1,
      exploration_weight: 2,
      diversity_weight: 3,
    }
    fetchMock.mockResolvedValue(dto)

    const session = await repository.create({
      name: 'New Session',
      algorithm: 'ppo',
      environmentType: 'standard',
      totalTimesteps: 10_000,
      envWidth: 10,
      envHeight: 10,
      coverageWeight: 1,
      explorationWeight: 2,
      diversityWeight: 3,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      API_ENDPOINTS.training.start,
      expect.objectContaining({
        method: 'POST',
        body: {
          name: 'New Session',
          algorithm: 'ppo',
          environmentType: 'standard',
          totalTimesteps: 10_000,
          envWidth: 10,
          envHeight: 10,
          coverageWeight: 1,
          explorationWeight: 2,
          diversityWeight: 3,
        },
      })
    )
    expect(session.name).toBe('New Session')
  })

  it('stops a training session and returns false when failing', async () => {
    fetchMock.mockRejectedValue(new Error('fail'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await repository.stop(1)

    expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.training.stop(1), expect.objectContaining({ method: 'POST' }))
    expect(result).toBe(false)

    consoleSpy.mockRestore()
  })

  it('retrieves training metrics with limit parameter', async () => {
    // Backend returns paginated response
    fetchMock.mockResolvedValue({
      total: 1,
      page: 1,
      page_size: 50,
      metrics: [
        {
          id: 1,
          session_id: 1,
          timestep: 100,
          episode: 10,
          reward: 50,
          loss: 0.1,
          coverage_ratio: 0.8,
          exploration_score: 0.7,
        },
      ],
    })

    const metrics = await repository.getMetrics(1, 50)

    expect(fetchMock).toHaveBeenCalledWith(
      API_ENDPOINTS.training.metrics(1),
      expect.objectContaining({
        params: { page: 1, page_size: 50 },
      })
    )
    expect(metrics[0]!.coverageRatio).toBe(0.8)
  })
})
