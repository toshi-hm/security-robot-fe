import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import TrainingMetrics from '~/components/training/TrainingMetrics.vue'

// Mock useChart composable
vi.mock('~/composables/useChart', () => ({
  useChart: vi.fn(() => ({
    canvas: { value: null },
    render: vi.fn(),
    destroy: vi.fn(),
    updateData: vi.fn(),
    replaceData: vi.fn(),
    clearData: vi.fn(),
    getChart: vi.fn(),
  })),
}))

const mountComponent = (props = {}) => {
  const defaultProps = {
    realtimeMetrics: {
      timestep: 0,
      episode: 0,
      reward: 0,
      loss: null,
    },
  }

  return mount(TrainingMetrics, {
    props: {
      ...defaultProps,
      ...props,
    },
    global: {
      stubs: {
        'el-card': {
          name: 'ElCard',
          template: '<div class="el-card"><slot name="header"></slot><slot /></div>',
        },
        'el-row': {
          name: 'ElRow',
          template: '<div class="el-row"><slot /></div>',
        },
        'el-col': {
          name: 'ElCol',
          template: '<div class="el-col"><slot /></div>',
        },
      },
    },
  })
}

describe('TrainingMetrics.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders summary card with current metrics', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.training-metrics__summary').exists()).toBe(true)
    expect(wrapper.text()).toContain('Timestep')
    expect(wrapper.text()).toContain('Episode')
    expect(wrapper.text()).toContain('Reward')
    expect(wrapper.text()).toContain('Loss')
  })

  it('displays realtime metrics values', () => {
    const mockMetrics = {
      timestep: 1000,
      episode: 10,
      reward: 123.456,
      loss: 0.0234,
    }
    const wrapper = mountComponent({ realtimeMetrics: mockMetrics })

    expect(wrapper.text()).toContain('1000')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('123.456')
    expect(wrapper.text()).toContain('0.0234')
  })

  it('handles null loss value', () => {
    const mockMetrics = {
      timestep: 500,
      episode: 5,
      reward: 50.5,
      loss: null,
    }
    const wrapper = mountComponent({ realtimeMetrics: mockMetrics })

    expect(wrapper.text()).toContain('N/A')
  })

  it('renders reward and loss chart containers', () => {
    const wrapper = mountComponent()
    const cards = wrapper.findAll('.el-card')

    // Summary card + Reward chart card + Loss chart card
    expect(cards.length).toBeGreaterThanOrEqual(3)
    expect(wrapper.text()).toContain('Reward Chart')
    expect(wrapper.text()).toContain('Loss Chart')
  })

  it('contains canvas elements for charts', () => {
    const wrapper = mountComponent()
    const canvases = wrapper.findAll('canvas')

    // Should have 2 canvas elements (reward and loss)
    expect(canvases.length).toBe(2)
  })
})
