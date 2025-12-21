import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PlaybackSessionPage from '~/pages/playback/[sessionId].vue'
import { usePlaybackStore } from '~/stores/playback'

// Mocks
vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

const mockRoute = { params: { sessionId: 'session-123' } }
const mockRouter = { push: vi.fn() }
vi.stubGlobal('useRoute', () => mockRoute)
vi.stubGlobal('useRouter', () => mockRouter)
vi.stubGlobal(
  'useFetch',
  vi.fn().mockResolvedValue({ data: { value: { data: { metrics: [] } } }, error: { value: null } })
)

// Stubs
const globalStubs = {
  PlaybackTimeline: { template: '<div></div>', props: ['modelValue', 'max'] },
  PlaybackControl: { template: '<div></div>', props: ['isPlaying'] },
  PlaybackSpeed: { template: '<div></div>', props: ['modelValue'] },
  EnvironmentVisualization: {
    template: '<div class="env-viz" :data-obstacles="JSON.stringify(obstacles)"></div>',
    props: [
      'obstacles',
      'gridWidth',
      'gridHeight',
      'trajectories',
      'robots',
      'coverageMap',
      'threatGrid',
      'patrolRadius',
      'chargingStations',
      'robotPosition',
      'robotOrientation',
    ],
  },
  RobotPositionDisplay: { template: '<div></div>' },
  BatteryDisplay: { template: '<div></div>' },
  TrainingMetrics: { template: '<div></div>' },
  ElButton: { template: '<button><slot /></button>' },
  ElCard: { template: '<div><slot /></div>', props: ['loading'] },
  ElIcon: { template: '<i><slot /></i>' },
  ElAlert: { template: '<div></div>' },
  ElEmpty: { template: '<div></div>' },
  ArrowLeft: { template: '<span></span>' },
}

describe('Persistent Obstacles Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const playbackStore = usePlaybackStore()
    playbackStore.frames = []
    playbackStore.isLoading = false
    playbackStore.currentFrameIndex = 0
    vi.spyOn(playbackStore, 'fetchFrames').mockResolvedValue()
  })

  it('updates persistentObstacles when valid obstacles are received', async () => {
    const playbackStore = usePlaybackStore()
    const validObstacles = [
      [true, false],
      [false, true],
    ]

    playbackStore.frames = [
      {
        timestamp: '',
        reward: 0,
        environmentState: {
          robot_x: 0,
          robot_y: 0,
          robot_orientation: 0,
          threat_grid: [
            [0, 0],
            [0, 0],
          ],
          obstacles: validObstacles, // Valid obstacles
          robots: [],
        },
      },
    ] as any // eslint-disable-line @typescript-eslint/no-explicit-any
    playbackStore.currentFrameIndex = 0

    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })

    // Advance watchers
    await wrapper.vm.$nextTick()

    const envViz = wrapper.findComponent(globalStubs.EnvironmentVisualization)
    expect(envViz.exists()).toBe(true)
    const passedObstacles = envViz.props('obstacles')
    expect(passedObstacles).toEqual(validObstacles)
  })

  it('retains previous obstacles when new frame has null/empty obstacles', async () => {
    const playbackStore = usePlaybackStore()
    const validObstacles = [
      [true, false],
      [false, true],
    ]

    playbackStore.frames = [
      {
        timestamp: '1',
        reward: 0,
        environmentState: {
          robot_x: 0,
          robot_y: 0,
          robot_orientation: 0,
          threat_grid: [
            [0, 0],
            [0, 0],
          ],
          obstacles: validObstacles, // Frame 0: Valid
        },
      },
      {
        timestamp: '2',
        reward: 0,
        environmentState: {
          robot_x: 0,
          robot_y: 0,
          robot_orientation: 0,
          threat_grid: [
            [0, 0],
            [0, 0],
          ],
          obstacles: null, // Frame 1: Missing obstacles
        },
      },
    ] as any // eslint-disable-line @typescript-eslint/no-explicit-any

    // Start at frame 0
    playbackStore.currentFrameIndex = 0

    const wrapper = mount(PlaybackSessionPage, {
      global: { stubs: globalStubs },
    })
    await wrapper.vm.$nextTick()

    // Verify frame 0
    let envViz = wrapper.findComponent(globalStubs.EnvironmentVisualization)
    expect(envViz.props('obstacles')).toEqual(validObstacles)

    // Move to frame 1
    playbackStore.currentFrameIndex = 1
    await wrapper.vm.$nextTick()

    // Verify frame 1 still uses persistence
    envViz = wrapper.findComponent(globalStubs.EnvironmentVisualization)
    // Should still be validObstacles, not null
    expect(envViz.props('obstacles')).toEqual(validObstacles)
  })
})
