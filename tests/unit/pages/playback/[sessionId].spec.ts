import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'

import PlaybackSessionPage from '~/pages/playback/[sessionId].vue'

// Mock useRoute globally
const mockRoute = {
  params: {
    sessionId: 'session-456',
  },
}

vi.stubGlobal('useRoute', () => mockRoute)

// Mock PlaybackTimeline component
const PlaybackTimelineStub = {
  name: 'PlaybackTimeline',
  template: '<div class="playback-timeline-stub"></div>',
  props: ['modelValue', 'max'],
}

describe('Playback Session Page', () => {
  it('renders the page', () => {
    const wrapper = mount(PlaybackSessionPage, {
      global: {
        stubs: {
          PlaybackTimeline: PlaybackTimelineStub,
        },
      },
    })

    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('displays the session ID in title', () => {
    const wrapper = mount(PlaybackSessionPage, {
      global: {
        stubs: {
          PlaybackTimeline: PlaybackTimelineStub,
        },
      },
    })

    expect(wrapper.find('h2').text()).toBe('Playback session-456')
  })

  it('renders PlaybackTimeline component', () => {
    const wrapper = mount(PlaybackSessionPage, {
      global: {
        stubs: {
          PlaybackTimeline: PlaybackTimelineStub,
        },
      },
    })

    expect(wrapper.findComponent(PlaybackTimelineStub).exists()).toBe(true)
  })

  it('passes max prop to PlaybackTimeline', () => {
    const wrapper = mount(PlaybackSessionPage, {
      global: {
        stubs: {
          PlaybackTimeline: PlaybackTimelineStub,
        },
      },
    })

    const timeline = wrapper.findComponent(PlaybackTimelineStub)
    expect(timeline.props('max')).toBe(100)
  })
})
