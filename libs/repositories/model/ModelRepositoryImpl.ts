import { API_ENDPOINTS } from '../../../configs/api'

import type { ModelRepository } from './ModelRepository'
import type { ModelEntity } from '../../entities/model/ModelEntity'

/**
 * Model Repository Implementation
 *
 * Uses Backend Files API for model file management
 * Backend API: FastAPI /api/v1/files/* endpoints
 */
export class ModelRepositoryImpl implements ModelRepository {
  async listModels(): Promise<ModelEntity[]> {
    try {
      // Backend: GET /api/v1/files/list?page=1&page_size=100
      const response = await $fetch<{
        total: number
        page: number
        page_size: number
        files: ModelEntity[]
      }>(API_ENDPOINTS.files.list, {
        params: {
          page: 1,
          page_size: 100,
        },
      })
      return response.files
    } catch (error) {
      console.error('Failed to fetch model list:', error)
      throw error
    }
  }

  async fetchModel(fileId: number): Promise<ModelEntity> {
    try {
      // Backend: GET /api/v1/files/{file_id}
      return await $fetch<ModelEntity>(API_ENDPOINTS.files.metadata(fileId))
    } catch (error) {
      console.error(`Failed to fetch model ${fileId}:`, error)
      throw error
    }
  }

  async uploadModel(file: File, metadata?: Record<string, any>): Promise<ModelEntity> {
    try {
      // Backend: POST /api/v1/files/ (multipart/form-data)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('file_type', 'model') // Required by backend
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata))
      }

      return await $fetch<ModelEntity>(API_ENDPOINTS.files.upload, {
        method: 'POST',
        body: formData,
      })
    } catch (error) {
      console.error('Failed to upload model:', error)
      throw error
    }
  }

  async downloadModel(fileId: number): Promise<Blob> {
    try {
      // Backend: GET /api/v1/files/{file_id}/download
      return await $fetch<Blob>(API_ENDPOINTS.files.download(fileId), {
        responseType: 'blob',
      })
    } catch (error) {
      console.error(`Failed to download model ${fileId}:`, error)
      throw error
    }
  }

  async deleteModel(fileId: number): Promise<boolean> {
    try {
      // Backend: DELETE /api/v1/files/{file_id}
      await $fetch(API_ENDPOINTS.files.delete(fileId), {
        method: 'DELETE',
      })
      return true
    } catch (error) {
      console.error(`Failed to delete model ${fileId}:`, error)
      return false
    }
  }
}
