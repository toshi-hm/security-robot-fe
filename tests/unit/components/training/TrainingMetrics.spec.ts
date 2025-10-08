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
    const mockMetrics: Partial<TrainingMetricsType>[] = [
      {
        id: 1,
        sessionId: 1,
        timestep: 100,
        episode: 1,
        reward: 100.5,
        loss: 0.25,
        coverageRatio: 0.8,
        explorationScore: 0.7,
      },
    ]
    const wrapper = mountComponent({ metrics: mockMetrics })
    const pre = wrapper.find('pre')
    expect(pre.exists()).toBe(true)
    expect(pre.text()).toContain('"episode": 1')
    expect(pre.text()).toContain('"reward": 100.5')
  })

  it('formats JSON with indentation', () => {
    const mockMetrics: Partial<TrainingMetricsType>[] = [
      {
        id: 1,
        sessionId: 1,
        timestep: 100,
        episode: 1,
        reward: 50,
        loss: 0.1,
        coverageRatio: 0.9,
        explorationScore: 0.8,
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
    const mockMetrics: Partial<TrainingMetricsType>[] = [
      {
        id: 1,
        sessionId: 1,
        timestep: 100,
        episode: 1,
        reward: 50,
        loss: 0.1,
        coverageRatio: 0.9,
        explorationScore: 0.8,
      },
      {
        id: 2,
        sessionId: 1,
        timestep: 200,
        episode: 2,
        reward: 60,
        loss: 0.08,
        coverageRatio: 0.95,
        explorationScore: 0.85,
      },
    ]
    const wrapper = mountComponent({ metrics: mockMetrics })
    const pre = wrapper.find('pre')
    expect(pre.text()).toContain('"episode": 1')
    expect(pre.text()).toContain('"episode": 2')
  })
})
