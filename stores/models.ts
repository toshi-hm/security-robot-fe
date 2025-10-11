import { defineStore } from 'pinia'

import { ref } from 'vue'

import type { ModelEntity } from '~/libs/entities/model/ModelEntity'
import { ModelRepositoryImpl } from '~/libs/repositories/model/ModelRepositoryImpl'

const repository = new ModelRepositoryImpl()

/**
 * Models Store
 *
 * Manages model files using Backend Files API
 * Features: list, upload, download, delete
 */
export const useModelsStore = defineStore('models', () => {
  const models = ref<ModelEntity[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all model files
   */
  const fetchModels = async () => {
    isLoading.value = true
    error.value = null

    try {
      models.value = await repository.listModels()
    } catch (err) {
      error.value = 'モデル一覧の取得に失敗しました'
      console.error('Failed to fetch models:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Upload a new model file
   */
  const uploadModel = async (file: File, metadata?: Record<string, any>): Promise<ModelEntity> => {
    isLoading.value = true
    error.value = null

    try {
      const newModel = await repository.uploadModel(file, metadata)
      models.value.push(newModel)
      return newModel
    } catch (err) {
      error.value = 'モデルのアップロードに失敗しました'
      console.error('Failed to upload model:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Download a model file
   */
  const downloadModel = async (fileId: number, filename: string) => {
    isLoading.value = true
    error.value = null

    try {
      const blob = await repository.downloadModel(fileId)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = 'モデルのダウンロードに失敗しました'
      console.error('Failed to download model:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a model file
   */
  const deleteModel = async (fileId: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const success = await repository.deleteModel(fileId)
      if (success) {
        models.value = models.value.filter((m) => m.id !== fileId)
      }
      return success
    } catch (err) {
      error.value = 'モデルの削除に失敗しました'
      console.error('Failed to delete model:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    models,
    isLoading,
    error,

    // Actions
    fetchModels,
    uploadModel,
    downloadModel,
    deleteModel,
  }
})
