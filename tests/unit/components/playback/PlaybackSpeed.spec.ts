import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import PlaybackSpeed from '~/components/playback/PlaybackSpeed.vue'

// Element Plus stubs
const ElSelectStub = {
  name: 'ElSelect',
  template: '<select class="el-select"><slot /></select>',
  props: ['modelValue', 'placeholder'],
}

const ElOptionStub = {
  name: 'ElOption',
  template: '<option class="el-option">{{ label }}</option>',
  props: ['label', 'value'],
}

describe('PlaybackSpeed', () => {
  const globalStubs = {
    ElSelect: ElSelectStub,
    ElOption: ElOptionStub,
  }

  it('renders select element', () => {
    const wrapper = mount(PlaybackSpeed, {
      props: { modelValue: 1 },
      global: { stubs: globalStubs },
    })

    expect(wrapper.findComponent(ElSelectStub).exists()).toBe(true)
  })

  it('uses default speed options when not provided', () => {
    const wrapper = mount(PlaybackSpeed, {
      props: { modelValue: 1 },
      global: { stubs: globalStubs },
    })

    const options = wrapper.findAllComponents(ElOptionStub)
    expect(options).toHaveLength(4)
    expect(options[0]!.props('label')).toBe('0.5x')
    expect(options[1]!.props('label')).toBe('1x')
    expect(options[2]!.props('label')).toBe('2x')
    expect(options[3]!.props('label')).toBe('4x')
  })

  it('uses custom speed options when provided', () => {
    const wrapper = mount(PlaybackSpeed, {
      props: { modelValue: 1, options: [1, 3, 5] },
      global: { stubs: globalStubs },
    })

    const options = wrapper.findAllComponents(ElOptionStub)
    expect(options).toHaveLength(3)
    expect(options[0]!.props('label')).toBe('1x')
    expect(options[1]!.props('label')).toBe('3x')
    expect(options[2]!.props('label')).toBe('5x')
  })

  it('passes modelValue to select', () => {
    const wrapper = mount(PlaybackSpeed, {
      props: { modelValue: 2 },
      global: { stubs: globalStubs },
    })

    const select = wrapper.findComponent(ElSelectStub)
    expect(select.props('modelValue')).toBe(2)
  })

  it('has placeholder text', () => {
    const wrapper = mount(PlaybackSpeed, {
      props: { modelValue: 1 },
      global: { stubs: globalStubs },
    })

    const select = wrapper.findComponent(ElSelectStub)
    expect(select.props('placeholder')).toBe('Speed')
  })

  it('emits update:modelValue when handleUpdate is called', async () => {
    const wrapper = mount(PlaybackSpeed, {
      props: { modelValue: 1 },
      global: { stubs: globalStubs },
    })

    const select = wrapper.findComponent(ElSelectStub)
    await select.vm.$emit('update:modelValue', 2)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([2])
  })

  it('emits correct value when speed changes', async () => {
    const wrapper = mount(PlaybackSpeed, {
      props: { modelValue: 1 },
      global: { stubs: globalStubs },
    })

    const select = wrapper.findComponent(ElSelectStub)
    await select.vm.$emit('update:modelValue', 0.5)

    expect(wrapper.emitted('update:modelValue')![0]).toEqual([0.5])
  })
})
