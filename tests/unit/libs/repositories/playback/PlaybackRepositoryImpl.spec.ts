import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API_ENDPOINTS } from '~/configs/api'
import { PlaybackRepositoryImpl } from '~/libs/repositories/playback/PlaybackRepositoryImpl'

describe('PlaybackRepositoryImpl', () => {
  const repository = new PlaybackRepositoryImpl()
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('$fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('normalizeEnvironmentState', () => {
    it('should normalize threat_grid with levels wrapper', async () => {
      const mockFramesResponse = {
        total: 1,
        page: 1,
        page_size: 10,
        frames: [
          {
            id: 1,
            session_id: 1,
            episode: 1,
            step: 0,
            robot_x: 0,
            robot_y: 0,
            robot_orientation: 0,
            threat_grid: {
              levels: [
                [0.5, 0.8],
                [0.2, 0.9],
              ],
            },
            coverage_map: null,
            obstacles: null,
            suspicious_objects: null,
            action_taken: null,
            reward_received: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      fetchMock.mockResolvedValue(mockFramesResponse)

      const frames = await repository.fetchFrames('1')

      expect(frames).toHaveLength(1)
      expect(frames[0]!.environmentState).not.toBeNull()
      expect(frames[0]!.environmentState!.threat_grid).toEqual([
        [0.5, 0.8],
        [0.2, 0.9],
      ])
    })

    it('should normalize coverage_map with levels wrapper', async () => {
      const mockFramesResponse = {
        total: 1,
        page: 1,
        page_size: 10,
        frames: [
          {
            id: 1,
            session_id: 1,
            episode: 1,
            step: 0,
            robot_x: 0,
            robot_y: 0,
            robot_orientation: 0,
            threat_grid: [[0.5]],
            coverage_map: {
              levels: [
                [1, 0],
                [0, 1],
              ],
            },
            obstacles: null,
            suspicious_objects: null,
            action_taken: null,
            reward_received: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      fetchMock.mockResolvedValue(mockFramesResponse)

      const frames = await repository.fetchFrames('1')

      expect(frames).toHaveLength(1)
      expect(frames[0]!.environmentState).not.toBeNull()
      expect(frames[0]!.environmentState!.coverage_map).toEqual([
        [1, 0],
        [0, 1],
      ])
    })

    it('should normalize obstacles with levels wrapper', async () => {
      const mockFramesResponse = {
        total: 1,
        page: 1,
        page_size: 10,
        frames: [
          {
            id: 1,
            session_id: 1,
            episode: 1,
            step: 0,
            robot_x: 0,
            robot_y: 0,
            robot_orientation: 0,
            threat_grid: [[0.5]],
            coverage_map: null,
            obstacles: {
              levels: [
                [true, false],
                [false, true],
              ],
            },
            suspicious_objects: null,
            action_taken: null,
            reward_received: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      fetchMock.mockResolvedValue(mockFramesResponse)

      const frames = await repository.fetchFrames('1')

      expect(frames).toHaveLength(1)
      expect(frames[0]!.environmentState).not.toBeNull()
      expect(frames[0]!.environmentState!.obstacles).toEqual([
        [true, false],
        [false, true],
      ])
    })

    it('should handle already normalized threat_grid', async () => {
      const mockFramesResponse = {
        total: 1,
        page: 1,
        page_size: 10,
        frames: [
          {
            id: 1,
            session_id: 1,
            episode: 1,
            step: 0,
            robot_x: 0,
            robot_y: 0,
            robot_orientation: 0,
            threat_grid: [
              [0.5, 0.8],
              [0.2, 0.9],
            ],
            coverage_map: null,
            obstacles: null,
            suspicious_objects: null,
            action_taken: null,
            reward_received: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      fetchMock.mockResolvedValue(mockFramesResponse)

      const frames = await repository.fetchFrames('1')

      expect(frames).toHaveLength(1)
      expect(frames[0]!.environmentState).not.toBeNull()
      expect(frames[0]!.environmentState!.threat_grid).toEqual([
        [0.5, 0.8],
        [0.2, 0.9],
      ])
    })

    it('should handle already normalized obstacles', async () => {
      const mockFramesResponse = {
        total: 1,
        page: 1,
        page_size: 10,
        frames: [
          {
            id: 1,
            session_id: 1,
            episode: 1,
            step: 0,
            robot_x: 0,
            robot_y: 0,
            robot_orientation: 0,
            threat_grid: [[0.5]],
            coverage_map: null,
            obstacles: [
              [true, false],
              [false, true],
            ],
            suspicious_objects: null,
            action_taken: null,
            reward_received: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      fetchMock.mockResolvedValue(mockFramesResponse)

      const frames = await repository.fetchFrames('1')

      expect(frames).toHaveLength(1)
      expect(frames[0]!.environmentState).not.toBeNull()
      expect(frames[0]!.environmentState!.obstacles).toEqual([
        [true, false],
        [false, true],
      ])
    })

    it('should handle null obstacles', async () => {
      const mockFramesResponse = {
        total: 1,
        page: 1,
        page_size: 10,
        frames: [
          {
            id: 1,
            session_id: 1,
            episode: 1,
            step: 0,
            robot_x: 0,
            robot_y: 0,
            robot_orientation: 0,
            threat_grid: [[0.5]],
            coverage_map: null,
            obstacles: null,
            suspicious_objects: null,
            action_taken: null,
            reward_received: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      fetchMock.mockResolvedValue(mockFramesResponse)

      const frames = await repository.fetchFrames('1')

      expect(frames).toHaveLength(1)
      expect(frames[0]!.environmentState).not.toBeNull()
      expect(frames[0]!.environmentState!.obstacles).toBeNull()
    })

    it('should handle null coverage_map', async () => {
      const mockFramesResponse = {
        total: 1,
        page: 1,
        page_size: 10,
        frames: [
          {
            id: 1,
            session_id: 1,
            episode: 1,
            step: 0,
            robot_x: 0,
            robot_y: 0,
            robot_orientation: 0,
            threat_grid: [[0.5]],
            coverage_map: null,
            obstacles: null,
            suspicious_objects: null,
            action_taken: null,
            reward_received: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      fetchMock.mockResolvedValue(mockFramesResponse)

      const frames = await repository.fetchFrames('1')

      expect(frames).toHaveLength(1)
      expect(frames[0]!.environmentState).not.toBeNull()
      // normalizeGridMatrix converts null to empty array
      expect(frames[0]!.environmentState!.coverage_map).toEqual([])
    })
  })

  describe('listSessions', () => {
    it('fetches playback sessions successfully', async () => {
      const mockSessions = [
        {
          session_id: 1,
          name: 'Test Session 1',
          algorithm: 'ppo' as const,
          environment_type: 'standard',
          status: 'completed',
          total_timesteps: 1000,
          current_timestep: 1000,
          episodes_completed: 10,
          frame_count: 500,
          first_episode: 1,
          last_episode: 10,
          first_recorded_at: '2024-01-01T00:00:00Z',
          last_recorded_at: '2024-01-01T01:00:00Z',
          last_step: 100,
          created_at: '2024-01-01T00:00:00Z',
          started_at: '2024-01-01T00:00:00Z',
          completed_at: '2024-01-01T01:00:00Z',
        },
      ]

      fetchMock.mockResolvedValue({
        total: 1,
        page: 1,
        page_size: 100,
        sessions: mockSessions,
      })

      const result = await repository.listSessions()

      expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.playback.sessions, {
        params: {
          page: 1,
          page_size: 100,
        },
      })
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Test Session 1')
    })

    it('throws error when API call fails', async () => {
      const mockError = new Error('Network error')
      fetchMock.mockRejectedValue(mockError)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(repository.listSessions()).rejects.toThrow('Network error')

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch playback sessions:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('fetchFrames', () => {
    it('fetches frames for a session successfully', async () => {
      const mockFrames = [
        {
          id: 1,
          session_id: 1,
          episode: 1,
          step: 0,
          robot_x: 0,
          robot_y: 0,
          robot_orientation: 0,
          threat_grid: [[0.5]],
          coverage_map: [[1]],
          obstacles: null,
          suspicious_objects: null,
          action_taken: 0,
          reward_received: 1.0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      fetchMock.mockResolvedValue({
        total: 1,
        page: 1,
        page_size: 100,
        frames: mockFrames,
      })

      const result = await repository.fetchFrames('1')

      expect(fetchMock).toHaveBeenCalledWith(API_ENDPOINTS.playback.frames(1), {
        params: {
          page: 1,
          page_size: 1000,
        },
      })
      expect(result).toHaveLength(1)
      expect(result[0]!.environmentState).not.toBeNull()
      expect(result[0]!.environmentState!.episode).toBe(1)
    })

    it('throws error when API call fails', async () => {
      const mockError = new Error('Network error')
      fetchMock.mockRejectedValue(mockError)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(repository.fetchFrames('1')).rejects.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch playback frames for session 1:', mockError)

      consoleSpy.mockRestore()
    })
  })
})
