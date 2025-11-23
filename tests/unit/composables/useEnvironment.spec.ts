import { describe, it, expect } from 'vitest'

import { useEnvironment } from '~/composables/useEnvironment'
import type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'
import type { TrainingSession } from '~/libs/domains/training/TrainingSession'
import type { EnvironmentStateEntity } from '~/libs/entities/environment/EnvironmentStateEntity'
import type { EnvironmentRepository } from '~/libs/repositories/environment/EnvironmentRepository'

describe('useEnvironment', () => {
  describe('fetchEnvironments', () => {
    it('fetches and stores environment definitions', async () => {
      const mockEnvironments = [
        {
          id: 'env-1',
          name: 'Test Environment 1',
          width: 8,
          height: 8,
          gridSize: { rows: 8, cols: 8 },
          threatMap: [
            [0.1, 0.2],
            [0.3, 0.4],
          ],
        },
        {
          id: 'env-2',
          name: 'Test Environment 2',
          width: 10,
          height: 10,
          gridSize: { rows: 10, cols: 10 },
          threatMap: [
            [0.5, 0.6],
            [0.7, 0.8],
          ],
        },
      ]

      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => mockEnvironments,
        fetchState: async () => ({}) as unknown as EnvironmentStateEntity,
        createSession: async () => ({}) as unknown as TrainingSession,
      }

      const { environments, fetchEnvironments } = useEnvironment(mockRepository)

      await fetchEnvironments()

      expect(environments.value).toEqual(mockEnvironments)
      expect(environments.value).toHaveLength(2)
    })

    it('handles empty environment list', async () => {
      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => ({}) as unknown as EnvironmentStateEntity,
        createSession: async () => ({}) as unknown as TrainingSession,
      }

      const { environments, fetchEnvironments } = useEnvironment(mockRepository)

      await fetchEnvironments()

      expect(environments.value).toEqual([])
      expect(environments.value).toHaveLength(0)
    })
  })

  describe('fetchState', () => {
    it('fetches and stores environment state', async () => {
      const mockState = {
        definition: {
          id: 'env-1',
          name: 'Test Environment',
          width: 10,
          height: 10,
          description: 'Test',
        },
        robot: {
          position: { row: 3, col: 4 },
          batteryLevel: 80,
          sensorReadings: [0.1, 0.2, 0.3],
        },
        activeThreatLevel: 5,
      }

      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => mockState as unknown as EnvironmentStateEntity,
        createSession: async () => ({}) as unknown as TrainingSession,
      }

      const { currentState, fetchState } = useEnvironment(mockRepository)

      await fetchState('env-1')

      expect(currentState.value).toEqual(mockState)
      expect(currentState.value?.definition.id).toBe('env-1')
    })

    it('updates state when fetched multiple times', async () => {
      const mockState1 = {
        definition: {
          id: 'env-1',
          name: 'Test Environment',
          width: 10,
          height: 10,
        },
        robot: {
          position: { row: 0, col: 0 },
          batteryLevel: 80,
          sensorReadings: [0.1],
        },
        activeThreatLevel: 3,
      }

      const mockState2 = {
        definition: {
          id: 'env-1',
          name: 'Test Environment',
          width: 10,
          height: 10,
        },
        robot: {
          position: { row: 1, col: 1 },
          batteryLevel: 70,
          sensorReadings: [0.2],
        },
        activeThreatLevel: 5,
      }

      let callCount = 0
      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => {
          callCount++
          return (callCount === 1 ? mockState1 : mockState2) as unknown as EnvironmentStateEntity
        },
        createSession: async () => ({}) as unknown as TrainingSession,
      }

      const { currentState, fetchState } = useEnvironment(mockRepository)

      await fetchState('env-1')
      expect(currentState.value).toEqual(mockState1)

      await fetchState('env-1')
      expect(currentState.value).toEqual(mockState2)
      expect(callCount).toBe(2)
    })
  })

  describe('createSession', () => {
    it('creates a session with given config', async () => {
      const mockConfig = {
        name: 'Test Session',
        algorithm: 'ppo',
        environmentType: 'standard',
      }

      const mockSessionResult = {
        id: 123,
        name: 'Test Session',
        status: 'created',
      }

      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => ({}) as unknown as EnvironmentStateEntity,
        createSession: async (config: TrainingConfig) => {
          expect(config).toEqual(mockConfig)
          return mockSessionResult as unknown as TrainingSession
        },
      }

      const { createSession } = useEnvironment(mockRepository)

      const result = await createSession(mockConfig as unknown as TrainingConfig)

      expect(result).toEqual(mockSessionResult)
    })

    it('passes config to repository correctly', async () => {
      let receivedConfig: TrainingConfig | null = null

      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => ({}) as unknown as EnvironmentStateEntity,
        createSession: async (config: TrainingConfig) => {
          receivedConfig = config
          return { id: 1 } as unknown as TrainingSession
        },
      }

      const { createSession } = useEnvironment(mockRepository)

      const testConfig = {
        name: 'Session',
        totalTimesteps: 10000,
      }

      await createSession(testConfig as unknown as TrainingConfig)

      expect(receivedConfig).toEqual(testConfig)
    })
  })

  describe('initial state', () => {
    it('has empty environments array initially', () => {
      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => ({}) as unknown as EnvironmentStateEntity,
        createSession: async () => ({}) as unknown as TrainingSession,
      }

      const { environments } = useEnvironment(mockRepository)

      expect(environments.value).toEqual([])
    })

    it('has null currentState initially', () => {
      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => ({}) as unknown as EnvironmentStateEntity,
        createSession: async () => ({}) as unknown as TrainingSession,
      }

      const { currentState } = useEnvironment(mockRepository)

      expect(currentState.value).toBeNull()
    })
  })
})
