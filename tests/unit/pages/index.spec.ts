import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import IndexPage from '~/pages/index.vue'
import { useModelsStore } from '~/stores/models'
import { usePlaybackStore } from '~/stores/playback'
import { useTrainingStore } from '~/stores/training'

// Mock Nuxt auto-imports
vi.stubGlobal('navigateTo', vi.fn())
vi.stubGlobal('onMounted', (callback: () => void) => callback())

// Element Plus stubs
const commonStubs = {
  'el-row': true,
  'el-col': true,
  'el-card': true,
  'el-icon': true,
  'el-tag': true,
  'el-button': true,
  TrendCharts: true,
  Files: true,
  VideoPlay: true,
  Plus: true,
  Upload: true,
  Setting: true,
}

describe('Index Page', () => {
  beforeEach(() => {
    // Setup Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Setup stores with mock data
    const trainingStore = useTrainingStore()
    const modelsStore = useModelsStore()
    const playbackStore = usePlaybackStore()

    // Mock store data
    trainingStore.sessions = [
      { id: 1, name: 'Session 1', isRunning: true, isCompleted: false } as any,
      { id: 2, name: 'Session 2', isRunning: false, isCompleted: false } as any,
    ]

    modelsStore.models = [{ id: 1, name: 'Model 1' } as any]

    playbackStore.sessions = [{ id: 1, name: 'Playback 1' } as any]

    // Mock store methods
    vi.spyOn(trainingStore, 'fetchSessions').mockResolvedValue()
    vi.spyOn(modelsStore, 'fetchModels').mockResolvedValue()
    vi.spyOn(playbackStore, 'fetchSessions').mockResolvedValue()

    vi.clearAllMocks()
  })

  it('renders the page', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(wrapper.find('.dashboard').exists()).toBe(true)
  })

  it('displays the dashboard title', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(wrapper.find('.dashboard__title').text()).toBe('セキュリティロボット強化学習システム')
  })

  it('displays navigation instructions', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })
    const text = wrapper.text()

    expect(text).toContain('学習セッション、再生、モデル管理を一元管理')
  })

  it('has correct structure', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(wrapper.find('.dashboard__header').exists()).toBe(true)
    expect(wrapper.find('.dashboard__stats').exists()).toBe(true)
    expect(wrapper.find('.dashboard__quick-actions').exists()).toBe(true)
  })

  it('displays training sessions stats', () => {
    const trainingStore = useTrainingStore()

    mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(trainingStore.sessions.length).toBe(2)
    expect(trainingStore.activeSessions.length).toBe(1)
  })

  it('displays models stats', () => {
    const modelsStore = useModelsStore()

    mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(modelsStore.models.length).toBe(1)
  })

  it('displays playback stats', () => {
    const playbackStore = usePlaybackStore()

    mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(playbackStore.sessions.length).toBe(1)
  })

  it('fetches data on mount', () => {
    const trainingStore = useTrainingStore()
    const modelsStore = useModelsStore()
    const playbackStore = usePlaybackStore()

    mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(trainingStore.fetchSessions).toHaveBeenCalled()
    expect(modelsStore.fetchModels).toHaveBeenCalled()
    expect(playbackStore.fetchSessions).toHaveBeenCalled()
  })
})
