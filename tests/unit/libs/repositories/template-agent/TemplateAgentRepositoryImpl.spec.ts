import { describe, it, expect, vi, beforeEach } from 'vitest'

import { TemplateAgentRepositoryImpl } from '~/libs/repositories/template-agent/TemplateAgentRepositoryImpl'
import type {
  TemplateAgentTypeDefinition,
  TemplateAgentExecuteRequest,
  TemplateAgentExecuteResponse,
  TemplateAgentCompareRequest,
  TemplateAgentCompareResponse,
} from '~/types/api'

// Mock $fetch
const mockFetch = vi.fn()
global.$fetch = mockFetch as any

describe('TemplateAgentRepositoryImpl', () => {
  let repository: TemplateAgentRepositoryImpl

  beforeEach(() => {
    repository = new TemplateAgentRepositoryImpl()
    vi.clearAllMocks()
  })

  describe('getAgentTypes', () => {
    it('should fetch agent types successfully', async () => {
      const mockTypes: TemplateAgentTypeDefinition[] = [
        { type: 'horizontal_scan', name: 'HorizontalScanAgent', description: 'Test' },
      ]

      mockFetch.mockResolvedValueOnce(mockTypes)

      const result = await repository.getAgentTypes()

      expect(result).toEqual(mockTypes)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/template-agents/types'),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(repository.getAgentTypes()).rejects.toThrow(
        'テンプレートエージェントのタイプ一覧の取得に失敗しました'
      )
    })
  })

  describe('executeAgent', () => {
    it('should execute agent successfully', async () => {
      const request: TemplateAgentExecuteRequest = {
        agent_type: 'horizontal_scan',
        width: 10,
        height: 10,
        episodes: 10,
        max_steps: 1000,
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

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await repository.executeAgent(request)

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/template-agents/execute'),
        expect.objectContaining({
          method: 'POST',
          body: request,
        })
      )
    })

    it('should throw error when execution fails', async () => {
      const request: TemplateAgentExecuteRequest = {
        agent_type: 'horizontal_scan',
      }

      mockFetch.mockRejectedValueOnce(new Error('API error'))

      await expect(repository.executeAgent(request)).rejects.toThrow('テンプレートエージェントの実行に失敗しました')
    })
  })

  describe('compareAgents', () => {
    it('should compare agents successfully', async () => {
      const request: TemplateAgentCompareRequest = {
        agent_types: ['horizontal_scan', 'spiral'],
        width: 10,
        height: 10,
        episodes: 10,
        max_steps: 1000,
      }

      const mockResponse: TemplateAgentCompareResponse = {
        environment: { width: 10, height: 10 },
        episodes: 10,
        max_steps: 1000,
        results: [
          {
            agent_type: 'horizontal_scan',
            agent_name: 'HorizontalScanAgent',
            rank: 1,
            average_reward: 120,
            std_reward: 10,
            average_coverage: 0.85,
            average_episode_length: 950,
            average_patrol_count: 80,
            average_min_battery: 45,
            total_battery_deaths: 0,
          },
        ],
        best_agent: 'HorizontalScanAgent',
        worst_agent: 'SpiralAgent',
        performance_gap: 20,
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await repository.compareAgents(request)

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/template-agents/compare'),
        expect.objectContaining({
          method: 'POST',
          body: request,
        })
      )
    })

    it('should throw error when comparison fails', async () => {
      const request: TemplateAgentCompareRequest = {
        agent_types: ['horizontal_scan'],
      }

      mockFetch.mockRejectedValueOnce(new Error('API error'))

      await expect(repository.compareAgents(request)).rejects.toThrow('テンプレートエージェントの比較に失敗しました')
    })
  })
})
