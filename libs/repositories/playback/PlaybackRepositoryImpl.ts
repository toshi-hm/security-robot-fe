import { API_ENDPOINTS } from '../../../configs/api'

import type { PlaybackRepository } from './PlaybackRepository'
import type { PlaybackFrame } from '../../domains/playback/PlaybackFrame'
import type { PlaybackSession } from '../../domains/playback/PlaybackSession'

/**
 * Playback Repository Implementation
 *
 * Uses Training API for playback data
 * Backend: Training sessions can be replayed using metrics data
 */
export class PlaybackRepositoryImpl implements PlaybackRepository {
  async listSessions(): Promise<PlaybackSession[]> {
    try {
      // Backend: GET /api/v1/training/list (completed sessions)
      const response = await $fetch<{
        total: number
        page: number
        page_size: number
        sessions: any[]
      }>(API_ENDPOINTS.training.list, {
        params: {
          page: 1,
          page_size: 100,
        },
      })

      // Filter for completed sessions and convert to PlaybackSession
      return response.sessions
        .filter((s: any) => s.status === 'completed')
        .map((s: any) => ({
          id: s.id.toString(),
          sessionId: s.id.toString(),
          recordedAt: s.completed_at || s.created_at || new Date().toISOString(),
          durationSeconds: s.total_timesteps / 10, // Estimate based on timesteps
        }))
    } catch (error) {
      console.error('Failed to fetch playback sessions:', error)
      throw error
    }
  }

  async fetchFrames(sessionId: string): Promise<PlaybackFrame[]> {
    try {
      // Backend: GET /api/v1/training/sessions/{id}/metrics
      const response = await $fetch<{
        total: number
        page: number
        page_size: number
        metrics: any[]
      }>(API_ENDPOINTS.training.metrics(Number(sessionId)), {
        params: {
          page: 1,
          page_size: 1000, // Get all metrics for playback
        },
      })

      // Convert metrics to PlaybackFrame format
      return response.metrics.map((m: any, index: number) => ({
        frameNumber: index,
        timestep: m.timestep,
        state: {
          robot: { x: 0, y: 0, orientation: 0 }, // TODO: Get from environment data
          environment: {
            threatGrid: [],
            coverageMap: [],
          },
        },
        reward: m.reward,
        timestamp: m.timestamp || new Date().toISOString(),
      }))
    } catch (error) {
      console.error(`Failed to fetch playback frames for session ${sessionId}:`, error)
      throw error
    }
  }
}
