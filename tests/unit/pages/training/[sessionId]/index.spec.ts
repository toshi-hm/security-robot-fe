import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TrainingSessionPage from '~/pages/training/[sessionId]/index.vue'

// Mock useRoute globally
const mockRoute = {
  params: {
    sessionId: 'training-789'
  }
}

vi.stubGlobal('useRoute', () => mockRoute)

// Mock TrainingMetrics component
const TrainingMetricsStub = {
  name: 'TrainingMetrics',
  template: '<div class="training-metrics-stub"></div>',
  props: ['metrics']
}

describe('Training Session Page', () => {
  it('renders the page', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: {
          TrainingMetrics: TrainingMetricsStub
        }
      }
    })

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the session ID in title', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: {
          TrainingMetrics: TrainingMetricsStub
        }
      }
    })

    expect(wrapper.find('h2').text()).toBe('Training Session training-789')
  })

  it('renders TrainingMetrics component', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: {
          TrainingMetrics: TrainingMetricsStub
        }
      }
    })

    expect(wrapper.findComponent(TrainingMetricsStub).exists()).toBe(true)
  })

  it('passes null metrics to TrainingMetrics', () => {
    const wrapper = mount(TrainingSessionPage, {
      global: {
        stubs: {
          TrainingMetrics: TrainingMetricsStub
        }
      }
    })

    const metricsComponent = wrapper.findComponent(TrainingMetricsStub)
    expect(metricsComponent.props('metrics')).toBeNull()
  })
})
