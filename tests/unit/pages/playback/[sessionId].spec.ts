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
vi.stubGlobal(
  'useFetch',
  vi.fn().mockResolvedValue({
    data: { value: { data: { metrics: [] } } },
    error: { value: null },
  })
)
vi.stubGlobal(
  'useAsyncData',
  vi.fn().mockResolvedValue({
    data: {
      value: {
        id: 1,
        name: 'Test Session',
        algorithm: 'ppo',
        environment_type: 'standard',
        status: 'completed',
        total_timesteps: 1000,
        current_timestep: 1000,
        episodes_completed: 10,
        env_width: 8,
        env_height: 8,
        coverage_weight: 1.0,
        exploration_weight: 1.0,
        diversity_weight: 1.0,
        learning_rate: 0.001,
        batch_size: 64,
        num_workers: 1,
        model_path: null,
        log_path: null,
        config: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T01:00:00Z',
        started_at: '2025-01-01T00:00:00Z',
        completed_at: '2025-01-01T01:00:00Z',
      },
    },
    error: { value: null },
  })
)
vi.stubGlobal('$fetch', vi.fn())

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
    'trajectories',
    'patrolRadius',
    'robots',
    'chargingStations',
    'chargingStationPosition',
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

const TrainingMetricsStub = {
  name: 'TrainingMetrics',
  template: '<div class="training-metrics-stub"></div>',
  props: ['realtimeMetrics', 'metricsHistory'],
}

describe('Playback Session Page', () => {
  const globalStubs = {
    PlaybackTimeline: PlaybackTimelineStub,
    PlaybackControl: PlaybackControlStub,
    PlaybackSpeed: PlaybackSpeedStub,
    EnvironmentVisualization: EnvironmentVisualizationStub,
    RobotPositionDisplay: RobotPositionDisplayStub,
    TrainingMetrics: TrainingMetricsStub,
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
    ] as any // eslint-disable-line @typescript-eslint/no-explicit-any

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
    ] as any // eslint-disable-line @typescript-eslint/no-explicit-any
    playbackStore.currentFrameIndex = 1

    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    const env = wrapper.findComponent(EnvironmentVisualizationStub)
    expect(env.exists()).toBe(true)
    expect(env.props('trajectories')).toEqual({
      0: [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
    })
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
    ] as any // eslint-disable-line @typescript-eslint/no-explicit-any
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

  it('fetches and passes metrics history to TrainingMetrics', async () => {
    // Override useFetch mock for this specific test to return data
    // Unwrapped structure as per backend API
    const mockMetrics = [
      {
        id: 1,
        job_id: 1,
        timestep: 100,
        episode: 1,
        reward: 10,
        loss: 0.5,
        coverage_ratio: 0.1,
        exploration_score: 0.2,
        threat_level_avg: 0.1,
        additional_metrics: null,
        timestamp: '2025-01-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ]

    vi.stubGlobal(
      '$fetch',
      vi.fn().mockResolvedValue({
        metrics: mockMetrics,
        total: 1,
        page: 1,
        page_size: 5,
      })
    )

    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    // Wait for onMounted fetch
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 10))

    // console.log(wrapper.html()) // Debug output
    // Check state directly to verify data fetching logic
    expect((wrapper.vm as any).metricsHistory).toEqual(mockMetrics)
  })
})
