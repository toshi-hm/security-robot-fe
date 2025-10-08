import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import PlaybackIndexPage from '~/pages/playback/index.vue'

// Mock component
const PlaybackControlStub = {
  name: 'PlaybackControl',
  template: '<div class="playback-control"><slot /></div>',
  emits: ['play', 'pause', 'stop'],
}

describe('Playback Index Page', () => {
  it('renders the page', () => {
    const wrapper = mount(PlaybackIndexPage, {
      global: {
        stubs: {
          PlaybackControl: PlaybackControlStub,
        },
      },
    })

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mount(PlaybackIndexPage, {
      global: {
        stubs: {
          PlaybackControl: PlaybackControlStub,
        },
      },
    })

    expect(wrapper.find('h2').text()).toBe('Playback Sessions')
  })

  it('renders PlaybackControl component', () => {
    const wrapper = mount(PlaybackIndexPage, {
      global: {
        stubs: {
          PlaybackControl: PlaybackControlStub,
        },
      },
    })

    expect(wrapper.findComponent(PlaybackControlStub).exists()).toBe(true)
  })

  it('has noop handler for events', () => {
    const wrapper = mount(PlaybackIndexPage, {
      global: {
        stubs: {
          PlaybackControl: PlaybackControlStub,
        },
      },
    })
    const vm = wrapper.vm as any

    expect(vm.noop).toBeDefined()
    expect(typeof vm.noop).toBe('function')
  })
})
