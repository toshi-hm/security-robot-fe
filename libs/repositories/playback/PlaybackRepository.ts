import type { PlaybackFrame } from '../../domains/playback/PlaybackFrame'
import type { PlaybackSession } from '../../domains/playback/PlaybackSession'

export interface PlaybackRepository {
  listSessions(): Promise<PlaybackSession[]>
  fetchFrames(sessionId: string): Promise<PlaybackFrame[]>
}
