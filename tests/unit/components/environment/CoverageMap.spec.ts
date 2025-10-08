import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CoverageMap from '~/components/environment/CoverageMap.vue'

// Element Plus card component stub
const ElCardStub = {
  name: 'ElCard',
  template: '<div class="el-card"><slot /></div>'
}

describe('CoverageMap', () => {
  it('renders the card wrapper', () => {
    const wrapper = mount(CoverageMap, {
      global: {
        stubs: {
          ElCard: ElCardStub
        }
      }
    })

    expect(wrapper.findComponent(ElCardStub).exists()).toBe(true)
  })

  it('renders the coverage-map container', () => {
    const wrapper = mount(CoverageMap, {
      global: {
        stubs: {
          ElCard: ElCardStub
        }
      }
    })

    expect(wrapper.find('.coverage-map').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mount(CoverageMap, {
      global: {
        stubs: {
          ElCard: ElCardStub
        }
      },
      slots: {
        default: '<div class="test-content">Coverage Data</div>'
      }
    })

    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Coverage Data')
  })

  it('has correct styling classes', () => {
    const wrapper = mount(CoverageMap, {
      global: {
        stubs: {
          ElCard: ElCardStub
        }
      }
    })

    const container = wrapper.find('.coverage-map')
    expect(container.exists()).toBe(true)
  })

  it('passes slot content to ElCard', () => {
    const wrapper = mount(CoverageMap, {
      global: {
        stubs: {
          ElCard: ElCardStub
        }
      },
      slots: {
        default: '<p class="custom-map">Map Visualization</p>'
      }
    })

    const card = wrapper.findComponent(ElCardStub)
    expect(card.find('.custom-map').exists()).toBe(true)
  })
})
