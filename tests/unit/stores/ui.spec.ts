import { setActivePinia, createPinia } from 'pinia'

import { describe, it, expect, beforeEach } from 'vitest'

import { useUiStore } from '~/stores/ui'

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with collapsed state as false', () => {
    const store = useUiStore()

    expect(store.isSidebarCollapsed).toBe(false)
  })

  it('should toggle sidebar from false to true', () => {
    const store = useUiStore()

    store.toggleSidebar()

    expect(store.isSidebarCollapsed).toBe(true)
  })

  it('should toggle sidebar from true to false', () => {
    const store = useUiStore()
    store.isSidebarCollapsed = true

    store.toggleSidebar()

    expect(store.isSidebarCollapsed).toBe(false)
  })

  it('should toggle sidebar multiple times', () => {
    const store = useUiStore()

    store.toggleSidebar()
    expect(store.isSidebarCollapsed).toBe(true)

    store.toggleSidebar()
    expect(store.isSidebarCollapsed).toBe(false)

    store.toggleSidebar()
    expect(store.isSidebarCollapsed).toBe(true)
  })

  it('should be reactive', () => {
    const store = useUiStore()
    const initialValue = store.isSidebarCollapsed

    store.toggleSidebar()

    expect(store.isSidebarCollapsed).not.toBe(initialValue)
  })
})
