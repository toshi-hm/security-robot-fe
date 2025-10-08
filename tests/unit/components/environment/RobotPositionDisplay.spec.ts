import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RobotPositionDisplay from '~/components/environment/RobotPositionDisplay.vue'

// Element Plus tag component stub
const ElTagStub = {
  name: 'ElTag',
  template: '<span class="el-tag"><slot /></span>',
  props: ['type']
}

describe('RobotPositionDisplay', () => {
  const defaultProps = {
    position: { row: 5, col: 3 }
  }

  it('renders the container element', () => {
    const wrapper = mount(RobotPositionDisplay, {
      props: defaultProps,
      global: {
        stubs: {
          ElTag: ElTagStub
        }
      }
    })

    expect(wrapper.find('.robot-position').exists()).toBe(true)
  })

  it('displays robot position coordinates', () => {
    const wrapper = mount(RobotPositionDisplay, {
      props: defaultProps,
      global: {
        stubs: {
          ElTag: ElTagStub
        }
      }
    })

    expect(wrapper.text()).toContain('Robot Position: (5, 3)')
  })

  it('uses ElTag with info type', () => {
    const wrapper = mount(RobotPositionDisplay, {
      props: defaultProps,
      global: {
        stubs: {
          ElTag: ElTagStub
        }
      }
    })

    const tag = wrapper.findComponent(ElTagStub)
    expect(tag.exists()).toBe(true)
    expect(tag.props('type')).toBe('info')
  })

  it('updates display when position prop changes', async () => {
    const wrapper = mount(RobotPositionDisplay, {
      props: defaultProps,
      global: {
        stubs: {
          ElTag: ElTagStub
        }
      }
    })

    await wrapper.setProps({ position: { row: 10, col: 7 } })

    expect(wrapper.text()).toContain('Robot Position: (10, 7)')
  })

  it('handles zero coordinates', () => {
    const wrapper = mount(RobotPositionDisplay, {
      props: { position: { row: 0, col: 0 } },
      global: {
        stubs: {
          ElTag: ElTagStub
        }
      }
    })

    expect(wrapper.text()).toContain('Robot Position: (0, 0)')
  })
})
