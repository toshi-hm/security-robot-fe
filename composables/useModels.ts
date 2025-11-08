import { ref } from 'vue'

import type { ModelEntity } from '~/libs/entities/model/ModelEntity'
import type { ModelRepository } from '~/libs/repositories/model/ModelRepository'
import { ModelRepositoryImpl } from '~/libs/repositories/model/ModelRepositoryImpl'

/**
 * Models管理Composable
 *
 * 依存性注入パターンでテスタビリティを確保
 * @param repository - ModelRepository (テスト時はモック注入可能)
 */
export const useModels = (repository?: ModelRepository) => {
  const repo = repository || new ModelRepositoryImpl()
  const models = ref<ModelEntity[]>([])

  const listModels = async () => {
    models.value = await repo.listModels()
  }

  const uploadModel = async (
    file: File,
    metadata?: Record<string, unknown>,
    onProgress?: (progress: number) => void
  ): Promise<ModelEntity> => {
    const newModel = await repo.uploadModel(file, metadata, onProgress)
    models.value.push(newModel)
    return newModel
  }

  const downloadModel = async (fileId: number): Promise<Blob> => {
    return await repo.downloadModel(fileId)
  }

  const deleteModel = async (fileId: number): Promise<boolean> => {
    const success = await repo.deleteModel(fileId)
    if (success) {
      models.value = models.value.filter((m) => m.id !== fileId)
    }
    return success
  }

  return {
    models,
    listModels,
    uploadModel,
    downloadModel,
    deleteModel,
  }
}
