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
} from '~/types/api'

import type { TemplateAgentRepository } from './TemplateAgentRepository'

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
      throw new Error('テンプレートエージェントのタイプ一覧の取得に失敗しました')
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
      throw new Error('テンプレートエージェントの実行に失敗しました')
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
      throw new Error('テンプレートエージェントの比較に失敗しました')
    }
  }
}
