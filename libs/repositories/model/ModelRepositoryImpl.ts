import { API_ENDPOINTS } from '../../../configs/api'

import type { ModelRepository } from './ModelRepository'
import type { ModelEntity } from '../../entities/model/ModelEntity'

export class ModelRepositoryImpl implements ModelRepository {
  async listModels(): Promise<ModelEntity[]> {
    return await $fetch(`${API_ENDPOINTS.models}`)
  }

  async fetchModel(modelId: string): Promise<ModelEntity> {
    return await $fetch(`${API_ENDPOINTS.models}/${modelId}`)
  }
}
