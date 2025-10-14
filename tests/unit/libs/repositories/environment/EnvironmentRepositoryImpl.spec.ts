import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API_ENDPOINTS } from '~/configs/api'
import { EnvironmentRepositoryImpl } from '~/libs/repositories/environment/EnvironmentRepositoryImpl'

describe('EnvironmentRepositoryImpl', () => {
  const repository = new EnvironmentRepositoryImpl()
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('$fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('listEnvironments', () => {
    it('fetches all environment definitions successfully', async () => {
      const mockDefinitions = [
        {
          id: 'env-1',
          name: 'Standard Environment',
          description: 'Standard security patrol environment',
          gridWidth: 10,
          gridHeight: 10,
          threatLevel: 0.5,
        },
        {
          id: 'env-2',
          name: 'Complex Environment',
          description: 'Complex environment with obstacles',
          gridWidth: 15,
          gridHeight: 15,
          threatLevel: 0.8,
        },
      ]

      fetchMock.mockResolvedValue({ data: mockDefinitions })

      const result = await repository.listEnvironments()

      expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.environment.definitions)
      expect(result).toEqual(mockDefinitions)
      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('Standard Environment')
      expect(result[1]!.gridWidth).toBe(15)
    })

    it('throws error when API call fails', async () => {
      const mockError = new Error('Network error')
      fetchMock.mockRejectedValue(mockError)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(repository.listEnvironments()).rejects.toThrow('Network error')

      expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.environment.definitions)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch environment definitions:', mockError)

      consoleSpy.mockRestore()
    })

    it('returns empty array when backend returns empty data', async () => {
      fetchMock.mockResolvedValue({ data: [] })

      const result = await repository.listEnvironments()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })
  })

  describe('fetchState', () => {
    it('fetches environment state for given environmentId successfully', async () => {
      const mockState = {
        definition: {
          id: 'env-1',
          name: 'Test Environment',
          description: 'Test environment',
          gridWidth: 10,
          gridHeight: 10,
          threatLevel: 0.6,
        },
        robot: {
          position: { x: 5, y: 5 },
          health: 100,
          energy: 80,
        },
        activeThreatLevel: 0.6,
      }

      fetchMock.mockResolvedValue({ data: mockState })

      const result = await repository.fetchState('env-1')

      expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.environment.state('env-1'))
      expect(result).toEqual(mockState)
      expect(result.definition.id).toBe('env-1')
      expect(result.robot.position.x).toBe(5)
      expect(result.activeThreatLevel).toBe(0.6)
    })

    it('throws error when API call fails', async () => {
      const mockError = new Error('Environment not found')
      fetchMock.mockRejectedValue(mockError)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(repository.fetchState('invalid-env')).rejects.toThrow('Environment not found')

      expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.environment.state('invalid-env'))
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch environment state for invalid-env:',
        mockError,
      )

      consoleSpy.mockRestore()
    })

    it('handles different environment types correctly', async () => {
      const complexState = {
        definition: {
          id: 'env-complex',
          name: 'Complex Environment',
          description: 'Complex test',
          gridWidth: 20,
          gridHeight: 20,
          threatLevel: 0.9,
        },
        robot: {
          position: { x: 10, y: 10 },
          health: 50,
          energy: 30,
        },
        activeThreatLevel: 0.9,
      }

      fetchMock.mockResolvedValue({ data: complexState })

      const result = await repository.fetchState('env-complex')

      expect(result.definition.gridWidth).toBe(20)
      expect(result.definition.threatLevel).toBe(0.9)
      expect(result.robot.health).toBe(50)
    })
  })
})
