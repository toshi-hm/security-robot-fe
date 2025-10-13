import { setActivePinia, createPinia } from 'pinia'

import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useModelsStore } from '~/stores/models'

// Mock useModels composable
const mockListModels = vi.fn()
const mockUploadModel = vi.fn()
const mockDownloadModel = vi.fn()
const mockDeleteModel = vi.fn()

vi.mock('~/composables/useModels', () => ({
  useModels: () => ({
    models: { value: [] },
    listModels: mockListModels,
    uploadModel: mockUploadModel,
    downloadModel: mockDownloadModel,
    deleteModel: mockDeleteModel,
  }),
}))

describe('Models Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const store = useModelsStore()

      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('fetchModels', () => {
    it('should fetch models successfully', async () => {
      mockListModels.mockResolvedValueOnce(undefined)
      const store = useModelsStore()

      await store.fetchModels()

      expect(mockListModels).toHaveBeenCalledOnce()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should set loading state during fetch', async () => {
      let loadingDuringFetch = false
      mockListModels.mockImplementationOnce(async () => {
        loadingDuringFetch = store.isLoading
      })

      const store = useModelsStore()
      await store.fetchModels()

      expect(loadingDuringFetch).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('should handle fetch errors', async () => {
      const error = new Error('Network error')
      mockListModels.mockRejectedValueOnce(error)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = useModelsStore()

      await expect(store.fetchModels()).rejects.toThrow('Network error')
      expect(store.error).toBe('モデル一覧の取得に失敗しました')
      expect(store.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch models:', error)

      consoleSpy.mockRestore()
    })
  })

  describe('uploadModel', () => {
    it('should upload model successfully', async () => {
      mockUploadModel.mockResolvedValueOnce(undefined)
      const store = useModelsStore()
      const file = new File(['content'], 'model.pth', { type: 'application/octet-stream' })
      const metadata = { description: 'Test model' }

      await store.uploadModel(file, metadata)

      expect(mockUploadModel).toHaveBeenCalledWith(file, metadata)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should upload model without metadata', async () => {
      mockUploadModel.mockResolvedValueOnce(undefined)
      const store = useModelsStore()
      const file = new File(['content'], 'model.pth', { type: 'application/octet-stream' })

      await store.uploadModel(file)

      expect(mockUploadModel).toHaveBeenCalledWith(file, undefined)
    })

    it('should set loading state during upload', async () => {
      let loadingDuringUpload = false
      mockUploadModel.mockImplementationOnce(async () => {
        loadingDuringUpload = store.isLoading
      })

      const store = useModelsStore()
      const file = new File(['content'], 'model.pth', { type: 'application/octet-stream' })
      await store.uploadModel(file)

      expect(loadingDuringUpload).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed')
      mockUploadModel.mockRejectedValueOnce(error)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = useModelsStore()
      const file = new File(['content'], 'model.pth', { type: 'application/octet-stream' })

      await expect(store.uploadModel(file)).rejects.toThrow('Upload failed')
      expect(store.error).toBe('モデルのアップロードに失敗しました')
      expect(store.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to upload model:', error)

      consoleSpy.mockRestore()
    })
  })

  describe('downloadModel', () => {
    let createObjectURLSpy: any
    let revokeObjectURLSpy: any
    let clickSpy: any

    beforeEach(() => {
      createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})
      clickSpy = vi.fn()

      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          return {
            href: '',
            download: '',
            click: clickSpy,
          } as any
        }
        return document.createElement(tag)
      })
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any)
    })

    it('should download model successfully', async () => {
      const mockBlob = new Blob(['mock data'], { type: 'application/octet-stream' })
      mockDownloadModel.mockResolvedValueOnce(mockBlob)

      const store = useModelsStore()
      await store.downloadModel(1, 'model.pth')

      expect(mockDownloadModel).toHaveBeenCalledWith(1)
      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob)
      expect(clickSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should set loading state during download', async () => {
      let loadingDuringDownload = false
      mockDownloadModel.mockImplementationOnce(async () => {
        loadingDuringDownload = store.isLoading
        return new Blob(['mock data'])
      })

      const store = useModelsStore()
      await store.downloadModel(1, 'model.pth')

      expect(loadingDuringDownload).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('should handle download errors', async () => {
      const error = new Error('Download failed')
      mockDownloadModel.mockRejectedValueOnce(error)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = useModelsStore()

      await expect(store.downloadModel(1, 'model.pth')).rejects.toThrow('Download failed')
      expect(store.error).toBe('モデルのダウンロードに失敗しました')
      expect(store.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to download model:', error)

      consoleSpy.mockRestore()
    })
  })

  describe('deleteModel', () => {
    it('should delete model successfully', async () => {
      mockDeleteModel.mockResolvedValueOnce(true)
      const store = useModelsStore()

      const result = await store.deleteModel(1)

      expect(mockDeleteModel).toHaveBeenCalledWith(1)
      expect(result).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should set loading state during deletion', async () => {
      let loadingDuringDelete = false
      mockDeleteModel.mockImplementationOnce(async () => {
        loadingDuringDelete = store.isLoading
        return true
      })

      const store = useModelsStore()
      await store.deleteModel(1)

      expect(loadingDuringDelete).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('should handle delete errors and return false', async () => {
      const error = new Error('Delete failed')
      mockDeleteModel.mockRejectedValueOnce(error)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = useModelsStore()
      const result = await store.deleteModel(1)

      expect(result).toBe(false)
      expect(store.error).toBe('モデルの削除に失敗しました')
      expect(store.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete model:', error)

      consoleSpy.mockRestore()
    })
  })
})
