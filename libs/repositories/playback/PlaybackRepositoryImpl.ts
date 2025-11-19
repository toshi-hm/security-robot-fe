import type {
  PaginatedPlaybackSessionsResponse,
  PaginatedPlaybackFramesResponse,
  PlaybackSessionSummaryDTO,
  EnvironmentStateResponseDTO,
} from '~/types/api'

import { API_ENDPOINTS } from '../../../configs/api'
import { normalizeGridMatrix } from '~/utils/gridHelpers'

import type { PlaybackRepository } from './PlaybackRepository'
import type { PlaybackFrame } from '../../domains/playback/PlaybackFrame'
import type { PlaybackSession } from '../../domains/playback/PlaybackSession'

/**
 * Playback Repository Implementation
 *
 * Uses Backend Playback API (not Training API)
 * Backend: GET /api/v1/playback/sessions, GET /api/v1/playback/{session_id}/frames
 */
export class PlaybackRepositoryImpl implements PlaybackRepository {
  /**
   * Convert Backend DTO to Domain Model
   */
  private toDomain(dto: PlaybackSessionSummaryDTO): PlaybackSession {
    // Calculate duration from timestamps
    let durationSeconds = 0
    if (dto.started_at && dto.completed_at) {
      const start = new Date(dto.started_at).getTime()
      const end = new Date(dto.completed_at).getTime()
      durationSeconds = (end - start) / 1000
    } else if (dto.first_recorded_at && dto.last_recorded_at) {
      const start = new Date(dto.first_recorded_at).getTime()
      const end = new Date(dto.last_recorded_at).getTime()
      durationSeconds = (end - start) / 1000
    }

    return {
      id: dto.session_id.toString(),
      sessionId: dto.session_id,
      name: dto.name,
      algorithm: dto.algorithm,
      environmentType: dto.environment_type,
      status: dto.status,
      totalTimesteps: dto.total_timesteps,
      currentTimestep: dto.current_timestep,
      episodesCompleted: dto.episodes_completed,
      frameCount: dto.frame_count,
      firstEpisode: dto.first_episode,
      lastEpisode: dto.last_episode,
      lastStep: dto.last_step,
      recordedAt: dto.first_recorded_at || dto.created_at || new Date().toISOString(),
      lastRecordedAt: dto.last_recorded_at,
      createdAt: dto.created_at,
      startedAt: dto.started_at,
      completedAt: dto.completed_at,
      durationSeconds,
    }
  }

  private normalizeEnvironmentState(state: EnvironmentStateResponseDTO): EnvironmentStateResponseDTO {
    return {
      ...state,
      threat_grid: normalizeGridMatrix(state.threat_grid),
      coverage_map: state.coverage_map ? normalizeGridMatrix(state.coverage_map) : null,
    }
  }

  async listSessions(): Promise<PlaybackSession[]> {
    try {
      // Backend: GET /api/v1/playback/sessions
      const response = await $fetch<PaginatedPlaybackSessionsResponse>(API_ENDPOINTS.playback.sessions, {
        params: {
          page: 1,
          page_size: 100,
        },
      })

      return response.sessions.map((dto) => this.toDomain(dto))
    } catch (error) {
      console.error('Failed to fetch playback sessions:', error)

      // ユーザーフレンドリーなエラーメッセージ
      const message =
        error instanceof Error
          ? `プレイバックセッションの取得に失敗しました: ${error.message}`
          : 'プレイバックセッションの取得中に予期しないエラーが発生しました'

      throw new Error(message)
    }
  }

  async fetchFrames(sessionId: string): Promise<PlaybackFrame[]> {
    try {
      // Backend: GET /api/v1/playback/{session_id}/frames
      const response = await $fetch<PaginatedPlaybackFramesResponse>(API_ENDPOINTS.playback.frames(Number(sessionId)), {
        params: {
          page: 1,
          page_size: 1000, // Get all frames for playback
        },
      })

      // Convert environment state response to PlaybackFrame format
      return response.frames.map((frame) => {
        const environmentState = this.normalizeEnvironmentState(frame)
        return {
          timestamp: environmentState.created_at || new Date().toISOString(),
          environmentState,
          reward: environmentState.reward_received || 0,
        }
      })
    } catch (error) {
      console.error(`Failed to fetch playback frames for session ${sessionId}:`, error)

      // ユーザーフレンドリーなエラーメッセージ
      const message =
        error instanceof Error
          ? `セッション${sessionId}のプレイバックフレーム取得に失敗しました: ${error.message}`
          : `セッション${sessionId}のプレイバックフレーム取得中に予期しないエラーが発生しました`

      throw new Error(message)
    }
  }
}
