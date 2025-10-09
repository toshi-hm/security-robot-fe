import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import PlaybackIndexPage from '~/pages/playback/index.vue'
import { usePlaybackStore } from '~/stores/playback'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock router - stub globally
const mockRouter = {
  push: vi.fn(),
}
vi.stubGlobal('useRouter', () => mockRouter)

// Mock Element Plus components
const ElButtonStub = {
  name: 'ElButton',
  template: '<button><slot /></button>',
  props: ['type', 'size'],
}

const ElCardStub = {
  name: 'ElCard',
  template: '<div class="el-card"><slot /></div>',
  props: ['loading'],
}

const ElTableStub = {
  name: 'ElTable',
  template: '<table><slot /></table>',
  props: ['data', 'stripe'],
}

const ElTableColumnStub = {
  name: 'ElTableColumn',
  template: '<td><slot /></td>',
  props: ['prop', 'label', 'width', 'fixed'],
}

const ElEmptyStub = {
  name: 'ElEmpty',
  template: '<div class="el-empty">{{ description }}</div>',
  props: ['description'],
}

const ElAlertStub = {
  name: 'ElAlert',
  template: '<div class="el-alert">{{ title }}</div>',
  props: ['title', 'type', 'closable'],
}

describe('Playback Index Page', () => {
  const globalStubs = {
    ElButton: ElButtonStub,
    ElCard: ElCardStub,
    ElTable: ElTableStub,
    ElTableColumn: ElTableColumnStub,
    ElEmpty: ElEmptyStub,
    ElAlert: ElAlertStub,
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    const playbackStore = usePlaybackStore()
    playbackStore.sessions = []
    playbackStore.isLoading = false
    playbackStore.error = null

    // Mock fetchSessions to prevent $fetch calls
    vi.spyOn(playbackStore, 'fetchSessions').mockResolvedValue()
  })

  it('renders the page', () => {
    const wrapper = mount(PlaybackIndexPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.playback').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mount(PlaybackIndexPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.playback__title').text()).toBe('再生セッション')
  })

  it('displays description text', () => {
    const wrapper = mount(PlaybackIndexPage, {
      global: { stubs: globalStubs },
    })
    const description = wrapper.find('.playback__description')

    expect(description.exists()).toBe(true)
    expect(description.text()).toContain('完了した訓練セッション')
  })

  it('has correct BEM structure', () => {
    const wrapper = mount(PlaybackIndexPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.playback').exists()).toBe(true)
    expect(wrapper.find('.playback__title').exists()).toBe(true)
    expect(wrapper.find('.playback__description').exists()).toBe(true)
  })
})
