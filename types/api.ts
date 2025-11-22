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
 *
 * Note: Backend API returns grid data in {levels: [...]} format:
 * - threat_grid: {levels: number[][]}
 * - coverage_map: {levels: number[][]} | null
 * - obstacles: {levels: boolean[][]} | null
 *
 * PlaybackRepositoryImpl.normalizeEnvironmentState() extracts the levels
 * and normalizes them to array format, so this type represents the normalized data.
 */
export interface EnvironmentStateResponseDTO {
  id: number
  session_id: number
  episode: number
  step: number
  robot_x: number
  robot_y: number
  robot_orientation: number
  threat_grid: number[][] // Backend: {levels: number[][]}, normalized to number[][]
  coverage_map: number[][] | null // Backend: {levels: number[][]} | null, normalized to number[][] | null
  obstacles?: boolean[][] | null // 障害物マップ (ランダムマップ学習) - Backend: {levels: boolean[][]} | null, normalized to boolean[][] | null
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

// ============================================
// Template Agents API Types (Session 056)
// ============================================

/**
 * Template Agent Type Enum
 * Backend: TemplateAgentType
 */
export type TemplateAgentType = 'horizontal_scan' | 'vertical_scan' | 'spiral' | 'random_walk'

/**
 * Template Agent Type Definition
 * Backend: GET /template-agents/types response
 */
export interface TemplateAgentTypeDefinition {
  type: TemplateAgentType
  name: string
  description: string
}

/**
 * Template Agent Execute Request
 * Backend: TemplateAgentExecuteRequest
 */
export interface TemplateAgentExecuteRequest {
  agent_type: TemplateAgentType
  width?: number
  height?: number
  episodes?: number
  max_steps?: number
  seed?: number | null
  save_frames?: boolean
  execution_id?: string | null
}

/**
 * Template Agent Episode Metrics
 * Backend: TemplateAgentEpisodeMetrics
 */
export interface TemplateAgentEpisodeMetrics {
  episode: number
  total_reward: number
  episode_length: number
  coverage_ratio: number
  patrol_count: number
  move_count: number
  turn_count: number
  min_battery: number
  battery_deaths: number
  charging_events: number
}

/**
 * Template Agent Execute Response
 * Backend: TemplateAgentExecuteResponse
 */
export interface TemplateAgentExecuteResponse {
  agent_type: TemplateAgentType
  agent_name: string
  execution_id: string
  environment: {
    width: number
    height: number
  }
  episodes: number
  average_reward: number
  std_reward: number
  average_coverage: number
  average_episode_length: number
  average_patrol_count: number
  average_min_battery: number
  total_battery_deaths: number
  episode_metrics: TemplateAgentEpisodeMetrics[]
  // Future: Playback & Environment info (Backend implementation pending)
  environment_info?: TemplateAgentEnvironmentInfo
  episode_playbacks?: TemplateAgentEpisodePlayback[]
}

/**
 * Template Agent Compare Request
 * Backend: TemplateAgentCompareRequest
 */
export interface TemplateAgentCompareRequest {
  agent_types: TemplateAgentType[]
  width?: number
  height?: number
  episodes?: number
  max_steps?: number
  seed?: number | null
}

/**
 * Template Agent Comparison Summary
 * Backend: TemplateAgentComparisonSummary
 */
export interface TemplateAgentComparisonSummary {
  agent_type: TemplateAgentType
  agent_name: string
  rank: number
  average_reward: number
  std_reward: number
  average_coverage: number
  average_episode_length: number
  average_patrol_count: number
  average_min_battery: number
  total_battery_deaths: number
}

/**
 * Template Agent Compare Response
 * Backend: TemplateAgentCompareResponse
 */
export interface TemplateAgentCompareResponse {
  environment: {
    width: number
    height: number
  }
  episodes: number
  max_steps: number
  results: TemplateAgentComparisonSummary[]
  best_agent: string
  worst_agent: string
  performance_gap: number
}

/**
 * Template Agent Frame Data (for Playback)
 * Backend: TemplateAgentFrameData (Future implementation)
 */
export interface TemplateAgentFrameData {
  timestep: number
  robot_x: number
  robot_y: number
  robot_orientation: number // 0=North, 1=East, 2=South, 3=West
  action: number // 0=move, 1=turn_left, 2=turn_right, 3=patrol
  reward: number
  battery_percentage: number
  is_charging: boolean
  coverage_map: number[][]
  threat_grid?: number[][]
  timestamp: string
}

/**
 * Template Agent Episode Playback
 * Backend: TemplateAgentEpisodePlayback (Future implementation)
 */
export interface TemplateAgentEpisodePlayback {
  episode: number
  frames: TemplateAgentFrameData[]
  total_reward: number
  final_coverage: number
  episode_length: number
}

/**
 * Template Agent Environment Info
 * Backend: TemplateAgentEnvironmentInfo (Future implementation)
 */
export interface TemplateAgentEnvironmentInfo {
  width: number
  height: number
  threat_grid: number[][]
  obstacles: boolean[][]
  charging_station: {
    x: number
    y: number
  }
  suspicious_objects: Array<{
    x: number
    y: number
    type: string
    threat_level: number
  }>
}

/**
 * Template Agent Progress Message (WebSocket)
 * Backend: Future WebSocket implementation
 */
export interface TemplateAgentProgressMessage extends BaseWebSocketMessage {
  type: 'execution_started' | 'episode_started' | 'step_update' | 'episode_completed' | 'execution_completed'
  execution_id?: string
  episode?: number
  step?: number
  total_episodes?: number
  total_steps_per_episode?: number
  current_reward?: number
  current_coverage?: number
  battery_percentage?: number
  total_reward?: number
  coverage?: number
  episode_length?: number
  result_url?: string
}
