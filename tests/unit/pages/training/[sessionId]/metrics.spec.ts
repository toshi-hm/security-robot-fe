import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TrainingMetricsPage from '~/pages/training/[sessionId]/metrics.vue'

// Mock useRoute globally
const mockRoute = {
  params: {
    sessionId: 'metrics-999'
  }
}

vi.stubGlobal('useRoute', () => mockRoute)

// Mock RewardChart component
const RewardChartStub = {
  name: 'RewardChart',
  template: '<div class="reward-chart-stub"></div>'
}

describe('Training Metrics Page', () => {
  it('renders the page', () => {
    const wrapper = mount(TrainingMetricsPage, {
      global: {
        stubs: {
          RewardChart: RewardChartStub
        }
      }
    })

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the session ID in title', () => {
    const wrapper = mount(TrainingMetricsPage, {
      global: {
        stubs: {
          RewardChart: RewardChartStub
        }
      }
    })

    expect(wrapper.find('h2').text()).toBe('Metrics for Session metrics-999')
  })

  it('renders RewardChart component', () => {
    const wrapper = mount(TrainingMetricsPage, {
      global: {
        stubs: {
          RewardChart: RewardChartStub
        }
      }
    })

    expect(wrapper.findComponent(RewardChartStub).exists()).toBe(true)
  })

  it('has correct page structure', () => {
    const wrapper = mount(TrainingMetricsPage, {
      global: {
        stubs: {
          RewardChart: RewardChartStub
        }
      }
    })

    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.find('h2').exists()).toBe(true)
  })
})
