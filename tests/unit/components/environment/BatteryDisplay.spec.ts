import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import BatteryDisplay from '~/components/environment/BatteryDisplay.vue'

const globalStubs = {
  ElCard: {
    template: '<div class="el-card"><slot name="header"></slot><slot></slot></div>',
  },
  ElProgress: {
    template: '<div class="el-progress"></div>',
    props: ['percentage', 'color', 'status', 'strokeWidth'],
  },
  ElTag: {
    template: '<span class="el-tag"><slot></slot></span>',
    props: ['type', 'size'],
  },
}

describe('BatteryDisplay.vue', () => {
  it('renders battery display with default props', () => {
    const wrapper = mount(BatteryDisplay, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.battery-display').exists()).toBe(true)
    expect(wrapper.find('.battery-display__header').exists()).toBe(true)
    expect(wrapper.find('.battery-display__content').exists()).toBe(true)
  })

  it('displays battery percentage correctly', () => {
    const wrapper = mount(BatteryDisplay, {
      props: {
        batteryPercentage: 75.5,
      },
      global: { stubs: globalStubs },
    })

    expect(wrapper.text()).toContain('75.5%')
  })

  it('displays charging status when charging', () => {
    const wrapper = mount(BatteryDisplay, {
      props: {
        batteryPercentage: 50,
        isCharging: true,
      },
      global: { stubs: globalStubs },
    })

    expect(wrapper.text()).toContain('充電中')
    expect(wrapper.text()).toContain('⚡')
  })

  it('displays battery status based on percentage', () => {
    // Test high battery (80-100%)
    const wrapper1 = mount(BatteryDisplay, {
      props: { batteryPercentage: 90 },
      global: { stubs: globalStubs },
    })
    expect(wrapper1.text()).toContain('良好')

    // Test medium battery (50-80%)
    const wrapper2 = mount(BatteryDisplay, {
      props: { batteryPercentage: 60 },
      global: { stubs: globalStubs },
    })
    expect(wrapper2.text()).toContain('普通')

    // Test low battery (20-50%)
    const wrapper3 = mount(BatteryDisplay, {
      props: { batteryPercentage: 30 },
      global: { stubs: globalStubs },
    })
    expect(wrapper3.text()).toContain('低下')

    // Test warning battery (10-20%)
    const wrapper4 = mount(BatteryDisplay, {
      props: { batteryPercentage: 15 },
      global: { stubs: globalStubs },
    })
    expect(wrapper4.text()).toContain('警告')

    // Test danger battery (0-10%)
    const wrapper5 = mount(BatteryDisplay, {
      props: { batteryPercentage: 5 },
      global: { stubs: globalStubs },
    })
    expect(wrapper5.text()).toContain('危険')
  })

  it('displays distance to charging station', () => {
    const wrapper = mount(BatteryDisplay, {
      props: {
        batteryPercentage: 50,
        distanceToStation: 12,
      },
      global: { stubs: globalStubs },
    })

    expect(wrapper.text()).toContain('12 マス')
    expect(wrapper.text()).toContain('充電ステーションまで')
  })

  it('does not display distance section when distance is null', () => {
    const wrapper = mount(BatteryDisplay, {
      props: {
        batteryPercentage: 50,
        distanceToStation: null,
      },
      global: { stubs: globalStubs },
    })

    // When distance is null, the entire distance section should not be rendered
    expect(wrapper.text()).not.toContain('充電ステーションまで')
  })

  it('passes correct props to ElProgress', () => {
    const wrapper = mount(BatteryDisplay, {
      props: {
        batteryPercentage: 85,
      },
      global: { stubs: globalStubs },
    })

    const progress = wrapper.find('.el-progress')
    expect(progress.exists()).toBe(true)
  })

  it('uses correct color for battery level', () => {
    // High battery - success color
    const wrapper1 = mount(BatteryDisplay, {
      props: { batteryPercentage: 85 },
      global: { stubs: globalStubs },
    })
    expect(wrapper1.find('.el-progress').exists()).toBe(true)
    expect(wrapper1.text()).toContain('良好')

    // Medium battery - warning color
    const wrapper2 = mount(BatteryDisplay, {
      props: { batteryPercentage: 50 },
      global: { stubs: globalStubs },
    })
    expect(wrapper2.find('.el-progress').exists()).toBe(true)
    expect(wrapper2.text()).toContain('普通')

    // Low battery - danger color
    const wrapper3 = mount(BatteryDisplay, {
      props: { batteryPercentage: 15 },
      global: { stubs: globalStubs },
    })
    expect(wrapper3.find('.el-progress').exists()).toBe(true)
    expect(wrapper3.text()).toContain('警告')
  })

  it('displays correct battery icon based on state', () => {
    // Charging icon
    const wrapper1 = mount(BatteryDisplay, {
      props: {
        batteryPercentage: 50,
        isCharging: true,
      },
      global: { stubs: globalStubs },
    })
    expect(wrapper1.text()).toContain('⚡')

    // High battery icon
    const wrapper2 = mount(BatteryDisplay, {
      props: {
        batteryPercentage: 85,
        isCharging: false,
      },
      global: { stubs: globalStubs },
    })
    expect(wrapper2.text()).toContain('🔋')

    // Low battery icon
    const wrapper3 = mount(BatteryDisplay, {
      props: {
        batteryPercentage: 15,
        isCharging: false,
      },
      global: { stubs: globalStubs },
    })
    expect(wrapper3.text()).toContain('🪫')
  })

  it('handles null battery percentage', () => {
    const wrapper = mount(BatteryDisplay, {
      props: {
        batteryPercentage: null,
      },
      global: { stubs: globalStubs },
    })

    expect(wrapper.text()).toContain('---')
  })
})
