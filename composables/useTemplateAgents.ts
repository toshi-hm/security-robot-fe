/**
 * Template Agents Composable
 * テンプレートエージェントの実行・比較機能を提供するComposable
 */

import { ref, readonly } from 'vue'

import type { TemplateAgentRepository } from '~/libs/repositories/template-agent/TemplateAgentRepository'
import { TemplateAgentRepositoryImpl } from '~/libs/repositories/template-agent/TemplateAgentRepositoryImpl'
import type {
  TemplateAgentTypeDefinition,
  TemplateAgentExecuteRequest,
  TemplateAgentExecuteResponse,
  TemplateAgentCompareRequest,
  TemplateAgentCompareResponse,
} from '~/types/api'

/**
 * テンプレートエージェント管理用Composable
 * 依存性注入パターンを使用してテスト可能性を確保
 *
 * @param repository テンプレートエージェントリポジトリ（デフォルトは実装クラス）
 * @returns テンプレートエージェント管理用の状態と関数
 */
export const useTemplateAgents = (repository: TemplateAgentRepository = new TemplateAgentRepositoryImpl()) => {
  // 状態管理
  const agentTypes = ref<TemplateAgentTypeDefinition[]>([])
  const executeResult = ref<TemplateAgentExecuteResponse | null>(null)
  const compareResult = ref<TemplateAgentCompareResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * エージェントタイプ一覧を取得
   */
  const fetchAgentTypes = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      agentTypes.value = await repository.getAgentTypes()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'エージェントタイプの取得に失敗しました'
      console.error('Failed to fetch agent types:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 単一エージェントを実行
   */
  const executeAgent = async (request: TemplateAgentExecuteRequest): Promise<TemplateAgentExecuteResponse | null> => {
    isLoading.value = true
    error.value = null
    executeResult.value = null

    // デバッグログ: リクエスト内容を確認
    console.log('[useTemplateAgents] Execute request:', JSON.stringify(request, null, 2))

    try {
      const result = await repository.executeAgent(request)
      executeResult.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'エージェントの実行に失敗しました'
      console.error('Failed to execute agent:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 複数エージェントを比較実行
   */
  const compareAgents = async (request: TemplateAgentCompareRequest): Promise<TemplateAgentCompareResponse | null> => {
    isLoading.value = true
    error.value = null
    compareResult.value = null

    try {
      const result = await repository.compareAgents(request)
      compareResult.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'エージェントの比較に失敗しました'
      console.error('Failed to compare agents:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * エラーをクリア
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * 実行結果をクリア
   */
  const clearResults = (): void => {
    executeResult.value = null
    compareResult.value = null
    error.value = null
  }

  return {
    // 状態
    agentTypes: readonly(agentTypes),
    executeResult: readonly(executeResult),
    compareResult: readonly(compareResult),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // メソッド
    fetchAgentTypes,
    executeAgent,
    compareAgents,
    clearError,
    clearResults,
  }
}
