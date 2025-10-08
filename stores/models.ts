import { defineStore } from 'pinia'

import { ref } from 'vue'

import type { ModelEntity } from '~/libs/entities/model/ModelEntity'
import { ModelRepositoryImpl } from '~/libs/repositories/model/ModelRepositoryImpl'

const repository = new ModelRepositoryImpl()

export const useModelsStore = defineStore('models', () => {
  const models = ref<ModelEntity[]>([])

  const fetchModels = async () => {
    models.value = await repository.listModels()
  }

  return {
    models,
    fetchModels,
  }
})
