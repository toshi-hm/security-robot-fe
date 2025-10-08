import { describe, it, expect } from 'vitest'

import { useEnvironment } from '~/composables/useEnvironment'
import type { EnvironmentRepository } from '~/libs/repositories/environment/EnvironmentRepository'

describe('useEnvironment', () => {
  describe('fetchEnvironments', () => {
    it('fetches and stores environment definitions', async () => {
      const mockEnvironments = [
        {
          id: 'env-1',
          name: 'Test Environment 1',
          gridSize: { rows: 8, cols: 8 },
          threatMap: [
            [0.1, 0.2],
            [0.3, 0.4],
          ],
        },
        {
          id: 'env-2',
          name: 'Test Environment 2',
          gridSize: { rows: 10, cols: 10 },
          threatMap: [
            [0.5, 0.6],
            [0.7, 0.8],
          ],
        },
      ]

      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => mockEnvironments,
        fetchState: async () => ({}) as any,
      }

      const { environments, fetchEnvironments } = useEnvironment(mockRepository)

      await fetchEnvironments()

      expect(environments.value).toEqual(mockEnvironments)
      expect(environments.value).toHaveLength(2)
    })

    it('handles empty environment list', async () => {
      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => ({}) as any,
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
        environmentId: 'env-1',
        robotPosition: { x: 3, y: 4 },
        robotOrientation: 1,
        threatGrid: [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
        coverageMap: [
          [true, false],
          [false, true],
        ],
        suspiciousObjects: [],
        timestamp: new Date('2024-01-01'),
      }

      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => mockState as any,
      }

      const { currentState, fetchState } = useEnvironment(mockRepository)

      await fetchState('env-1')

      expect(currentState.value).toEqual(mockState)
      expect(currentState.value?.environmentId).toBe('env-1')
    })

    it('updates state when fetched multiple times', async () => {
      const mockState1 = {
        environmentId: 'env-1',
        robotPosition: { x: 0, y: 0 },
        robotOrientation: 0,
        threatGrid: [[0.1]],
        coverageMap: [[false]],
        suspiciousObjects: [],
        timestamp: new Date('2024-01-01'),
      }

      const mockState2 = {
        environmentId: 'env-1',
        robotPosition: { x: 1, y: 1 },
        robotOrientation: 2,
        threatGrid: [[0.2]],
        coverageMap: [[true]],
        suspiciousObjects: [],
        timestamp: new Date('2024-01-02'),
      }

      let callCount = 0
      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => {
          callCount++
          return (callCount === 1 ? mockState1 : mockState2) as any
        },
      }

      const { currentState, fetchState } = useEnvironment(mockRepository)

      await fetchState('env-1')
      expect(currentState.value).toEqual(mockState1)

      await fetchState('env-1')
      expect(currentState.value).toEqual(mockState2)
      expect(callCount).toBe(2)
    })
  })

  describe('initial state', () => {
    it('has empty environments array initially', () => {
      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => ({}) as any,
      }

      const { environments } = useEnvironment(mockRepository)

      expect(environments.value).toEqual([])
    })

    it('has null currentState initially', () => {
      const mockRepository: EnvironmentRepository = {
        listEnvironments: async () => [],
        fetchState: async () => ({}) as any,
      }

      const { currentState } = useEnvironment(mockRepository)

      expect(currentState.value).toBeNull()
    })
  })
})
