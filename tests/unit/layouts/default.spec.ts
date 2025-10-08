import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import DefaultLayout from '~/layouts/default.vue'

// Mock components
const AppHeaderStub = {
  name: 'AppHeader',
  template: '<header class="app-header">Header</header>',
}

const AppSidebarStub = {
  name: 'AppSidebar',
  template: '<aside class="app-sidebar"><slot /></aside>',
}

const ElMenuStub = {
  name: 'ElMenu',
  template: '<ul class="el-menu"><slot /></ul>',
  props: ['router'],
}

const ElMenuItemStub = {
  name: 'ElMenuItem',
  template: '<li class="el-menu-item"><slot /></li>',
  props: ['index'],
}

describe('Default Layout', () => {
  const globalStubs = {
    AppHeader: AppHeaderStub,
    AppSidebar: AppSidebarStub,
    ElMenu: ElMenuStub,
    ElMenuItem: ElMenuItemStub,
  }

  it('renders the layout', () => {
    const wrapper = mount(DefaultLayout, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.layout-default').exists()).toBe(true)
  })

  it('renders AppSidebar component', () => {
    const wrapper = mount(DefaultLayout, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.findComponent(AppSidebarStub).exists()).toBe(true)
  })

  it('renders AppHeader component', () => {
    const wrapper = mount(DefaultLayout, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.findComponent(AppHeaderStub).exists()).toBe(true)
  })

  it('renders navigation menu', () => {
    const wrapper = mount(DefaultLayout, {
      global: { stubs: globalStubs },
    })

    const menu = wrapper.findComponent(ElMenuStub)
    expect(menu.exists()).toBe(true)
  })

  it('renders all menu items', () => {
    const wrapper = mount(DefaultLayout, {
      global: { stubs: globalStubs },
    })

    const menuItems = wrapper.findAllComponents(ElMenuItemStub)
    expect(menuItems.length).toBe(5)
  })

  it('has correct menu item routes', () => {
    const wrapper = mount(DefaultLayout, {
      global: { stubs: globalStubs },
    })

    const menuItems = wrapper.findAllComponents(ElMenuItemStub)
    expect(menuItems[0].props('index')).toBe('/')
    expect(menuItems[1].props('index')).toBe('/training')
    expect(menuItems[2].props('index')).toBe('/playback')
    expect(menuItems[3].props('index')).toBe('/models')
    expect(menuItems[4].props('index')).toBe('/settings')
  })

  it('has correct layout structure with grid', () => {
    const wrapper = mount(DefaultLayout, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.find('.sidebar').exists()).toBe(true)
    expect(wrapper.find('.content').exists()).toBe(true)
  })

  it('renders slot content in main area', () => {
    const wrapper = mount(DefaultLayout, {
      global: { stubs: globalStubs },
      slots: {
        default: '<div class="test-slot">Test Content</div>',
      },
    })

    expect(wrapper.find('.test-slot').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Content')
  })
})
