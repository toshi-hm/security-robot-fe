import { defineNuxtConfig } from 'nuxt/config'

const config: ReturnType<typeof defineNuxtConfig> = defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/main.scss'],
  modules: ['@nuxt/ui', '@element-plus/nuxt', '@pinia/nuxt', '@vueuse/nuxt', '@vee-validate/nuxt', '@nuxt/eslint'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:8000',
      simulationMode: process.env.NUXT_PUBLIC_SIMULATION_MODE === 'true',
    },
  },
  typescript: {
    strict: true,
    typeCheck: false, // Disable during build (tests are checked separately)
    shim: false,
  },
  vite: {
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['dayjs'],
    },
    ssr: {
      noExternal: ['element-plus'],
    },
  },
  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss',
    themes: ['dark'],
  },
  compatibilityDate: '2025-01-01',
})

export default config
