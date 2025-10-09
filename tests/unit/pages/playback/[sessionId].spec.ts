import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import PlaybackSessionPage from '~/pages/playback/[sessionId].vue'
import { usePlaybackStore } from '~/stores/playback'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock router and route - stub globally
const mockRoute = {
  params: {
    sessionId: 'session-456',
  },
}
const mockRouter = {
  push: vi.fn(),
}
vi.stubGlobal('useRoute', () => mockRoute)
vi.stubGlobal('useRouter', () => mockRouter)

// Mock components
const PlaybackTimelineStub = {
  name: 'PlaybackTimeline',
  template: '<div class="playback-timeline-stub"></div>',
  props: ['modelValue', 'max'],
}

const PlaybackControlStub = {
  name: 'PlaybackControl',
  template: '<div class="playback-control-stub"></div>',
  props: ['isPlaying'],
  emits: ['play', 'pause', 'stop'],
}

const PlaybackSpeedStub = {
  name: 'PlaybackSpeed',
  template: '<div class="playback-speed-stub"></div>',
  props: ['speed'],
}

const EnvironmentVisualizationStub = {
  name: 'EnvironmentVisualization',
  template: '<div class="environment-viz-stub"></div>',
  props: ['environmentState'],
}

const RobotPositionDisplayStub = {
  name: 'RobotPositionDisplay',
  template: '<div class="robot-pos-stub"></div>',
  props: ['position'],
}

const ElButtonStub = {
  name: 'ElButton',
  template: '<button><slot /></button>',
  props: ['type'],
}

const ElCardStub = {
  name: 'ElCard',
  template: '<div class="el-card"><slot /></div>',
  props: ['loading'],
}

const ElIconStub = {
  name: 'ElIcon',
  template: '<i><slot /></i>',
}

const ElAlertStub = {
  name: 'ElAlert',
  template: '<div class="el-alert">{{ title }}</div>',
  props: ['title', 'type', 'closable'],
}

const ElDescriptionsStub = {
  name: 'ElDescriptions',
  template: '<div class="el-descriptions"><slot /></div>',
  props: ['column', 'border'],
}

const ElDescriptionsItemStub = {
  name: 'ElDescriptionsItem',
  template: '<div class="el-descriptions-item"><slot /></div>',
  props: ['label'],
}

const ElEmptyStub = {
  name: 'ElEmpty',
  template: '<div class="el-empty">{{ description }}</div>',
  props: ['description'],
}

describe('Playback Session Page', () => {
  const globalStubs = {
    PlaybackTimeline: PlaybackTimelineStub,
    PlaybackControl: PlaybackControlStub,
    PlaybackSpeed: PlaybackSpeedStub,
    EnvironmentVisualization: EnvironmentVisualizationStub,
    RobotPositionDisplay: RobotPositionDisplayStub,
    ElButton: ElButtonStub,
    ElCard: ElCardStub,
    ElIcon: ElIconStub,
    ElAlert: ElAlertStub,
    ElDescriptions: ElDescriptionsStub,
    ElDescriptionsItem: ElDescriptionsItemStub,
    ElEmpty: ElEmptyStub,
    ArrowLeft: { template: '<span>←</span>' },
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    const playbackStore = usePlaybackStore()
    playbackStore.frames = []
    playbackStore.isLoading = false
    playbackStore.error = null
    playbackStore.currentFrameIndex = 0
    playbackStore.isPlaying = false

    // Mock fetchFrames to prevent $fetch calls
    vi.spyOn(playbackStore, 'fetchFrames').mockResolvedValue()
  })

  it('renders the page', () => {
    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.playback-detail').exists()).toBe(true)
  })

  it('displays the session ID in title', () => {
    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.playback-detail__title').text()).toContain('session-456')
  })

  it('has correct BEM structure', () => {
    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.playback-detail').exists()).toBe(true)
    expect(wrapper.find('.playback-detail__title').exists()).toBe(true)
  })

  it('renders playback control components', () => {
    const playbackStore = usePlaybackStore()
    playbackStore.frames = [{ frameNumber: 0, timestep: 0, state: null, reward: 0, timestamp: '' }]

    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.findComponent(PlaybackControlStub).exists()).toBe(true)
    expect(wrapper.findComponent(PlaybackSpeedStub).exists()).toBe(true)
    expect(wrapper.findComponent(PlaybackTimelineStub).exists()).toBe(true)
  })
})
