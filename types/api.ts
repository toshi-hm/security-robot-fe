export interface ApiResponse<T> {
  data: T
  message?: string
}

/**
 * Training Session作成リクエスト型
 * Backend API schema (TrainingSessionCreate) との契約を明示
 *
 * Note: learning_rate, batch_size, num_workers は optional
 * （TrainingConfig との型整合性を確保）
 */
export interface TrainingSessionCreateRequest {
  name: string
  algorithm: 'ppo' | 'a3c'
  environment_type: 'standard' | 'enhanced'
  total_timesteps: number
  env_width: number
  env_height: number
  coverage_weight: number
  exploration_weight: number
  diversity_weight: number
  learning_rate?: number
  batch_size?: number
  num_workers?: number
}

/**
 * Training Session Response型
 * Backend: TrainingSessionResponse
 */
export interface TrainingSessionDTO {
  id: number
  name: string
  algorithm: 'ppo' | 'a3c'
  environment_type: string
  status: string
  total_timesteps: number
  current_timestep: number
  episodes_completed: number
  env_width: number
  env_height: number
  coverage_weight: number
  exploration_weight: number
  diversity_weight: number
  learning_rate: number
  batch_size: number
  num_workers: number
  model_path: string | null
  log_path: string | null
  config: Record<string, unknown> | null
  created_at: string
  updated_at: string
  started_at: string | null
  completed_at: string | null
}

/**
 * Training Metric Response型
 * Backend: TrainingMetricResponse
 */
export interface TrainingMetricDTO {
  id: number
  job_id: number
  timestep: number
  episode: number | null
  reward: number
  loss: number | null
  coverage_ratio: number | null
  exploration_score: number | null
  threat_level_avg: number | null
  additional_metrics: Record<string, unknown> | null
  timestamp: string
  created_at: string
  updated_at: string
}

/**
 * Paginated response for sessions
 * Backend: TrainingSessionListResponse
 */
export interface PaginatedSessionsResponse {
  total: number
  page: number
  page_size: number
  sessions: TrainingSessionDTO[]
}

/**
 * Paginated response for metrics
 * Backend: TrainingMetricsListResponse
 */
export interface PaginatedMetricsResponse {
  total: number
  page: number
  page_size: number
  metrics: TrainingMetricDTO[]
}

/**
 * WebSocket Message Types
 * Backend: app/schemas/websocket.py
 */

export interface BaseWebSocketMessage {
  type: string
  timestamp?: string
}

export interface TrainingProgressMessage extends BaseWebSocketMessage {
  type: 'training_progress'
  session_id: number
  timestep: number
  episode?: number | null
  reward: number
  loss?: number | null
  coverage_ratio?: number | null
  exploration_score?: number | null
  threat_level_avg?: number | null
  additional_metrics?: Record<string, unknown> | null
  data?: {
    timestep?: number
    episode?: number
    reward?: number
    loss?: number | null
    coverage_ratio?: number | null
    exploration_score?: number | null
  }
}

export interface TrainingStatusMessage extends BaseWebSocketMessage {
  type: 'training_status'
  session_id: number
  status: string
  message?: string | null
}

export interface TrainingErrorMessage extends BaseWebSocketMessage {
  type: 'training_error'
  session_id: number
  error_message: string
  message?: string
  error_type?: string | null
}

export interface EnvironmentUpdateMessage extends BaseWebSocketMessage {
  type: 'environment_update'
  session_id: number
  episode: number
  step: number
  robot_position: { x: number; y: number; orientation?: number } | [number, number]
  robot_orientation?: number | null
  action_taken?: number | null
  reward_received?: number | null
  grid_width?: number
  grid_height?: number
  coverage_map?: number[][]
  threat_grid?: number[][]
  // バッテリーシステム (Session 050)
  battery_percentage?: number
  is_charging?: boolean
  distance_to_charging_station?: number
  charging_station_position_x?: number
  charging_station_position_y?: number
}

export interface ConnectionAckMessage extends BaseWebSocketMessage {
  type: 'connection_ack'
  client_id: string
  message?: string
}

export interface PongMessage extends BaseWebSocketMessage {
  type: 'pong'
}

export type WebSocketMessage =
  | TrainingProgressMessage
  | TrainingStatusMessage
  | TrainingErrorMessage
  | EnvironmentUpdateMessage
  | ConnectionAckMessage
  | PongMessage

/**
 * Playback Session Summary型
 * Backend: PlaybackSessionSummary
 */
export interface PlaybackSessionSummaryDTO {
  session_id: number
  name: string
  algorithm: 'ppo' | 'a3c'
  environment_type: string
  status: string
  total_timesteps: number
  current_timestep: number
  episodes_completed: number
  frame_count: number
  first_episode: number | null
  last_episode: number | null
  first_recorded_at: string | null
  last_recorded_at: string | null
  last_step: number | null
  created_at: string | null
  started_at: string | null
  completed_at: string | null
}

/**
 * Paginated response for playback sessions
 * Backend: PlaybackSessionListResponse
 */
export interface PaginatedPlaybackSessionsResponse {
  total: number
  page: number
  page_size: number
  sessions: PlaybackSessionSummaryDTO[]
}

/**
 * Environment State Response型 (for playback frames)
 * Backend: EnvironmentStateResponse
 */
export interface EnvironmentStateResponseDTO {
  id: number
  session_id: number
  episode: number
  step: number
  robot_x: number
  robot_y: number
  robot_orientation: number
  threat_grid: number[][]
  coverage_map: number[][] | null
  suspicious_objects: Array<{
    id: number
    x: number
    y: number
    threat_level: number
  }> | null
  action_taken: number | null
  reward_received: number | null
  created_at: string
  updated_at: string
  // バッテリーシステム (Session 050)
  battery_percentage?: number
  is_charging?: boolean
  distance_to_charging_station?: number
  charging_station_position_x?: number
  charging_station_position_y?: number
}

/**
 * Paginated response for playback frames
 * Backend: PlaybackFramesListResponse
 */
export interface PaginatedPlaybackFramesResponse {
  total: number
  page: number
  page_size: number
  frames: EnvironmentStateResponseDTO[]
}

/**
 * Error type for API errors
 */
export interface ApiError {
  status?: number
  message?: string
  response?: {
    status?: number
  }
}
