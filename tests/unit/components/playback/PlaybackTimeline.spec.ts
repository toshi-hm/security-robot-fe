import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import PlaybackTimeline from '~/components/playback/PlaybackTimeline.vue'

// Element Plus stubs
const ElSliderStub = {
  name: 'ElSlider',
  template: '<input type="range" class="el-slider" :value="modelValue" :max="max" />',
  props: ['modelValue', 'max'],
  emits: ['change'],
}

describe('PlaybackTimeline', () => {
  const globalStubs = {
    ElSlider: ElSliderStub,
  }

  it('renders slider element', () => {
    const wrapper = mount(PlaybackTimeline, {
      props: { modelValue: 0, max: 100 },
      global: { stubs: globalStubs },
    })

    expect(wrapper.findComponent(ElSliderStub).exists()).toBe(true)
  })

  it('passes modelValue to slider', () => {
    const wrapper = mount(PlaybackTimeline, {
      props: { modelValue: 50, max: 100 },
      global: { stubs: globalStubs },
    })

    const slider = wrapper.findComponent(ElSliderStub)
    expect(slider.props('modelValue')).toBe(50)
  })

  it('passes max value to slider', () => {
    const wrapper = mount(PlaybackTimeline, {
      props: { modelValue: 0, max: 200 },
      global: { stubs: globalStubs },
    })

    const slider = wrapper.findComponent(ElSliderStub)
    expect(slider.props('max')).toBe(200)
  })

  it('emits update:modelValue when slider changes', async () => {
    const wrapper = mount(PlaybackTimeline, {
      props: { modelValue: 0, max: 100 },
      global: { stubs: globalStubs },
    })

    const vm = wrapper.vm as any
    vm.onChange(75)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([75])
  })

  it('updates internal value when modelValue prop changes', async () => {
    const wrapper = mount(PlaybackTimeline, {
      props: { modelValue: 0, max: 100 },
      global: { stubs: globalStubs },
    })

    await wrapper.setProps({ modelValue: 60 })

    const slider = wrapper.findComponent(ElSliderStub)
    expect(slider.props('modelValue')).toBe(60)
  })
})
