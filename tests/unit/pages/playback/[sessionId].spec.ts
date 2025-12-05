import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
  props: [
    'gridWidth',
    'gridHeight',
    'robotPosition',
    'robotOrientation',
    'coverageMap',
    'threatGrid',
    'trajectory',
    'trajectories', // Multi-agent trajectories
    'patrolRadius',
    'robots',
    'chargingStations',
    'obstacles',
  ],
}

const RobotPositionDisplayStub = {
  name: 'RobotPositionDisplay',
  template: '<div class="robot-pos-stub"></div>',
  props: ['position', 'orientation'],
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
    playbackStore.frames = [{ timestamp: '', environmentState: null, reward: 0 }]

    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.findComponent(PlaybackControlStub).exists()).toBe(true)
    expect(wrapper.findComponent(PlaybackSpeedStub).exists()).toBe(true)
    expect(wrapper.findComponent(PlaybackTimelineStub).exists()).toBe(true)
  })

  it('renders frame info cards with label and value together', () => {
    const playbackStore = usePlaybackStore()
    playbackStore.frames = [
      {
        timestamp: new Date('2025-01-01T00:00:00Z').toISOString(),
        reward: 1.234,
        environmentState: {
          robot_x: 0,
          robot_y: 0,
          robot_orientation: 0,
          threat_grid: [[0]],
          coverage_map: [[0]],
        },
      },
    ] as any

    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    const cards = wrapper.findAll('.playback-detail__frame-card')
    expect(cards.length).toBeGreaterThan(0)
    const firstCardText = cards[0]?.text()
    expect(firstCardText).toContain('フレーム')
    expect(firstCardText).toContain('1 / 1')
  })

  it('passes robot trajectories to EnvironmentVisualization', () => {
    const playbackStore = usePlaybackStore()
    playbackStore.frames = [
      {
        timestamp: '',
        reward: 0,
        environmentState: {
          robot_x: 1,
          robot_y: 1,
          robot_orientation: 0,
          threat_grid: [[0]],
          coverage_map: [[0]],
        },
      },
      {
        timestamp: '',
        reward: 0,
        environmentState: {
          robot_x: 2,
          robot_y: 1,
          robot_orientation: 1,
          threat_grid: [[0]],
          coverage_map: [[0]],
        },
      },
    ] as any
    playbackStore.currentFrameIndex = 1

    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    const env = wrapper.findComponent(EnvironmentVisualizationStub)
    expect(env.exists()).toBe(true)
    // Now using trajectories (array of arrays) instead of trajectory
    expect(env.props('trajectories')).toEqual([
      [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
    ])
  })

  it('handles multi-agent data correctly', () => {
    const playbackStore = usePlaybackStore()
    playbackStore.frames = [
      {
        timestamp: '',
        reward: 0,
        environmentState: {
          robot_x: 1,
          robot_y: 1,
          robot_orientation: 0,
          threat_grid: [[0]],
          coverage_map: [[0]],
          robots: [
            {
              id: 0,
              x: 1,
              y: 1,
              orientation: 0,
              battery_percentage: 100,
              is_charging: false,
            },
            {
              id: 1,
              x: 5,
              y: 5,
              orientation: 2,
              battery_percentage: 80,
              is_charging: true,
            },
          ],
        },
      },
    ] as any
    playbackStore.currentFrameIndex = 0

    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    // Verify EnvironmentVisualization props
    const env = wrapper.findComponent(EnvironmentVisualizationStub)
    expect(env.exists()).toBe(true)
    const robotsProp = env.props('robots')
    expect(robotsProp).toHaveLength(2)
    expect(robotsProp[0]).toEqual(
      expect.objectContaining({
        id: 0,
        x: 1,
        y: 1,
        orientation: 0,
        batteryPercentage: 100,
        isCharging: false,
      })
    )
    expect(robotsProp[1]).toEqual(
      expect.objectContaining({
        id: 1,
        x: 5,
        y: 5,
        orientation: 2,
        batteryPercentage: 80,
        isCharging: true,
      })
    )

    // Verify robot list display
    const robotItems = wrapper.findAll('.robot-item')
    expect(robotItems).toHaveLength(2)
    expect(robotItems[0]?.text()).toContain('Robot 0')
    expect(robotItems[1]?.text()).toContain('Robot 1')
  })
})
