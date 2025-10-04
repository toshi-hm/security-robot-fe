import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const isSidebarCollapsed = ref(false)

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  return {
    isSidebarCollapsed,
    toggleSidebar,
  }
})
