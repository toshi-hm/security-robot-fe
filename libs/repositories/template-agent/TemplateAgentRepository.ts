/**
 * Template Agent Repository Interface
 * テンプレートエージェントの実行・比較を行うためのリポジトリインターフェース
 */

import type {
  TemplateAgentTypeDefinition,
  TemplateAgentExecuteRequest,
  TemplateAgentExecuteResponse,
  TemplateAgentCompareRequest,
  TemplateAgentCompareResponse,
} from '~/types/api'

export interface TemplateAgentRepository {
  /**
   * 利用可能なテンプレートエージェントのタイプ一覧を取得
   * @returns エージェントタイプ定義の配列
   */
  getAgentTypes(): Promise<TemplateAgentTypeDefinition[]>

  /**
   * 単一のテンプレートエージェントを実行
   * @param request 実行リクエスト
   * @returns 実行結果（メトリクスを含む）
   */
  executeAgent(request: TemplateAgentExecuteRequest): Promise<TemplateAgentExecuteResponse>

  /**
   * 複数のテンプレートエージェントを比較実行
   * @param request 比較実行リクエスト
   * @returns 比較結果（ランキングを含む）
   */
  compareAgents(request: TemplateAgentCompareRequest): Promise<TemplateAgentCompareResponse>
}
