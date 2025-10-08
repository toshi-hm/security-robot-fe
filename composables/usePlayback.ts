import { ref } from 'vue'

import type { PlaybackFrame } from '~/libs/domains/playback/PlaybackFrame'
import type { PlaybackSession } from '~/libs/domains/playback/PlaybackSession'
import type { PlaybackRepository } from '~/libs/repositories/playback/PlaybackRepository'
import { PlaybackRepositoryImpl } from '~/libs/repositories/playback/PlaybackRepositoryImpl'

/**
 * Playback管理Composable
 *
 * 依存性注入パターンでテスタビリティを確保
 * @param repository - PlaybackRepository (テスト時はモック注入可能)
 */
export const usePlayback = (repository: PlaybackRepository = new PlaybackRepositoryImpl()) => {
  const sessions = ref<PlaybackSession[]>([])
  const frames = ref<PlaybackFrame[]>([])

  const fetchSessions = async () => {
    sessions.value = await repository.listSessions()
  }

  const fetchFrames = async (sessionId: string) => {
    frames.value = await repository.fetchFrames(sessionId)
  }

  return {
    sessions,
    frames,
    fetchSessions,
    fetchFrames,
  }
}
