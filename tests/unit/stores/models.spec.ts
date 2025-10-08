import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useModelsStore } from '~/stores/models'

// Mock ModelRepositoryImpl
vi.mock('~/libs/repositories/model/ModelRepositoryImpl', () => ({
  ModelRepositoryImpl: vi.fn().mockImplementation(() => ({
    listModels: vi.fn().mockResolvedValue([
      { id: 1, name: 'Model 1' },
      { id: 2, name: 'Model 2' }
    ])
  }))
}))

describe('Models Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty models array', () => {
    const store = useModelsStore()

    expect(store.models).toEqual([])
  })

  it('should fetch models successfully', async () => {
    const store = useModelsStore()

    await store.fetchModels()

    expect(store.models).toHaveLength(2)
    expect(store.models[0]).toEqual({ id: 1, name: 'Model 1' })
    expect(store.models[1]).toEqual({ id: 2, name: 'Model 2' })
  })

  it('should have fetchModels method', () => {
    const store = useModelsStore()

    expect(store.fetchModels).toBeDefined()
    expect(typeof store.fetchModels).toBe('function')
  })

  it('should update models array when fetchModels is called', async () => {
    const store = useModelsStore()
    const initialLength = store.models.length

    await store.fetchModels()

    expect(store.models.length).toBeGreaterThan(initialLength)
  })
})
