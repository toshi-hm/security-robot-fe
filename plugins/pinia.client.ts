import { createPinia, setActivePinia, type Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  const existingPinia = (nuxtApp as unknown as { $pinia?: Pinia }).$pinia

  if (existingPinia) {
    setActivePinia(existingPinia)
    return {
      provide: {
        pinia: existingPinia,
      },
    }
  }

  const pinia = createPinia()
  nuxtApp.vueApp.use(pinia)
  setActivePinia(pinia)

  return {
    provide: {
      pinia,
    },
  }
})
