import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import AppHeader from '~/components/common/AppHeader.vue'

const mountComponent = (props = {}) => {
  return mount(AppHeader, {
    props,
  })
}

describe('AppHeader', () => {
  it('renders the app title', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.app-header__title').exists()).toBe(true)
  })

  it('displays the correct title text', () => {
    const wrapper = mountComponent()
    const title = wrapper.find('.app-header__title')
    expect(title.text()).toBe('Security Robot RL Console')
  })

  it('has correct header class', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.app-header').exists()).toBe(true)
  })

  it('uses semantic HTML header element', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('header').exists()).toBe(true)
  })

  it('uses h1 for the title', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('h1').exists()).toBe(true)
  })
})
