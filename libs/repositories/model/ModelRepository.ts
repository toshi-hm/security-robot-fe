import type { ModelEntity } from '../../entities/model/ModelEntity'

export interface ModelRepository {
  listModels(): Promise<ModelEntity[]>
  fetchModel(modelId: string): Promise<ModelEntity>
}
