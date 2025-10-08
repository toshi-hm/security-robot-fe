import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import ThreatLevelMap from '~/components/environment/ThreatLevelMap.vue'

// Element Plus card component stub
const ElCardStub = {
  name: 'ElCard',
  template: '<div class="el-card"><slot /></div>',
}

describe('ThreatLevelMap', () => {
  const defaultProps = {
    threatMap: [
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
      [0.7, 0.8, 0.9],
    ],
  }

  it('renders the card wrapper', () => {
    const wrapper = mount(ThreatLevelMap, {
      props: defaultProps,
      global: {
        stubs: {
          ElCard: ElCardStub,
        },
      },
    })

    expect(wrapper.findComponent(ElCardStub).exists()).toBe(true)
  })

  it('displays threat map data', () => {
    const wrapper = mount(ThreatLevelMap, {
      props: defaultProps,
      global: {
        stubs: {
          ElCard: ElCardStub,
        },
      },
    })

    const preElement = wrapper.find('pre')
    expect(preElement.exists()).toBe(true)
  })

  it('renders threat map as formatted text', () => {
    const wrapper = mount(ThreatLevelMap, {
      props: defaultProps,
      global: {
        stubs: {
          ElCard: ElCardStub,
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('0.1')
    expect(text).toContain('0.5')
    expect(text).toContain('0.9')
  })

  it('updates display when threatMap prop changes', async () => {
    const wrapper = mount(ThreatLevelMap, {
      props: defaultProps,
      global: {
        stubs: {
          ElCard: ElCardStub,
        },
      },
    })

    await wrapper.setProps({
      threatMap: [
        [1.0, 0.0],
        [0.5, 0.5],
      ],
    })

    const text = wrapper.text()
    expect(text).toContain('1')
    expect(text).toContain('0.5')
  })

  it('handles empty threat map', () => {
    const wrapper = mount(ThreatLevelMap, {
      props: { threatMap: [] },
      global: {
        stubs: {
          ElCard: ElCardStub,
        },
      },
    })

    expect(wrapper.find('pre').exists()).toBe(true)
  })
})
