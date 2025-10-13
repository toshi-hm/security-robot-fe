import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useModels } from '~/composables/useModels'
import type { ModelEntity } from '~/libs/entities/model/ModelEntity'
import type { ModelRepository } from '~/libs/repositories/model/ModelRepository'

describe('useModels', () => {
  let mockRepository: ModelRepository
  const mockModels: ModelEntity[] = [
    {
      id: 1,
      filename: 'model1.pth',
      original_filename: 'my_model.pth',
      file_path: '/models/model1.pth',
      file_size: 1024,
      file_type: 'model',
      content_type: 'application/octet-stream',
      training_job_id: null,
      description: 'Test model 1',
      metadata: { accuracy: 0.95 },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      filename: 'model2.pth',
      original_filename: 'another_model.pth',
      file_path: '/models/model2.pth',
      file_size: 2048,
      file_type: 'model',
      content_type: 'application/octet-stream',
      training_job_id: 1,
      description: 'Test model 2',
      metadata: null,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ]

  beforeEach(() => {
    mockRepository = {
      listModels: vi.fn(),
      fetchModel: vi.fn(),
      uploadModel: vi.fn(),
      downloadModel: vi.fn(),
      deleteModel: vi.fn(),
    }
  })

  describe('Initialization', () => {
    it('should initialize with empty models array', () => {
      const { models } = useModels(mockRepository)

      expect(models.value).toEqual([])
    })

    it('should work without repository parameter (uses default)', () => {
      const { models, listModels } = useModels()

      expect(models.value).toEqual([])
      expect(listModels).toBeDefined()
    })
  })

  describe('listModels', () => {
    it('should fetch and populate models', async () => {
      vi.mocked(mockRepository.listModels).mockResolvedValueOnce(mockModels)
      const { models, listModels } = useModels(mockRepository)

      await listModels()

      expect(mockRepository.listModels).toHaveBeenCalledOnce()
      expect(models.value).toEqual(mockModels)
      expect(models.value).toHaveLength(2)
    })

    it('should update models when called multiple times', async () => {
      const updatedModels = [...mockModels, {
        ...mockModels[0],
        id: 3,
        filename: 'model3.pth',
      }]

      vi.mocked(mockRepository.listModels)
        .mockResolvedValueOnce(mockModels)
        .mockResolvedValueOnce(updatedModels)

      const { models, listModels } = useModels(mockRepository)

      await listModels()
      expect(models.value).toHaveLength(2)

      await listModels()
      expect(models.value).toHaveLength(3)
    })

    it('should handle empty response', async () => {
      vi.mocked(mockRepository.listModels).mockResolvedValueOnce([])
      const { models, listModels } = useModels(mockRepository)

      await listModels()

      expect(models.value).toEqual([])
    })

    it('should propagate errors from repository', async () => {
      const error = new Error('Network error')
      vi.mocked(mockRepository.listModels).mockRejectedValueOnce(error)
      const { listModels } = useModels(mockRepository)

      await expect(listModels()).rejects.toThrow('Network error')
    })
  })

  describe('uploadModel', () => {
    const newModel: ModelEntity = {
      id: 3,
      filename: 'uploaded.pth',
      original_filename: 'user_upload.pth',
      file_path: '/models/uploaded.pth',
      file_size: 4096,
      file_type: 'model',
      content_type: 'application/octet-stream',
      training_job_id: null,
      description: 'Uploaded model',
      metadata: { version: '1.0' },
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    }

    it('should upload model and add to models array', async () => {
      vi.mocked(mockRepository.uploadModel).mockResolvedValueOnce(newModel)
      const { models, uploadModel } = useModels(mockRepository)
      const file = new File(['content'], 'model.pth', { type: 'application/octet-stream' })
      const metadata = { version: '1.0' }

      const result = await uploadModel(file, metadata)

      expect(mockRepository.uploadModel).toHaveBeenCalledWith(file, metadata)
      expect(result).toEqual(newModel)
      expect(models.value[0]).toEqual(newModel)
      expect(models.value).toHaveLength(1)
    })

    it('should upload model without metadata', async () => {
      vi.mocked(mockRepository.uploadModel).mockResolvedValueOnce(newModel)
      const { uploadModel } = useModels(mockRepository)
      const file = new File(['content'], 'model.pth', { type: 'application/octet-stream' })

      await uploadModel(file)

      expect(mockRepository.uploadModel).toHaveBeenCalledWith(file, undefined)
    })

    it('should add uploaded model to existing models', async () => {
      const testModels = [...mockModels]
      const testMockRepo = {
        listModels: vi.fn().mockResolvedValue(testModels),
        fetchModel: vi.fn(),
        uploadModel: vi.fn().mockResolvedValue(newModel),
        downloadModel: vi.fn(),
        deleteModel: vi.fn(),
      }

      const { models, listModels, uploadModel } = useModels(testMockRepo)
      await listModels()
      expect(models.value).toHaveLength(2)

      const file = new File(['content'], 'model.pth', { type: 'application/octet-stream' })
      await uploadModel(file)

      expect(models.value).toHaveLength(3)
      expect(models.value[2]).toEqual(newModel)
    })

    it('should propagate errors from repository', async () => {
      const error = new Error('Upload failed')
      vi.mocked(mockRepository.uploadModel).mockRejectedValueOnce(error)
      const { uploadModel } = useModels(mockRepository)
      const file = new File(['content'], 'model.pth', { type: 'application/octet-stream' })

      await expect(uploadModel(file)).rejects.toThrow('Upload failed')
    })
  })

  describe('downloadModel', () => {
    it('should download model by ID', async () => {
      const mockBlob = new Blob(['model data'], { type: 'application/octet-stream' })
      vi.mocked(mockRepository.downloadModel).mockResolvedValueOnce(mockBlob)
      const { downloadModel } = useModels(mockRepository)

      const result = await downloadModel(1)

      expect(mockRepository.downloadModel).toHaveBeenCalledWith(1)
      expect(result).toBe(mockBlob)
    })

    it('should not modify models array when downloading', async () => {
      const mockBlob = new Blob(['model data'], { type: 'application/octet-stream' })
      vi.mocked(mockRepository.listModels).mockResolvedValueOnce(mockModels)
      vi.mocked(mockRepository.downloadModel).mockResolvedValueOnce(mockBlob)

      const { models, listModels, downloadModel } = useModels(mockRepository)
      await listModels()
      const initialLength = models.value.length

      await downloadModel(1)

      expect(models.value.length).toBe(initialLength)
    })

    it('should propagate errors from repository', async () => {
      const error = new Error('Download failed')
      vi.mocked(mockRepository.downloadModel).mockRejectedValueOnce(error)
      const { downloadModel } = useModels(mockRepository)

      await expect(downloadModel(1)).rejects.toThrow('Download failed')
    })
  })

  describe('deleteModel', () => {
    it('should delete model and remove from models array', async () => {
      const testModels = [...mockModels]
      const freshMockRepo = {
        listModels: vi.fn().mockResolvedValue(testModels),
        fetchModel: vi.fn(),
        uploadModel: vi.fn(),
        downloadModel: vi.fn(),
        deleteModel: vi.fn().mockResolvedValue(true),
      }

      const { models, listModels, deleteModel } = useModels(freshMockRepo)
      await listModels()
      expect(models.value).toHaveLength(2)

      const result = await deleteModel(1)

      expect(freshMockRepo.deleteModel).toHaveBeenCalledWith(1)
      expect(result).toBe(true)
      expect(models.value).toHaveLength(1)
      expect(models.value.find((m) => m.id === 1)).toBeUndefined()
    })

    it('should not remove model if deletion fails', async () => {
      const testModels = [...mockModels]
      const freshMockRepo = {
        listModels: vi.fn().mockResolvedValue(testModels),
        fetchModel: vi.fn(),
        uploadModel: vi.fn(),
        downloadModel: vi.fn(),
        deleteModel: vi.fn().mockResolvedValue(false),
      }

      const { models, listModels, deleteModel } = useModels(freshMockRepo)
      await listModels()
      expect(models.value).toHaveLength(2)

      const result = await deleteModel(1)

      expect(result).toBe(false)
      expect(models.value).toHaveLength(2)
      expect(models.value.find((m) => m.id === 1)).toBeDefined()
    })

    it('should handle deletion of non-existent model', async () => {
      const testModels = [...mockModels]
      const freshMockRepo = {
        listModels: vi.fn().mockResolvedValue(testModels),
        fetchModel: vi.fn(),
        uploadModel: vi.fn(),
        downloadModel: vi.fn(),
        deleteModel: vi.fn().mockResolvedValue(true),
      }

      const { models, listModels, deleteModel } = useModels(freshMockRepo)
      await listModels()

      const result = await deleteModel(999)

      expect(result).toBe(true)
      expect(models.value).toHaveLength(2)
    })

    it('should propagate errors from repository', async () => {
      const error = new Error('Delete failed')
      vi.mocked(mockRepository.deleteModel).mockRejectedValueOnce(error)
      const { deleteModel } = useModels(mockRepository)

      await expect(deleteModel(1)).rejects.toThrow('Delete failed')
    })
  })
})
