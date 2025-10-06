export interface RuntimeEnvironmentConfig {
  apiBaseUrl: string
  wsUrl: string
}

export const useEnvironmentConfig = (): RuntimeEnvironmentConfig => {
  const runtimeConfig = useRuntimeConfig()

  return {
    apiBaseUrl: runtimeConfig.public.apiBaseUrl,
    wsUrl: runtimeConfig.public.wsUrl,
  }
}
