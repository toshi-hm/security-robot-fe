import { TrainingSession } from '~/libs/domains/training/TrainingSession'

export interface TrainingSessionDTO {
  id: number
  name: string
  algorithm: 'ppo' | 'a3c'
  environment_type: 'standard' | 'enhanced'
  status: 'created' | 'running' | 'paused' | 'completed' | 'failed'
  total_timesteps: number
  current_timestep: number
  episodes_completed: number
  env_width: number
  env_height: number
  coverage_weight: number
  exploration_weight: number
  diversity_weight: number
  model_path?: string | null
  config?: Record<string, unknown> | null
  created_at?: string | null
  started_at?: string | null
  completed_at?: string | null
}

export class TrainingSessionEntity {
  static toDomain(dto: TrainingSessionDTO): TrainingSession {
    return new TrainingSession(
      dto.id,
      dto.name,
      dto.algorithm,
      dto.environment_type,
      dto.status,
      dto.total_timesteps,
      dto.current_timestep,
      dto.episodes_completed,
      dto.env_width,
      dto.env_height,
      dto.coverage_weight,
      dto.exploration_weight,
      dto.diversity_weight,
      dto.model_path,
      dto.config ?? null,
      dto.created_at ? new Date(dto.created_at) : undefined,
      dto.started_at ? new Date(dto.started_at) : undefined,
      dto.completed_at ? new Date(dto.completed_at) : null
    )
  }

  static fromDomain(domain: TrainingSession): TrainingSessionDTO {
    return {
      id: domain.id,
      name: domain.name,
      algorithm: domain.algorithm,
      environment_type: domain.environmentType,
      status: domain.status,
      total_timesteps: domain.totalTimesteps,
      current_timestep: domain.currentTimestep,
      episodes_completed: domain.episodesCompleted,
      env_width: domain.envWidth,
      env_height: domain.envHeight,
      coverage_weight: domain.coverageWeight,
      exploration_weight: domain.explorationWeight,
      diversity_weight: domain.diversityWeight,
      model_path: domain.modelPath ?? null,
      config: domain.config ?? null,
      created_at: domain.createdAt?.toISOString() ?? null,
      started_at: domain.startedAt?.toISOString() ?? null,
      completed_at: domain.completedAt?.toISOString() ?? null,
    }
  }
}
