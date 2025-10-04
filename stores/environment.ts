import { defineStore } from 'pinia'
import { useEnvironment } from '~/composables/useEnvironment'

export const useEnvironmentStore = defineStore('environment', () => {
  const service = useEnvironment()

  return {
    ...service,
  }
})
