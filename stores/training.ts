import { defineStore } from 'pinia'

import { useTraining } from '~/composables/useTraining'

export const useTrainingStore = defineStore('training', () => {
  const service = useTraining()

  return {
    ...service,
  }
})
