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
          width: 10,
          height: 10,
        },
        {
          id: 'env-2',
          name: 'Complex Environment',
          description: 'Complex environment with obstacles',
          width: 15,
          height: 15,
        },
      ]

      fetchMock.mockResolvedValue({ data: mockDefinitions })

      const result = await repository.listEnvironments()

      expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.environment.definitions)
      expect(result).toEqual(mockDefinitions)
      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('Standard Environment')
      expect(result[1]!.width).toBe(15)
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
          width: 10,
          height: 10,
        },
        robot: {
          position: { row: 5, col: 5 },
          batteryLevel: 100,
          sensorReadings: [],
        },
        activeThreatLevel: 0.6,
      }

      fetchMock.mockResolvedValue({ data: mockState })

      const result = await repository.fetchState('env-1')

      expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.environment.state('env-1'))
      expect(result).toEqual(mockState)
      expect(result.definition.id).toBe('env-1')
      expect(result.robot.position.col).toBe(5)
      expect(result.activeThreatLevel).toBe(0.6)
    })

    it('throws error when API call fails', async () => {
      const mockError = new Error('Environment not found')
      fetchMock.mockRejectedValue(mockError)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(repository.fetchState('invalid-env')).rejects.toThrow('Environment not found')

      expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.environment.state('invalid-env'))
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch environment state for invalid-env:', mockError)

      consoleSpy.mockRestore()
    })

    it('handles different environment types correctly', async () => {
      const complexState = {
        definition: {
          id: 'env-complex',
          name: 'Complex Environment',
          description: 'Complex test',
          width: 20,
          height: 20,
        },
        robot: {
          position: { row: 10, col: 10 },
          batteryLevel: 50,
          sensorReadings: [],
        },
        activeThreatLevel: 0.9,
      }

      fetchMock.mockResolvedValue({ data: complexState })

      const result = await repository.fetchState('env-complex')

      expect(result.definition.width).toBe(20)
      expect(result.robot.batteryLevel).toBe(50)
    })
  })
})
