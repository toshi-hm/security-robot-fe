/**
 * Template Agent Repository Implementation
 * テンプレートエージェントリポジトリの実装
 */

import { API_ENDPOINTS } from '~/configs/api'
import type {
  TemplateAgentTypeDefinition,
  TemplateAgentExecuteRequest,
  TemplateAgentExecuteResponse,
  TemplateAgentCompareRequest,
  TemplateAgentCompareResponse,
  ApiError,
} from '~/types/api'

import type { TemplateAgentRepository } from './TemplateAgentRepository'

/**
 * APIエラーから詳細なエラーメッセージを生成
 * @param error - キャッチされたエラー
 * @param context - エラーが発生した操作のコンテキスト
 * @returns 詳細なエラーメッセージ
 */
function createDetailedErrorMessage(error: unknown, context: string): string {
  // ApiError型のチェック
  const apiError = error as ApiError
  const statusCode = apiError?.status || apiError?.response?.status

  // HTTPステータスコードに基づいたメッセージ
  if (statusCode) {
    switch (statusCode) {
      case 400:
        return `${context}: 不正なリクエストです (ステータスコード: ${statusCode})`
      case 401:
        return `${context}: 認証に失敗しました (ステータスコード: ${statusCode})`
      case 403:
        return `${context}: アクセスが拒否されました (ステータスコード: ${statusCode})`
      case 404:
        return `${context}: リソースが見つかりませんでした (ステータスコード: ${statusCode})`
      case 500:
        return `${context}: サーバーエラーが発生しました (ステータスコード: ${statusCode})`
      case 503:
        return `${context}: サービスが利用できません (ステータスコード: ${statusCode})`
      default:
        return `${context}: エラーが発生しました (ステータスコード: ${statusCode})`
    }
  }

  // エラーメッセージが含まれている場合
  if (apiError?.message) {
    return `${context}: ${apiError.message}`
  }

  // その他のエラー
  if (error instanceof Error) {
    return `${context}: ${error.message}`
  }

  // 不明なエラー
  return `${context}: 不明なエラーが発生しました`
}

export class TemplateAgentRepositoryImpl implements TemplateAgentRepository {
  /**
   * 利用可能なテンプレートエージェントのタイプ一覧を取得
   */
  async getAgentTypes(): Promise<TemplateAgentTypeDefinition[]> {
    try {
      const response = await $fetch<TemplateAgentTypeDefinition[]>(API_ENDPOINTS.templateAgents.types, {
        method: 'GET',
      })
      return response
    } catch (error) {
      console.error('Failed to fetch template agent types:', error)
      const message = createDetailedErrorMessage(error, 'テンプレートエージェントのタイプ一覧の取得に失敗しました')
      const err = new Error(message)
      ;(err as any).cause = error
      throw err
    }
  }

  /**
   * 単一のテンプレートエージェントを実行
   */
  async executeAgent(request: TemplateAgentExecuteRequest): Promise<TemplateAgentExecuteResponse> {
    try {
      const response = await $fetch<TemplateAgentExecuteResponse>(API_ENDPOINTS.templateAgents.execute, {
        method: 'POST',
        body: request,
      })
      return response
    } catch (error) {
      console.error('Failed to execute template agent:', error)
      const message = createDetailedErrorMessage(error, 'テンプレートエージェントの実行に失敗しました')
      const err = new Error(message)
      ;(err as any).cause = error
      throw err
    }
  }

  /**
   * 複数のテンプレートエージェントを比較実行
   */
  async compareAgents(request: TemplateAgentCompareRequest): Promise<TemplateAgentCompareResponse> {
    try {
      const response = await $fetch<TemplateAgentCompareResponse>(API_ENDPOINTS.templateAgents.compare, {
        method: 'POST',
        body: request,
      })
      return response
    } catch (error) {
      console.error('Failed to compare template agents:', error)
      const message = createDetailedErrorMessage(error, 'テンプレートエージェントの比較に失敗しました')
      const err = new Error(message)
      ;(err as any).cause = error
      throw err
    }
  }
}
