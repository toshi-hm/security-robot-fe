import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TrainingIndexPage from '~/pages/training/index.vue'

// Mock components
const TrainingControlStub = {
  name: 'TrainingControl',
  template: '<div class="training-control"><slot /></div>',
  emits: ['start']
}

const TrainingProgressStub = {
  name: 'TrainingProgress',
  template: '<div class="training-progress">Progress: {{ progress }}%</div>',
  props: ['progress']
}

describe('Training Index Page', () => {
  const globalStubs = {
    TrainingControl: TrainingControlStub,
    TrainingProgress: TrainingProgressStub
  }

  it('renders the page', () => {
    const wrapper = mount(TrainingIndexPage, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mount(TrainingIndexPage, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.find('h2').text()).toBe('Training Sessions')
  })

  it('renders TrainingControl component', () => {
    const wrapper = mount(TrainingIndexPage, {
      global: { stubs: globalStubs }
    })

    expect(wrapper.findComponent(TrainingControlStub).exists()).toBe(true)
  })

  it('renders TrainingProgress component with initial progress', () => {
    const wrapper = mount(TrainingIndexPage, {
      global: { stubs: globalStubs }
    })

    const progress = wrapper.findComponent(TrainingProgressStub)
    expect(progress.exists()).toBe(true)
    expect(progress.props('progress')).toBe(0)
  })

  it('has handleStart method', () => {
    const wrapper = mount(TrainingIndexPage, {
      global: { stubs: globalStubs }
    })
    const vm = wrapper.vm as any

    expect(vm.handleStart).toBeDefined()
    expect(typeof vm.handleStart).toBe('function')
  })
})
