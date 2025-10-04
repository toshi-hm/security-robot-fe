export const getEnvironmentConfig = () => ({
  apiBaseUrl: useRuntimeConfig().public.apiBaseUrl,
  wsUrl: useRuntimeConfig().public.wsUrl,
})
