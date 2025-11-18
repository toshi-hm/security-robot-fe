import { describe, it, expect, vi, beforeEach } from 'vitest'

import { useTemplateAgents } from '~/composables/useTemplateAgents'
import type { TemplateAgentRepository } from '~/libs/repositories/template-agent/TemplateAgentRepository'
import type {
  TemplateAgentTypeDefinition,
  TemplateAgentExecuteRequest,
  TemplateAgentExecuteResponse,
  TemplateAgentCompareRequest,
  TemplateAgentCompareResponse,
} from '~/types/api'

// Mock repository
const createMockRepository = (): TemplateAgentRepository => ({
  getAgentTypes: vi.fn(),
  executeAgent: vi.fn(),
  compareAgents: vi.fn(),
})

describe('useTemplateAgents', () => {
  let mockRepository: TemplateAgentRepository

  beforeEach(() => {
    mockRepository = createMockRepository()
  })

  describe('fetchAgentTypes', () => {
    it('should fetch agent types successfully', async () => {
      const mockTypes: TemplateAgentTypeDefinition[] = [
        { type: 'horizontal_scan', name: 'HorizontalScanAgent', description: 'Test' },
      ]

      vi.mocked(mockRepository.getAgentTypes).mockResolvedValueOnce(mockTypes)

      const { agentTypes, isLoading, error, fetchAgentTypes } = useTemplateAgents(mockRepository)

      await fetchAgentTypes()

      expect(agentTypes.value).toEqual(mockTypes)
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should handle fetch error', async () => {
      vi.mocked(mockRepository.getAgentTypes).mockRejectedValueOnce(new Error('Fetch failed'))

      const { agentTypes, isLoading, error, fetchAgentTypes } = useTemplateAgents(mockRepository)

      await fetchAgentTypes()

      expect(agentTypes.value).toEqual([])
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeTruthy()
    })

    it('should set loading state during fetch', async () => {
      const mockTypes: TemplateAgentTypeDefinition[] = []

      let resolvePromise: (value: TemplateAgentTypeDefinition[]) => void
      const promise = new Promise<TemplateAgentTypeDefinition[]>((resolve) => {
        resolvePromise = resolve
      })

      vi.mocked(mockRepository.getAgentTypes).mockReturnValueOnce(promise)

      const { isLoading, fetchAgentTypes } = useTemplateAgents(mockRepository)

      const fetchPromise = fetchAgentTypes()
      expect(isLoading.value).toBe(true)

      resolvePromise!(mockTypes)
      await fetchPromise

      expect(isLoading.value).toBe(false)
    })
  })

  describe('executeAgent', () => {
    it('should execute agent successfully', async () => {
      const request: TemplateAgentExecuteRequest = {
        agent_type: 'horizontal_scan',
      }

      const mockResponse: TemplateAgentExecuteResponse = {
        agent_type: 'horizontal_scan',
        agent_name: 'HorizontalScanAgent',
        environment: { width: 10, height: 10 },
        episodes: 10,
        average_reward: 100,
        std_reward: 10,
        average_coverage: 0.8,
        average_episode_length: 950,
        average_patrol_count: 80,
        average_min_battery: 45,
        total_battery_deaths: 0,
        episode_metrics: [],
      }

      vi.mocked(mockRepository.executeAgent).mockResolvedValueOnce(mockResponse)

      const { executeResult, isLoading, error, executeAgent } = useTemplateAgents(mockRepository)

      const result = await executeAgent(request)

      expect(result).toEqual(mockResponse)
      expect(executeResult.value).toEqual(mockResponse)
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should handle execution error', async () => {
      const request: TemplateAgentExecuteRequest = {
        agent_type: 'horizontal_scan',
      }

      vi.mocked(mockRepository.executeAgent).mockRejectedValueOnce(new Error('Execution failed'))

      const { executeResult, isLoading, error, executeAgent } = useTemplateAgents(mockRepository)

      const result = await executeAgent(request)

      expect(result).toBeNull()
      expect(executeResult.value).toBeNull()
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeTruthy()
    })
  })

  describe('compareAgents', () => {
    it('should compare agents successfully', async () => {
      const request: TemplateAgentCompareRequest = {
        agent_types: ['horizontal_scan', 'spiral'],
      }

      const mockResponse: TemplateAgentCompareResponse = {
        environment: { width: 10, height: 10 },
        episodes: 10,
        max_steps: 1000,
        results: [],
        best_agent: 'HorizontalScanAgent',
        worst_agent: 'SpiralAgent',
        performance_gap: 20,
      }

      vi.mocked(mockRepository.compareAgents).mockResolvedValueOnce(mockResponse)

      const { compareResult, isLoading, error, compareAgents } = useTemplateAgents(mockRepository)

      const result = await compareAgents(request)

      expect(result).toEqual(mockResponse)
      expect(compareResult.value).toEqual(mockResponse)
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should handle comparison error', async () => {
      const request: TemplateAgentCompareRequest = {
        agent_types: ['horizontal_scan'],
      }

      vi.mocked(mockRepository.compareAgents).mockRejectedValueOnce(new Error('Comparison failed'))

      const { compareResult, isLoading, error, compareAgents } = useTemplateAgents(mockRepository)

      const result = await compareAgents(request)

      expect(result).toBeNull()
      expect(compareResult.value).toBeNull()
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeTruthy()
    })
  })

  describe('clearError', () => {
    it('should clear error', async () => {
      vi.mocked(mockRepository.getAgentTypes).mockRejectedValueOnce(new Error('Error'))

      const { error, fetchAgentTypes, clearError } = useTemplateAgents(mockRepository)

      await fetchAgentTypes()
      expect(error.value).toBeTruthy()

      clearError()
      expect(error.value).toBeNull()
    })
  })

  describe('clearResults', () => {
    it('should clear all results and error', async () => {
      const mockExecuteResponse: TemplateAgentExecuteResponse = {
        agent_type: 'horizontal_scan',
        agent_name: 'HorizontalScanAgent',
        environment: { width: 10, height: 10 },
        episodes: 10,
        average_reward: 100,
        std_reward: 10,
        average_coverage: 0.8,
        average_episode_length: 950,
        average_patrol_count: 80,
        average_min_battery: 45,
        total_battery_deaths: 0,
        episode_metrics: [],
      }

      vi.mocked(mockRepository.executeAgent).mockResolvedValueOnce(mockExecuteResponse)

      const { executeResult, compareResult, error, executeAgent, clearResults } = useTemplateAgents(mockRepository)

      await executeAgent({ agent_type: 'horizontal_scan' })
      expect(executeResult.value).toBeTruthy()

      clearResults()
      expect(executeResult.value).toBeNull()
      expect(compareResult.value).toBeNull()
      expect(error.value).toBeNull()
    })
  })
})
