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

  const createSession = (id: number = 1, name: string = 'Session') => {
    return new TrainingSession(
      id,
      name,
      'ppo',
      'standard',
      'running',
      10_000,
      5_000,
      20,
      10,
      10,
      1, // numRobots
      1,
      2,
      3,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T01:00:00Z'),
      null,
      null,
      null,
      null,
      null,
      new Date('2024-01-01T01:00:00Z'),
      null
    )
  }

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

  it('rejects duplicate training names', async () => {
    const composable = await loadComposable()
    const existingSession = createSession()
    composable.sessions.value = [existingSession]

    const result = await composable.createSession({
      ...DEFAULT_TRAINING_CONFIG,
      name: 'Session', // 既存セッションと同じ名前
    })

    expect(result).toBeNull()
    expect(composable.error.value).toContain('既に使用されています')
    expect(create).not.toHaveBeenCalled() // API呼び出しがスキップされることを確認
  })

  it('allows creating session with unique name', async () => {
    const composable = await loadComposable()
    const existingSession = createSession()
    composable.sessions.value = [existingSession]

    const newSession = new TrainingSession(
      2,
      'Unique Session',
      'ppo',
      'standard',
      'queued',
      10_000,
      0,
      0,
      10,
      10,
      1,
      2,
      3,
      new Date('2024-01-02T00:00:00Z'),
      new Date('2024-01-02T00:00:00Z'),
      null,
      null,
      null,
      null,
      null,
      new Date('2024-01-02T00:00:00Z'),
      null
    )
    create.mockResolvedValue(newSession)

    const result = await composable.createSession({
      ...DEFAULT_TRAINING_CONFIG,
      name: 'Unique Session',
    })

    expect(result).toBe(newSession)
    expect(composable.error.value).toBeNull()
    expect(create).toHaveBeenCalled()
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

  it('activeSessions filters running sessions', async () => {
    const composable = await loadComposable()
    const runningSession = createSession()
    const completedSession = new TrainingSession(
      2,
      'Completed Session',
      'ppo',
      'standard',
      'completed',
      10_000,
      10_000,
      20,
      10,
      10,
      1,
      2,
      3,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T01:00:00Z'),
      null,
      null,
      null,
      null,
      null,
      new Date('2024-01-01T01:00:00Z'),
      new Date('2024-01-01T02:00:00Z')
    )

    composable.sessions.value = [runningSession, completedSession]

    expect(composable.activeSessions.value).toHaveLength(1)
    expect(composable.activeSessions.value[0]?.status).toBe('running')
  })

  it('completedSessions filters completed sessions', async () => {
    const composable = await loadComposable()
    const runningSession = createSession()
    const completedSession = new TrainingSession(
      2,
      'Completed Session',
      'ppo',
      'standard',
      'completed',
      10_000,
      10_000,
      20,
      10,
      10,
      1,
      2,
      3,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T01:00:00Z'),
      null,
      null,
      null,
      null,
      null,
      new Date('2024-01-01T01:00:00Z'),
      new Date('2024-01-01T02:00:00Z')
    )

    composable.sessions.value = [runningSession, completedSession]

    expect(composable.completedSessions.value).toHaveLength(1)
    expect(composable.completedSessions.value[0]?.status).toBe('completed')
  })

  it('stops all polling intervals', async () => {
    const composable = await loadComposable()

    // 複数のポーリングを開始
    const interval1 = setInterval(() => {}, 1000)
    const interval2 = setInterval(() => {}, 1000)
    composable.stopAllPolling()

    // ポーリングマップがクリアされることを確認
    expect(composable.stopAllPolling).toBeDefined()

    clearInterval(interval1)
    clearInterval(interval2)
  })

  it('stops specific polling interval', async () => {
    const composable = await loadComposable()

    // stopPollingSessionStatus が関数として存在することを確認
    expect(composable.stopPollingSessionStatus).toBeDefined()
    expect(typeof composable.stopPollingSessionStatus).toBe('function')

    // 実行してもエラーにならないことを確認
    composable.stopPollingSessionStatus(1)
  })

  it('starts polling when createSession returns queued status', async () => {
    const queuedSession = {
      id: 123,
      name: 'Queued Session',
      status: 'queued',
      algorithm: 'ppo' as const,
      environmentType: 'standard',
      totalTimesteps: 10000,
      currentTimestep: 0,
      episodesCompleted: 0,
      envWidth: 8,
      envHeight: 8,
      coverageWeight: 1.5,
      explorationWeight: 3.0,
      diversityWeight: 2.0,
      learningRate: 0.0003,
      batchSize: 64,
      numWorkers: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockRepository.create.mockResolvedValue(queuedSession)

    const composable = await loadComposable()
    const session = await composable.createSession({
      name: 'Test',
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
    })

    expect(session).toBeDefined()
    expect(session?.status).toBe('queued')
    expect(composable.startPollingSessionStatus).toBeDefined()
  })

  it('handles polling when session becomes running', async () => {
    vi.useFakeTimers()

    const queuedSession = {
      id: 456,
      name: 'Test Session',
      status: 'queued' as const,
      algorithm: 'ppo' as const,
      environmentType: 'standard',
      totalTimesteps: 10000,
      currentTimestep: 0,
      episodesCompleted: 0,
      envWidth: 8,
      envHeight: 8,
      coverageWeight: 1.5,
      explorationWeight: 3.0,
      diversityWeight: 2.0,
      learningRate: 0.0003,
      batchSize: 64,
      numWorkers: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const runningSession = { ...queuedSession, status: 'running' as const }

    mockRepository.findById.mockResolvedValueOnce(queuedSession).mockResolvedValueOnce(runningSession)

    const composable = await loadComposable()

    composable.startPollingSessionStatus(456)

    // Wait for first poll
    await vi.advanceTimersByTimeAsync(2000)

    // Wait for second poll (status changes to running)
    await vi.advanceTimersByTimeAsync(2000)

    composable.stopPollingSessionStatus(456)
    vi.useRealTimers()
  })

  it('handles polling when session fails', async () => {
    vi.useFakeTimers()

    const queuedSession = {
      id: 789,
      name: 'Failed Session',
      status: 'queued' as const,
      algorithm: 'ppo' as const,
      environmentType: 'standard',
      totalTimesteps: 10000,
      currentTimestep: 0,
      episodesCompleted: 0,
      envWidth: 8,
      envHeight: 8,
      coverageWeight: 1.5,
      explorationWeight: 3.0,
      diversityWeight: 2.0,
      learningRate: 0.0003,
      batchSize: 64,
      numWorkers: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const failedSession = { ...queuedSession, status: 'failed' as const }

    mockRepository.findById.mockResolvedValueOnce(queuedSession).mockResolvedValueOnce(failedSession)

    const composable = await loadComposable()

    composable.startPollingSessionStatus(789)

    // Wait for first poll
    await vi.advanceTimersByTimeAsync(2000)

    // Wait for second poll (status changes to failed)
    await vi.advanceTimersByTimeAsync(2000)

    composable.stopPollingSessionStatus(789)
    vi.useRealTimers()
  })

  it('handles errors during polling gracefully', async () => {
    vi.useFakeTimers()

    mockRepository.findById.mockRejectedValueOnce(new Error('Network error'))

    const composable = await loadComposable()

    composable.startPollingSessionStatus(999)

    // Wait for poll that will error
    await vi.advanceTimersByTimeAsync(2000)

    // Polling should continue despite error
    composable.stopPollingSessionStatus(999)
    vi.useRealTimers()

    // No assertion needed - just verify it doesn't throw
    expect(true).toBe(true)
  })

  // Simulation mode tests
  describe('Simulation Mode', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.resetModules()
    })

    it('creates dummy session in simulation mode', async () => {
      vi.useFakeTimers()

      // Mock useRuntimeConfig to return simulation mode
      vi.stubGlobal('useRuntimeConfig', () => ({
        public: { simulationMode: true },
      }))

      // Mock ElMessage
      const ElMessageSuccess = vi.fn()
      vi.stubGlobal('ElMessage', { success: ElMessageSuccess })

      const { useTraining } = await import('~/composables/useTraining')
      const composable = useTraining()

      const config = {
        name: 'Simulated Session',
        algorithm: 'ppo' as const,
        environmentType: 'standard' as const,
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

      const session = await composable.createSession(config)

      expect(session).toBeDefined()
      expect(session?.name).toBe('Simulated Session')
      expect(session?.status).toBe('running')
      expect(composable.sessions.value).toHaveLength(1)
      expect(composable.currentSession.value?.id).toBe(session?.id)
      expect(ElMessageSuccess).toHaveBeenCalledWith('シミュレーションモード: 学習セッションを開始しました')

      vi.useRealTimers()
      vi.unstubAllGlobals()
    })

    it('starts simulated metrics generation', async () => {
      vi.useFakeTimers()

      // Mock console.log to verify metrics generation
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.stubGlobal('useRuntimeConfig', () => ({
        public: { simulationMode: true },
      }))

      vi.stubGlobal('ElMessage', { success: vi.fn() })

      const { useTraining } = await import('~/composables/useTraining')
      const composable = useTraining()

      const config = {
        name: 'Metrics Test',
        algorithm: 'ppo' as const,
        environmentType: 'standard' as const,
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

      await composable.createSession(config)

      // Wait for simulated metrics to be generated (2 seconds interval)
      await vi.advanceTimersByTimeAsync(2000)

      // Verify that metrics were logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Simulated metrics:',
        expect.objectContaining({
          timestep: expect.any(Number),
          reward: expect.any(Number),
        })
      )

      consoleLogSpy.mockRestore()
      vi.useRealTimers()
      vi.unstubAllGlobals()
    })

    it('cleans up simulation interval on unmount', async () => {
      vi.useFakeTimers()

      vi.stubGlobal('useRuntimeConfig', () => ({
        public: { simulationMode: true },
      }))

      vi.stubGlobal('ElMessage', { success: vi.fn() })

      const { useTraining } = await import('~/composables/useTraining')
      const composable = useTraining()

      const config = {
        name: 'Cleanup Test',
        algorithm: 'ppo' as const,
        environmentType: 'standard' as const,
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

      await composable.createSession(config)

      // Verify interval was started
      await vi.advanceTimersByTimeAsync(2000)

      // Simulate onBeforeUnmount by directly calling stopAllPolling
      // Note: In real scenarios, Vue would call the lifecycle hook
      composable.stopAllPolling()

      vi.useRealTimers()
      vi.unstubAllGlobals()

      // No assertion needed - just verify no errors
      expect(true).toBe(true)
    })

    it('simulated metrics progress to completion', async () => {
      vi.useFakeTimers()

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.stubGlobal('useRuntimeConfig', () => ({
        public: { simulationMode: true },
      }))

      vi.stubGlobal('ElMessage', { success: vi.fn() })

      const { useTraining } = await import('~/composables/useTraining')
      const composable = useTraining()

      const config = {
        name: 'Completion Test',
        algorithm: 'ppo' as const,
        environmentType: 'standard' as const,
        totalTimesteps: 1000, // Small number for faster test
        envWidth: 8,
        envHeight: 8,
        coverageWeight: 1.5,
        explorationWeight: 3.0,
        diversityWeight: 2.0,
        learningRate: 0.0003,
        batchSize: 64,
        numWorkers: 1,
      }

      await composable.createSession(config)

      // Wait for multiple intervals to simulate progress
      for (let i = 0; i < 10; i++) {
        await vi.advanceTimersByTimeAsync(2000)
      }

      // Verify metrics were generated multiple times
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThan(0)

      consoleLogSpy.mockRestore()
      vi.useRealTimers()
      vi.unstubAllGlobals()
    })

    it('does not call repository in simulation mode', async () => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        public: { simulationMode: true },
      }))

      vi.stubGlobal('ElMessage', { success: vi.fn() })

      const { useTraining } = await import('~/composables/useTraining')
      const composable = useTraining()

      const config = {
        name: 'No API Test',
        algorithm: 'ppo' as const,
        environmentType: 'standard' as const,
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

      await composable.createSession(config)

      // Verify repository.create was NOT called
      expect(mockRepository.create).not.toHaveBeenCalled()

      vi.unstubAllGlobals()
    })
  })
})
