import type { MapType } from '~/libs/domains/training/TrainingConfig'
import { TrainingSession } from '~/libs/domains/training/TrainingSession'

/**
 * Training Session Config型
 * Backend の config フィールドに渡す設定
 */
export interface TrainingSessionConfigDTO {
  map_config?: {
    map_type: string
    seed?: number
    count?: number
    initial_wall_probability?: number
  }
}

export interface TrainingSessionDTO {
  id: number
  name: string
  algorithm: 'ppo' | 'a3c'
  environment_type: 'standard' | 'enhanced'
  status: 'created' | 'queued' | 'running' | 'paused' | 'completed' | 'failed'
  total_timesteps: number
  current_timestep: number
  episodes_completed: number
  env_width: number
  env_height: number
  num_robots?: number
  coverage_weight: number
  exploration_weight: number
  diversity_weight: number
  learning_rate?: number
  batch_size?: number
  num_workers?: number
  model_path?: string | null
  config?: TrainingSessionConfigDTO | null
  created_at?: string | null
  started_at?: string | null
  completed_at?: string | null
}

export class TrainingSessionEntity {
  static toDomain(dto: TrainingSessionDTO): TrainingSession {
    // Extract map_config from config.map_config
    const mapConfig = dto.config?.map_config
      ? {
          mapType: dto.config.map_config.map_type as MapType,
          seed: dto.config.map_config.seed,
          count: dto.config.map_config.count,
          initialWallProbability: dto.config.map_config.initial_wall_probability,
        }
      : null

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
      dto.num_robots ?? 1,
      dto.coverage_weight,
      dto.exploration_weight,
      dto.diversity_weight,
      dto.created_at ? new Date(dto.created_at) : new Date(),
      new Date(), // updatedAt
      dto.learning_rate ?? null,
      dto.batch_size ?? null,
      mapConfig,
      dto.model_path,
      (dto.config as Record<string, unknown>) ?? null,
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
      num_robots: domain.numRobots,
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
