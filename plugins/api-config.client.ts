/**
 * APIエンドポイント初期化プラグイン
 *
 * アプリケーション起動時に1回だけuseRuntimeConfig()を呼び出し、
 * エンドポイントをキャッシュに保存します。
 *
 * これにより、以下の問題を解決します：
 * 1. パフォーマンス: useRuntimeConfig()の繰り返し呼び出しを防ぐ
 * 2. コンテキスト: Nuxtコンポーザブルを適切なタイミングで呼び出す
 * 3. リポジトリ層: Vue/Nuxtライフサイクル外での安全な使用
 */
import { setApiEndpointsCache, setWsEndpointsCache, useApiEndpoints, useWsEndpoints } from '~/configs/api'

export default defineNuxtPlugin(() => {
  // アプリケーション起動時に1回だけエンドポイントを生成
  const apiEndpoints = useApiEndpoints()
  const wsEndpoints = useWsEndpoints()

  // グローバルキャッシュに保存
  setApiEndpointsCache(apiEndpoints)
  setWsEndpointsCache(wsEndpoints)

  // デバッグ用: 初期化完了をログ出力
  if (import.meta.env.DEV) {
    console.log('[api-config] API endpoints initialized:', {
      baseUrl: apiEndpoints.health.replace('/api/v1/health/', ''),
      wsUrl: wsEndpoints.training.replace('/api/v1/ws/training', ''),
    })
  }
})
