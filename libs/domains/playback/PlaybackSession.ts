/**
 * Playback Session Domain Model
 * Backend API: PlaybackSessionSummary を元に拡張
 */
export interface PlaybackSession {
  // Core identifiers
  id: string // Frontend internal ID (session_id as string)
  sessionId: number // Training session ID (Backend: session_id)
  name: string // Display name of the training job

  // Training configuration
  algorithm: 'ppo' | 'a3c'
  environmentType: string // standard or enhanced
  status: string // Training job status

  // Training progress
  totalTimesteps: number
  currentTimestep: number
  episodesCompleted: number

  // Playback-specific metadata
  frameCount: number // Number of recorded playback frames
  firstEpisode: number | null // Lowest episode index with frames
  lastEpisode: number | null // Highest episode index with frames
  lastStep: number | null // Highest step value among recorded frames

  // Timestamps
  recordedAt: string // When the session was first recorded (first_recorded_at or created_at)
  lastRecordedAt: string | null // Timestamp of the most recent frame
  createdAt: string | null // Job creation timestamp
  startedAt: string | null // Training start timestamp
  completedAt: string | null // Training completion timestamp

  // Computed properties
  durationSeconds: number // Estimated duration based on timestamps
}
