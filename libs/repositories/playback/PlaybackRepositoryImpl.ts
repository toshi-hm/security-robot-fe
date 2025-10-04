import { API_ENDPOINTS } from '../../../configs/api'

import type { PlaybackRepository } from './PlaybackRepository'
import type { PlaybackFrame } from '../../domains/playback/PlaybackFrame'
import type { PlaybackSession } from '../../domains/playback/PlaybackSession'

export class PlaybackRepositoryImpl implements PlaybackRepository {
  async listSessions(): Promise<PlaybackSession[]> {
    return await $fetch(`${API_ENDPOINTS.playback}/sessions`)
  }

  async fetchFrames(sessionId: string): Promise<PlaybackFrame[]> {
    return await $fetch(`${API_ENDPOINTS.playback}/sessions/${sessionId}/frames`)
  }
}
