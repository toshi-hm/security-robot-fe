import type { EnvironmentStateResponseDTO } from '~/types/api'

export interface PlaybackFrame {
  timestamp: string
  environmentState: EnvironmentStateResponseDTO | null
  reward: number
}
