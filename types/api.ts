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
