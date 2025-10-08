import type { ModelEntity } from '../../entities/model/ModelEntity'

/**
 * Model Repository Interface
 *
 * Manages model files using Backend Files API
 * Backend endpoints: /api/v1/files/*
 */
export interface ModelRepository {
  /**
   * List all model files
   */
  listModels(): Promise<ModelEntity[]>

  /**
   * Get model file metadata by ID
   */
  fetchModel(fileId: number): Promise<ModelEntity>

  /**
   * Upload a new model file
   */
  uploadModel(file: File, metadata?: Record<string, any>): Promise<ModelEntity>

  /**
   * Download model file by ID
   */
  downloadModel(fileId: number): Promise<Blob>

  /**
   * Delete model file by ID
   */
  deleteModel(fileId: number): Promise<boolean>
}
