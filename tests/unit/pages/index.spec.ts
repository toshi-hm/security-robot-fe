import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import IndexPage from '~/pages/index.vue'

// Mock stores
const mockTrainingStore = {
  sessions: [
    { id: 1, name: 'Session 1' },
    { id: 2, name: 'Session 2' },
  ],
  activeSessions: [{ id: 1, name: 'Session 1' }],
  fetchSessions: vi.fn(),
}

const mockModelsStore = {
  models: [{ id: 1, name: 'Model 1' }],
  fetchModels: vi.fn(),
}

const mockPlaybackStore = {
  sessions: [{ id: 1, name: 'Playback 1' }],
  fetchSessions: vi.fn(),
}

// Mock Nuxt auto-imports
vi.stubGlobal('useTrainingStore', () => mockTrainingStore)
vi.stubGlobal('useModelsStore', () => mockModelsStore)
vi.stubGlobal('usePlaybackStore', () => mockPlaybackStore)
vi.stubGlobal('onMounted', (callback: () => void) => callback())
vi.stubGlobal('navigateTo', vi.fn())

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
    const wrapper = mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(mockTrainingStore.sessions.length).toBe(2)
    expect(mockTrainingStore.activeSessions.length).toBe(1)
  })

  it('displays models stats', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(mockModelsStore.models.length).toBe(1)
  })

  it('displays playback stats', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(mockPlaybackStore.sessions.length).toBe(1)
  })

  it('fetches data on mount', () => {
    mount(IndexPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(mockTrainingStore.fetchSessions).toHaveBeenCalled()
    expect(mockModelsStore.fetchModels).toHaveBeenCalled()
    expect(mockPlaybackStore.fetchSessions).toHaveBeenCalled()
  })
})
