import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TrainingMetrics from '~/components/training/TrainingMetrics.vue'
import type { TrainingMetrics as TrainingMetricsType } from '~/libs/domains/training/TrainingMetrics'

const mountComponent = (props = {}) => {
  return mount(TrainingMetrics, {
    props: {
      metrics: [],
      ...props,
    },
    global: {
      stubs: {
        'el-card': {
          name: 'ElCard',
          template: '<div class="el-card"><slot /></div>',
        },
      },
    },
  })
}

describe('TrainingMetrics.vue', () => {
  it('renders el-card container', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.el-card').exists()).toBe(true)
  })

  it('displays metrics as JSON string', () => {
    const mockMetrics: TrainingMetricsType[] = [
      {
        episode: 1,
        totalReward: 100.5,
        averageReward: 10.05,
        loss: 0.25,
        coverage: 0.8,
        collisions: 2,
      },
    ]
    const wrapper = mountComponent({ metrics: mockMetrics })
    const pre = wrapper.find('pre')
    expect(pre.exists()).toBe(true)
    expect(pre.text()).toContain('"episode": 1')
    expect(pre.text()).toContain('"totalReward": 100.5')
  })

  it('formats JSON with indentation', () => {
    const mockMetrics: TrainingMetricsType[] = [
      {
        episode: 1,
        totalReward: 50,
        averageReward: 5,
        loss: 0.1,
        coverage: 0.9,
        collisions: 0,
      },
    ]
    const wrapper = mountComponent({ metrics: mockMetrics })
    const pre = wrapper.find('pre')
    const text = pre.text()
    // Check for newlines (formatted JSON)
    expect(text.split('\n').length).toBeGreaterThan(1)
  })

  it('handles empty metrics array', () => {
    const wrapper = mountComponent({ metrics: [] })
    const pre = wrapper.find('pre')
    expect(pre.text()).toBe('[]')
  })

  it('displays multiple metrics', () => {
    const mockMetrics: TrainingMetricsType[] = [
      {
        episode: 1,
        totalReward: 50,
        averageReward: 5,
        loss: 0.1,
        coverage: 0.9,
        collisions: 0,
      },
      {
        episode: 2,
        totalReward: 60,
        averageReward: 6,
        loss: 0.08,
        coverage: 0.95,
        collisions: 1,
      },
    ]
    const wrapper = mountComponent({ metrics: mockMetrics })
    const pre = wrapper.find('pre')
    expect(pre.text()).toContain('"episode": 1')
    expect(pre.text()).toContain('"episode": 2')
  })
})
