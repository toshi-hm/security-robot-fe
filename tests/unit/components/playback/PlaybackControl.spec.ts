import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import PlaybackControl from '~/components/playback/PlaybackControl.vue'

// Element Plus stubs
const ElSpaceStub = {
  name: 'ElSpace',
  template: '<div class="el-space"><slot /></div>',
}

const ElButtonStub = {
  name: 'ElButton',
  template: '<button class="el-button" :disabled="disabled"><slot /></button>',
  props: ['type', 'disabled'],
}

describe('PlaybackControl', () => {
  const globalStubs = {
    ElSpace: ElSpaceStub,
    ElButton: ElButtonStub,
  }

  it('renders all control buttons', () => {
    const wrapper = mount(PlaybackControl, {
      props: { isPlaying: false },
      global: { stubs: globalStubs },
    })

    const buttons = wrapper.findAllComponents(ElButtonStub)
    expect(buttons).toHaveLength(3)
  })

  it('renders play button with primary type', () => {
    const wrapper = mount(PlaybackControl, {
      props: { isPlaying: false },
      global: { stubs: globalStubs },
    })

    const buttons = wrapper.findAllComponents(ElButtonStub)
    const playButton = buttons[0]!
    expect(playButton.props('type')).toBe('primary')
    expect(playButton.text()).toBe('Play')
  })

  it('renders pause button', () => {
    const wrapper = mount(PlaybackControl, {
      props: { isPlaying: false },
      global: { stubs: globalStubs },
    })

    const buttons = wrapper.findAllComponents(ElButtonStub)
    const pauseButton = buttons[1]!
    expect(pauseButton.text()).toBe('Pause')
  })

  it('renders stop button with danger type', () => {
    const wrapper = mount(PlaybackControl, {
      props: { isPlaying: false },
      global: { stubs: globalStubs },
    })

    const buttons = wrapper.findAllComponents(ElButtonStub)
    const stopButton = buttons[2]!
    expect(stopButton.props('type')).toBe('danger')
    expect(stopButton.text()).toBe('Stop')
  })

  it('emits play event when play button is clicked', async () => {
    const wrapper = mount(PlaybackControl, {
      props: { isPlaying: false },
      global: { stubs: globalStubs },
    })

    const buttons = wrapper.findAllComponents(ElButtonStub)
    await buttons[0]!.trigger('click')

    expect(wrapper.emitted('play')).toBeTruthy()
    expect(wrapper.emitted('play')).toHaveLength(1)
  })

  it('emits pause event when pause button is clicked', async () => {
    const wrapper = mount(PlaybackControl, {
      props: { isPlaying: true },
      global: { stubs: globalStubs },
    })

    const buttons = wrapper.findAllComponents(ElButtonStub)
    await buttons[1]!.trigger('click')

    expect(wrapper.emitted('pause')).toBeTruthy()
    expect(wrapper.emitted('pause')).toHaveLength(1)
  })

  it('emits stop event when stop button is clicked', async () => {
    const wrapper = mount(PlaybackControl, {
      props: { isPlaying: false },
      global: { stubs: globalStubs },
    })

    const buttons = wrapper.findAllComponents(ElButtonStub)
    await buttons[2]!.trigger('click')

    expect(wrapper.emitted('stop')).toBeTruthy()
    expect(wrapper.emitted('stop')).toHaveLength(1)
  })

  it('disables play button and enables pause button when isPlaying is true', () => {
    const wrapper = mount(PlaybackControl, {
      props: { isPlaying: true },
      global: { stubs: globalStubs },
    })

    const buttons = wrapper.findAllComponents(ElButtonStub)
    const playButton = buttons[0]!
    const pauseButton = buttons[1]!

    expect(playButton.props('disabled')).toBe(true)
    expect(pauseButton.props('disabled')).toBe(false)
  })

  it('enables play button and disables pause button when isPlaying is false', () => {
    const wrapper = mount(PlaybackControl, {
      props: { isPlaying: false },
      global: { stubs: globalStubs },
    })

    const buttons = wrapper.findAllComponents(ElButtonStub)
    const playButton = buttons[0]!
    const pauseButton = buttons[1]!

    expect(playButton.props('disabled')).toBe(false)
    expect(pauseButton.props('disabled')).toBe(true)
  })

  it('stop button is always enabled', () => {
    const wrapperWhenPlaying = mount(PlaybackControl, {
      props: { isPlaying: true },
      global: { stubs: globalStubs },
    })
    const stopButtonWhenPlaying = wrapperWhenPlaying.findAllComponents(ElButtonStub)[2]!
    expect(stopButtonWhenPlaying.props('disabled')).toBe(undefined)

    const wrapperWhenPaused = mount(PlaybackControl, {
      props: { isPlaying: false },
      global: { stubs: globalStubs },
    })
    const stopButtonWhenPaused = wrapperWhenPaused.findAllComponents(ElButtonStub)[2]!
    expect(stopButtonWhenPaused.props('disabled')).toBe(undefined)
  })
})
