import { describe, it, expect, beforeEach, vi } from 'vitest'

import { usePlayback } from '~/composables/usePlayback'
import type { PlaybackFrame } from '~/libs/domains/playback/PlaybackFrame'
import type { PlaybackSession } from '~/libs/domains/playback/PlaybackSession'
import type { PlaybackRepository } from '~/libs/repositories/playback/PlaybackRepository'

describe('usePlayback', () => {
  let mockRepository: PlaybackRepository

  beforeEach(() => {
    mockRepository = {
      listSessions: vi.fn(),
      fetchFrames: vi.fn(),
    }
  })

  describe('fetchSessions', () => {
    it('fetches and stores playback sessions', async () => {
      const mockSessions: PlaybackSession[] = [
        {
          id: '1',
          sessionId: 1,
          name: 'Session 1',
          algorithm: 'ppo',
          environmentType: 'standard',
          status: 'completed',
          totalTimesteps: 10000,
          currentTimestep: 10000,
          episodesCompleted: 100,
          frameCount: 500,
          firstEpisode: 1,
          lastEpisode: 100,
          lastStep: 500,
          recordedAt: '2024-01-01T00:00:00Z',
          lastRecordedAt: '2024-01-01T01:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          startedAt: '2024-01-01T00:00:00Z',
          completedAt: '2024-01-01T01:00:00Z',
          durationSeconds: 120,
        },
        {
          id: '2',
          sessionId: 2,
          name: 'Session 2',
          algorithm: 'a3c',
          environmentType: 'enhanced',
          status: 'completed',
          totalTimesteps: 20000,
          currentTimestep: 20000,
          episodesCompleted: 200,
          frameCount: 1000,
          firstEpisode: 1,
          lastEpisode: 200,
          lastStep: 1000,
          recordedAt: '2024-01-02T00:00:00Z',
          lastRecordedAt: '2024-01-02T02:00:00Z',
          createdAt: '2024-01-02T00:00:00Z',
          startedAt: '2024-01-02T00:00:00Z',
          completedAt: '2024-01-02T02:00:00Z',
          durationSeconds: 180,
        },
      ]

      mockRepository.listSessions = vi.fn().mockResolvedValue(mockSessions)

      const { sessions, fetchSessions } = usePlayback(mockRepository)

      await fetchSessions()

      expect(mockRepository.listSessions).toHaveBeenCalled()
      expect(sessions.value).toEqual(mockSessions)
      expect(sessions.value).toHaveLength(2)
    })

    it('handles empty sessions list', async () => {
      mockRepository.listSessions = vi.fn().mockResolvedValue([])

      const { sessions, fetchSessions } = usePlayback(mockRepository)

      await fetchSessions()

      expect(sessions.value).toEqual([])
      expect(sessions.value).toHaveLength(0)
    })
  })

  describe('fetchFrames', () => {
    it('fetches and stores frames for a session', async () => {
      const mockFrames: PlaybackFrame[] = [
        {
          timestamp: '2024-01-01T00:00:00Z',
          environmentState: { x: 1, y: 1 },
          reward: 0.5,
        },
        {
          timestamp: '2024-01-01T00:00:01Z',
          environmentState: { x: 2, y: 2 },
          reward: 0.7,
        },
      ]

      mockRepository.fetchFrames = vi.fn().mockResolvedValue(mockFrames)

      const { frames, fetchFrames } = usePlayback(mockRepository)

      await fetchFrames('session-1')

      expect(mockRepository.fetchFrames).toHaveBeenCalledWith('session-1')
      expect(frames.value).toEqual(mockFrames)
      expect(frames.value).toHaveLength(2)
    })

    it('handles empty frames list', async () => {
      mockRepository.fetchFrames = vi.fn().mockResolvedValue([])

      const { frames, fetchFrames } = usePlayback(mockRepository)

      await fetchFrames('session-1')

      expect(frames.value).toEqual([])
      expect(frames.value).toHaveLength(0)
    })

    it('updates frames when fetched for different sessions', async () => {
      const mockFrames1: PlaybackFrame[] = [
        {
          timestamp: '2024-01-01T00:00:00Z',
          environmentState: { x: 1, y: 1 },
          reward: 0.5,
        },
      ]

      const mockFrames2: PlaybackFrame[] = [
        {
          timestamp: '2024-01-02T00:00:00Z',
          environmentState: { x: 3, y: 3 },
          reward: 0.8,
        },
      ]

      let callCount = 0
      mockRepository.fetchFrames = vi.fn().mockImplementation(() => {
        callCount++
        return Promise.resolve(callCount === 1 ? mockFrames1 : mockFrames2)
      })

      const { frames, fetchFrames } = usePlayback(mockRepository)

      await fetchFrames('session-1')
      expect(frames.value).toEqual(mockFrames1)

      await fetchFrames('session-2')
      expect(frames.value).toEqual(mockFrames2)
      expect(callCount).toBe(2)
    })
  })

  describe('initial state', () => {
    it('has empty sessions array initially', () => {
      const { sessions } = usePlayback(mockRepository)

      expect(sessions.value).toEqual([])
    })

    it('has empty frames array initially', () => {
      const { frames } = usePlayback(mockRepository)

      expect(frames.value).toEqual([])
    })
  })
})
