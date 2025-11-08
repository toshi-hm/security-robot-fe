import { defineStore } from 'pinia'

import { ref } from 'vue'

import { useModels } from '~/composables/useModels'

/**
 * Models Store
 *
 * Manages model files using Backend Files API
 * Features: list, upload, download, delete
 */
export const useModelsStore = defineStore('models', () => {
  const service = useModels()

  // Additional state for UI
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const uploadProgress = ref(0)

  /**
   * Fetch all model files
   */
  const fetchModels = async () => {
    isLoading.value = true
    error.value = null

    try {
      await service.listModels()
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
  const uploadModel = async (file: File, metadata?: Record<string, unknown>) => {
    isLoading.value = true
    error.value = null
    uploadProgress.value = 0

    try {
      await service.uploadModel(file, metadata, (progress: number) => {
        uploadProgress.value = progress
      })
      uploadProgress.value = 100
    } catch (err) {
      error.value = 'モデルのアップロードに失敗しました'
      uploadProgress.value = 0
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
      const blob = await service.downloadModel(fileId)

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
      const success = await service.deleteModel(fileId)
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
    // From service
    models: service.models,

    // Additional state
    isLoading,
    error,
    uploadProgress,

    // Actions
    fetchModels,
    uploadModel,
    downloadModel,
    deleteModel,
  }
})
