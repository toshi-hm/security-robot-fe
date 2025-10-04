import { PlaybackRepositoryImpl } from '~/libs/repositories/playback/PlaybackRepositoryImpl'
import type { PlaybackFrame } from '~/libs/domains/playback/PlaybackFrame'
import type { PlaybackSession } from '~/libs/domains/playback/PlaybackSession'

const repository = new PlaybackRepositoryImpl()

export const usePlayback = () => {
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
