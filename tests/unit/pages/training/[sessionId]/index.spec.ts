import { mount } from '@vue/test-utils'
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

// Mock TrainingMetrics component
const TrainingMetricsStub = {
  name: 'TrainingMetrics',
  template: '<div class="training-metrics-stub"></div>',
  props: ['realtimeMetrics'],
}

describe('Training Session Page', () => {
  it('renders the page', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: {
          TrainingMetrics: TrainingMetricsStub,
        },
      },
    })

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the session ID in title', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: {
          TrainingMetrics: TrainingMetricsStub,
        },
      },
    })

    expect(wrapper.find('h2').text()).toBe('Training Session 789')
  })

  it('renders TrainingMetrics component', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: {
          TrainingMetrics: TrainingMetricsStub,
        },
      },
    })

    expect(wrapper.findComponent(TrainingMetricsStub).exists()).toBe(true)
  })

  it('passes realtime metrics to TrainingMetrics', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: {
          TrainingMetrics: TrainingMetricsStub,
        },
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

  it('registers all WebSocket event handlers on mount', () => {
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
        stubs: {
          TrainingMetrics: TrainingMetricsStub,
        },
      },
    })

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
        stubs: {
          TrainingMetrics: TrainingMetricsStub,
        },
      },
    })

    const alerts = wrapper.findAll('.el-alert')
    // Only connection error alert might be present
    expect(alerts.length).toBeLessThanOrEqual(1)
  })

  it('does not show environment card when robotPosition is null', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: {
          TrainingMetrics: TrainingMetricsStub,
        },
      },
    })

    const envCards = wrapper.findAll('.training-session__environment')
    expect(envCards.length).toBe(0)
  })
})
