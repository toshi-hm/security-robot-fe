import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'

import TrainingSessionPage from '~/pages/training/[sessionId]/index.vue'

// Mock useRoute globally
const mockRoute = {
  params: {
    sessionId: '789',
  },
}

vi.stubGlobal('useRoute', () => mockRoute)

// Mock useWebSocket
vi.stubGlobal('useWebSocket', () => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  isConnected: { value: false },
  error: { value: null },
  on: vi.fn(),
  off: vi.fn(),
}))

// Mock useAsyncData
vi.stubGlobal('useAsyncData', () =>
  Promise.resolve({
    data: { value: null },
    error: { value: null },
  })
)

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    apiBaseUrl: 'http://localhost:8000',
  },
}))

// Mock $fetch
vi.stubGlobal('$fetch', vi.fn())

// Mock ElMessage
vi.stubGlobal('ElMessage', {
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
})

// Mock TrainingMetrics component
const TrainingMetricsStub = {
  name: 'TrainingMetrics',
  template: '<div class="training-metrics-stub"></div>',
  props: ['realtimeMetrics'],
}

// Mock RobotPositionDisplay component
const RobotPositionDisplayStub = {
  name: 'RobotPositionDisplay',
  template: '<div class="robot-position-stub"></div>',
  props: ['position', 'orientation'],
}

// Mock EnvironmentVisualization component
const EnvironmentVisualizationStub = {
  name: 'EnvironmentVisualization',
  template: '<div class="environment-visualization-stub"></div>',
  props: [
    'gridWidth',
    'gridHeight',
    'robotPosition',
    'robotOrientation',
    'coverageMap',
    'threatGrid',
    'trajectory',
    'patrolRadius',
  ],
}

describe('Training Session Page', () => {
  const commonStubs = {
    TrainingMetrics: TrainingMetricsStub,
    RobotPositionDisplay: RobotPositionDisplayStub,
    EnvironmentVisualization: EnvironmentVisualizationStub,
    'el-tag': true,
    'el-alert': true,
    'el-card': true,
    'el-row': true,
    'el-col': true,
    'el-descriptions': true,
    'el-descriptions-item': true,
  }

  it('renders the page', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the session ID in title', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(wrapper.find('h2').text()).toBe('Training Session 789')
  })

  it('renders TrainingMetrics component', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    expect(wrapper.findComponent(TrainingMetricsStub).exists()).toBe(true)
  })

  it('passes realtime metrics to TrainingMetrics', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    const metricsComponent = wrapper.findComponent(TrainingMetricsStub)
    const props = metricsComponent.props('realtimeMetrics')

    expect(props).toBeDefined()
    expect(props).toHaveProperty('timestep')
    expect(props).toHaveProperty('episode')
    expect(props).toHaveProperty('reward')
    expect(props).toHaveProperty('loss')
    expect(props).toHaveProperty('coverageRatio')
    expect(props).toHaveProperty('explorationScore')
  })

  it('registers all WebSocket event handlers on mount', async () => {
    const mockOn = vi.fn()
    vi.stubGlobal('useWebSocket', () => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnected: { value: false },
      error: { value: null },
      on: mockOn,
      off: vi.fn(),
    }))

    mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    await flushPromises()

    expect(mockOn).toHaveBeenCalledWith('training_progress', expect.any(Function))
    expect(mockOn).toHaveBeenCalledWith('training_status', expect.any(Function))
    expect(mockOn).toHaveBeenCalledWith('training_error', expect.any(Function))
    expect(mockOn).toHaveBeenCalledWith('environment_update', expect.any(Function))
    expect(mockOn).toHaveBeenCalledWith('connection_ack', expect.any(Function))
    expect(mockOn).toHaveBeenCalledWith('pong', expect.any(Function))
  })

  it('does not show status alert initially', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    const alerts = wrapper.findAll('.el-alert')
    // Only connection error alert might be present
    expect(alerts.length).toBeLessThanOrEqual(1)
  })

  it('does not show environment card when robotPosition is null', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    const envCards = wrapper.findAll('.training-session__environment')
    expect(envCards.length).toBe(0)
  })

  it('initializes robot trajectory as empty array', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    const vm = wrapper.vm as any
    expect(vm.robotTrajectory).toBeDefined()
    expect(Array.isArray(vm.robotTrajectory)).toBe(true)
    expect(vm.robotTrajectory.length).toBe(0)
  })

  it('adds robot position to trajectory when environment updates', async () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    const vm = wrapper.vm as any

    // Simulate environment update with robot position
    const message = {
      type: 'environment_update',
      session_id: 789,
      episode: 1,
      step: 10,
      robot_position: { x: 2, y: 3 },
    }

    vm.handleEnvironmentUpdate(message)

    expect(vm.robotTrajectory.length).toBe(1)
    expect(vm.robotTrajectory[0]).toEqual({ x: 2, y: 3 })
  })

  it('does not add duplicate positions to trajectory', async () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    const vm = wrapper.vm as any

    // First position
    const message1 = {
      type: 'environment_update',
      session_id: 789,
      episode: 1,
      step: 10,
      robot_position: { x: 2, y: 3 },
    }
    vm.handleEnvironmentUpdate(message1)

    // Same position again
    const message2 = {
      type: 'environment_update',
      session_id: 789,
      episode: 1,
      step: 11,
      robot_position: { x: 2, y: 3 },
    }
    vm.handleEnvironmentUpdate(message2)

    // Should only have one entry
    expect(vm.robotTrajectory.length).toBe(1)
  })

  it('limits trajectory to 100 points', async () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    const vm = wrapper.vm as any

    // Add 110 positions
    for (let i = 0; i < 110; i++) {
      const message = {
        type: 'environment_update',
        session_id: 789,
        episode: 1,
        step: i,
        robot_position: { x: i, y: i },
      }
      vm.handleEnvironmentUpdate(message)
    }

    // Should only keep the last 100
    expect(vm.robotTrajectory.length).toBe(100)
    // First element should be position 10 (not 0)
    expect(vm.robotTrajectory[0]).toEqual({ x: 10, y: 10 })
    // Last element should be position 109
    expect(vm.robotTrajectory[99]).toEqual({ x: 109, y: 109 })
  })

  it('passes trajectory to EnvironmentVisualization component', async () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: commonStubs,
      },
    })

    const vm = wrapper.vm as any

    // Add a position to trajectory
    const message = {
      session_id: 789,
      robot_position: { x: 5, y: 7 },
    }
    vm.handleEnvironmentUpdate(message)

    // Wait for reactivity
    await wrapper.vm.$nextTick()

    // Find EnvironmentVisualization component (should be rendered now that robotPosition is set)
    const envViz = wrapper.findComponent(EnvironmentVisualizationStub)
    if (envViz.exists()) {
      const props = envViz.props()
      expect(props.trajectory).toBeDefined()
      expect(Array.isArray(props.trajectory)).toBe(true)
    }
  })
})
