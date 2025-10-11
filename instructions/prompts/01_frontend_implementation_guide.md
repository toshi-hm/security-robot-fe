# セキュリティロボット強化学習システム - フロントエンド実装ガイド

## 🚨 セッション開始前の必須手順

**AI実装者は、フロントエンド実装作業を開始する前に必ず以下の手順を実行すること:**

### 1. 進捗ファイルの確認（必須）
```bash
# 現在のフロントエンド実装状況を確認
cat report/PROGRESS.md
```
- ✅ 何が実装済みか（Phase 1-9のどこまで完了しているか）
- 🔧 何がTODOとして残っているか
- 🚧 技術的課題・検討事項
- 🎯 次のアクションアイテム（優先順位付き）

**重要**: PROGRESS.mdは編集可能です。実装状況に応じて自由に更新してください。

### 2. 開発日記の確認（必須）
```bash
# 過去セッション総括の確認 (Session 001-015)
cat report/summary/DIARY01.md

# 最新セッション記録の確認 (Session 016以降)
cat report/DIARY02.md
```
- 📋 前回のセッションで実施した作業
- 🐛 遭遇した問題（TypeScriptエラー、ビルドエラー等）と解決方法
- 🎓 技術的学び
- 🎯 次のセッションへの引き継ぎ事項

**重要**: DIARY02.mdは最新エントリが上部にあります（逆時系列）。過去のエントリは編集せず、新しいセッションを追加してください。

### 3. 設計書の参照
フロントエンド実装では以下の設計書を参照:
- `../03_frontend_design_standalone.md` - フロントエンド詳細設計（**最重要**）
- `../04_test_design_standalone.md` - テスト設計（フロントエンド部分）
- `../01_system_architecture_design_standalone.md` - システム全体設計（参考）

### 3. 設計書の参照（必須）
フロントエンド実装では以下の設計書を参照:
- `../03_frontend_design_standalone.md` - フロントエンド詳細設計（**最重要**）
- `../04_test_design_standalone.md` - テスト設計（フロントエンド部分）
- `../01_system_architecture_design_standalone.md` - システム全体設計（参考）

---

### 4. セッション終了時の記録（必須）
作業完了後は**必ず**以下を実行:

#### 4.1 進捗ファイルの更新
```bash
# report/PROGRESS.md を編集
# - ✅ 実装済み機能セクションを更新
# - 🔧 実装中の機能セクションを更新
# - 📋 TODOセクションを更新
# - 🚨 技術的課題・検討事項を更新
# - 🎯 次のアクションアイテムを更新
# - 📊 テストカバレッジ状況を記録
# - 最終更新日を更新
```

**重要**: PROGRESS.mdは自由に編集可能です。状況に応じて構造を変更しても構いません。

#### 4.2 開発日記に新しいセッションを追加
```bash
# report/DIARY02.md を編集
# 以下のテンプレートを使用して、ファイルの「目次の直後」に新しいエントリを追加
```

**DIARYエントリのテンプレート**:
```markdown
## YYYY-MM-DD - Session XXX: セッションタイトル

### セッション情報
- **開始時刻**: HH:MM
- **終了時刻**: HH:MM
- **所要時間**: X分
- **対象Phase**: Phase X
- **担当者**: AI実装アシスタント

---

### 📋 実施したタスク
- [x] 実装したコンポーネント（TrainingControl.vue等）
- [x] 作成したComposables（useTraining等）
- [x] 実装したテスト（単体テスト・E2Eテスト）
- [x] 修正したバグ

---

### 🎓 技術的学び

#### 1. 学んだこと
- TDDの効果
- モックの難しさ
- 等

---

### 🐛 遭遇した問題と解決方法

#### 問題1: タイトル
- **現象**: 何が起きたか
- **原因**: なぜ起きたか
- **解決策**: どう解決したか
- **所要時間**: X分

---

### 📁 作成・変更したファイル

#### 作成したファイル
1. ファイルパス (説明)

#### 変更したファイル
1. ファイルパス
   - 変更内容

---

### ✅ 完了した課題
1. ✅ タスク1
2. ✅ タスク2

---

### 🚧 残っている課題

#### 最優先 (P0)
1. 課題1

#### 高優先 (P1)
2. 課題2

---

### 🎯 次のセッションで実施すべきこと

#### 必須タスク
1. タスク1

#### 推奨タスク
2. タスク2

---

### 📊 パフォーマンス・品質メトリクス
- pnpm test実行時間: Xms
- カバレッジ: X%
- TypeScriptコンパイル: 成功/失敗
- Lintチェック: 成功/失敗

---

### 💡 メモ・備考
- その他気づいたこと

---

**セッション終了時刻**: YYYY-MM-DD HH:MM
```

**重要な注意事項**:
- 新しいエントリは**必ず目次の直後**に追加（最新が上）
- 目次も更新すること
- 過去のエントリは**絶対に編集しない**
- 日付は `YYYY-MM-DD` フォーマット

---

## 🎯 このドキュメントの目的

このガイドは、AI開発アシスタント(Claude Code, GitHub Copilot等)を活用して、セキュリティロボット強化学習システムの**フロントエンドのみ**を段階的に実装するための詳細な指示書です。

**重要:** このドキュメントと設計書を組み合わせることで、リポジトリ知識なしでもフロントエンドの完全な実装が可能です。

## 📚 前提知識

### 🔴 実装開始前の必須作業

**IMPORTANT**: 実装作業を開始する前に、必ず以下のファイルを読んでください:

1. **`../../report/PROGRESS.md`** - 現在の実装状況
   - 何が完了し、何がTODOかを把握
   - 既知の問題や課題を確認
   - 次のアクションアイテムを確認

2. **`../../report/summary/DIARY01.md`** - 開発セッション総括 (Session 001-015)
   - Phase 1-16の完了内容の総括
   - 確立された技術パターンの確認
   - 主要な課題と解決策の確認

3. **`../../report/DIARY02.md`** - 最新セッション履歴 (Session 016以降)
   - 過去のセッションで何を実施したかを確認
   - 学んだことや気づきを把握
   - 前回のセッションからの引き継ぎ事項を確認

4. **`../../CLAUDE.md`** - プロジェクト概要と進捗管理ワークフロー
   - プロジェクト全体の方針を理解
   - 進捗管理ファイルの運用方法を確認

### 必要な設計書
実装前に以下を熟読してください:
1. `../01_system_architecture_design_standalone.md` - システム全体設計（フロントエンド部分のみ）
2. `../03_frontend_design_standalone.md` - フロントエンド詳細設計（**最重要**）
3. `../04_test_design_standalone.md` - テスト設計（フロントエンド部分のみ）

### 技術要件
- **Node.js 20+**: 最新のLTS版
- **pnpm 9.12.0**: パッケージマネージャー（必須）
- **Vue.js 3.5+**: Composition API対応
- **Nuxt v4**: 最新の互換性モード
- **TypeScript 5.7+**: 厳格な型チェック

## 🏗️ 実装フェーズ

### Phase 1: プロジェクト初期化 (Day 1)

#### 1.1 プロジェクト作成

**既存リポジトリの確認**
```bash
# 現在のディレクトリ構造確認
ls -la

# package.jsonが存在する場合、既にプロジェクトが初期化されている
# 存在しない場合は以下を実行
```

**新規プロジェクトの場合（package.jsonが存在しない場合のみ）**
```bash
# Nuxt v4プロジェクト初期化
pnpm dlx nuxi@latest init . --packageManager pnpm

# または既存のsecurity-robot-rl-frontendディレクトリがない場合
pnpm dlx nuxi@latest init security-robot-rl-frontend --packageManager pnpm
cd security-robot-rl-frontend
```

#### 1.2 依存関係インストール

**設計書 03_frontend_design_standalone.md（1.2節）の技術スタック通りにインストール**

```bash
# パッケージマネージャー確認
which pnpm
# なければ: corepack enable && corepack prepare pnpm@9.12.0 --activate

# コアフレームワーク（Nuxt 4に含まれる）
# Vue.js 3.5, TypeScript 5.7は自動インストール

# UIフレームワーク
pnpm add @element-plus/nuxt@latest
pnpm add @nuxt/ui@latest
pnpm add sass@^1.83

# 状態管理・通信
pnpm add @pinia/nuxt@latest
pnpm add @vueuse/nuxt@latest
pnpm add axios@^1.7
pnpm add socket.io-client@^4.8

# 可視化
pnpm add chart.js@^4.5 vue-chartjs@^5.3
pnpm add d3@^7.9

# 開発・テストツール
pnpm add -D @playwright/test@^1.49
pnpm add -D vitest@^3.0 @vitest/coverage-v8@latest
pnpm add -D @vue/test-utils@latest happy-dom@latest
pnpm add -D eslint@^9.37 @nuxt/eslint@latest
pnpm add -D stylelint@^16.25 stylelint-config-standard-scss@latest
pnpm add -D vue-tsc@^2.1
pnpm add -D @types/d3@^7.4
```

#### 1.3 Nuxt設定ファイル作成

**設計書 03_frontend_design_standalone.md（2.3節）に従って nuxt.config.ts を作成**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Nuxt 4互換モード
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },
  ssr: false, // SPA mode（ローカル環境用）

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/ui',
    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint'
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:8000',
    }
  },

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/variables" as *;'
        }
      }
    }
  },

  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss',
    themes: ['dark']
  },

  compatibilityDate: '2025-01-01'
})
```

#### 1.4 環境変数設定

```bash
# .env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000
NUXT_PUBLIC_WS_URL=ws://localhost:8000
```

```bash
# .gitignore に追加
.env
.nuxt
.output
dist
node_modules
coverage
.vitest
.playwright
test-results
```

### Phase 2: ディレクトリ構造作成 (Day 1)

**設計書 03_frontend_design_standalone.md（2.1節）の完全なディレクトリ構造を作成**

```bash
# DDDアーキテクチャに基づく構造
mkdir -p configs
mkdir -p libs/domains/{training,environment,playback,model}
mkdir -p libs/entities/{training,environment,model}
mkdir -p libs/repositories/{training,environment,playback,model}
mkdir -p composables
mkdir -p components/{common,training,environment,visualization,playback}
mkdir -p layouts
mkdir -p pages/{training,playback,models,settings}
mkdir -p stores
mkdir -p types
mkdir -p utils
mkdir -p plugins
mkdir -p assets/{css,styles,images}
mkdir -p tests/{unit,e2e}
mkdir -p tests/unit/{composables,components,domains,repositories}
mkdir -p tests/e2e

# 各ディレクトリに .gitkeep 作成（空ディレクトリをGit管理）
find . -type d -empty -exec touch {}/.gitkeep \;
```

### Phase 3: 設定層実装 (Day 2)

#### 3.1 APIエンドポイント定義

**設計書 03_frontend_design_standalone.md（4.1節）を参照**

```typescript
// configs/api.ts

/**
 * APIエンドポイント定義
 * すべてのAPIエンドポイントURLをここで一元管理
 */

const runtimeConfig = useRuntimeConfig()
const API_BASE_URL = runtimeConfig.public.apiBaseUrl

export const API_ENDPOINTS = {
  // Training API
  training: {
    sessions: `${API_BASE_URL}/api/v1/training/sessions`,
    start: `${API_BASE_URL}/api/v1/training/start`,
    stop: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/stop`,
    pause: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/pause`,
    resume: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/resume`,
    status: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/status`,
    metrics: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/metrics`,
    configure: (id: number) => `${API_BASE_URL}/api/v1/training/${id}/configure`,
  },

  // Environment API
  environment: {
    state: `${API_BASE_URL}/api/v1/environment/state`,
    config: `${API_BASE_URL}/api/v1/environment/config`,
    reset: `${API_BASE_URL}/api/v1/environment/reset`,
    action: `${API_BASE_URL}/api/v1/environment/action`,
  },

  // Playback API
  playback: {
    sessions: `${API_BASE_URL}/api/v1/playback/sessions`,
    data: (id: number) => `${API_BASE_URL}/api/v1/playback/${id}/data`,
  },

  // Model API
  models: {
    list: `${API_BASE_URL}/api/v1/models`,
    upload: `${API_BASE_URL}/api/v1/models/upload`,
    download: (filename: string) => `${API_BASE_URL}/api/v1/models/${filename}`,
  }
} as const

export const WS_ENDPOINTS = {
  training: (sessionId: number) => `${runtimeConfig.public.wsUrl}/ws/training/${sessionId}`,
} as const
```

#### 3.2 定数定義

```typescript
// configs/constants.ts

export const TRAINING_ALGORITHMS = {
  PPO: 'ppo',
  A3C: 'a3c',
} as const

export const ENVIRONMENT_TYPES = {
  STANDARD: 'standard',
  ENHANCED: 'enhanced',
} as const

export const TRAINING_STATUS = {
  CREATED: 'created',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export const DEFAULT_CONFIG = {
  ENV_WIDTH: 8,
  ENV_HEIGHT: 8,
  TOTAL_TIMESTEPS: 10000,
  COVERAGE_WEIGHT: 1.5,
  EXPLORATION_WEIGHT: 3.0,
  DIVERSITY_WEIGHT: 2.0,
} as const

export const ROBOT_ORIENTATION = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
} as const

export const ROBOT_ORIENTATION_LABELS = ['北', '東', '南', '西'] as const
```

### Phase 4: ドメイン層実装 (Day 2-3)

**設計書 03_frontend_design_standalone.md（3章）のドメインモデルを完全実装**

#### 4.1 TrainingSession ドメインモデル

```typescript
// libs/domains/training/TrainingSession.ts

/**
 * 学習セッションドメインモデル
 *
 * ビジネスルール:
 * - statusが'running'の場合のみ進捗更新可能
 * - totalTimestepsに達したら自動的に'completed'に遷移
 * - 進捗率は常に0-100の範囲
 */
export class TrainingSession {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly algorithm: 'ppo' | 'a3c',
    public readonly environmentType: 'standard' | 'enhanced',
    public readonly status: 'created' | 'running' | 'paused' | 'completed' | 'failed',
    public readonly totalTimesteps: number,
    public readonly currentTimestep: number,
    public readonly episodesCompleted: number,
    public readonly envWidth: number,
    public readonly envHeight: number,
    public readonly coverageWeight: number,
    public readonly explorationWeight: number,
    public readonly diversityWeight: number,
    public readonly modelPath?: string,
    public readonly config?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly startedAt?: Date,
    public readonly completedAt?: Date
  ) {
    this.validateTimesteps()
    this.validateEnvironmentSize()
    this.validateWeights()
  }

  /**
   * 学習が進行中かどうか
   */
  get isRunning(): boolean {
    return this.status === 'running'
  }

  /**
   * 学習が完了したかどうか
   */
  get isCompleted(): boolean {
    return this.status === 'completed'
  }

  /**
   * 進捗率を取得 (0-100)
   */
  get progress(): number {
    if (this.totalTimesteps === 0) return 0
    return Math.round((this.currentTimestep / this.totalTimesteps) * 100)
  }

  /**
   * 学習時間を取得 (ミリ秒)
   */
  get duration(): number | null {
    if (!this.startedAt) return null
    const endTime = this.completedAt || new Date()
    return endTime.getTime() - this.startedAt.getTime()
  }

  /**
   * アルゴリズム表示名
   */
  get algorithmDisplayName(): string {
    return this.algorithm.toUpperCase()
  }

  /**
   * 環境タイプ表示名
   */
  get environmentTypeDisplayName(): string {
    return this.environmentType === 'enhanced' ? '拡張環境' : '標準環境'
  }

  private validateTimesteps(): void {
    if (this.totalTimesteps < 1000) {
      throw new Error('Total timesteps must be at least 1000')
    }
    if (this.currentTimestep < 0 || this.currentTimestep > this.totalTimesteps) {
      throw new Error('Current timestep out of range')
    }
  }

  private validateEnvironmentSize(): void {
    if (this.envWidth < 5 || this.envWidth > 50) {
      throw new Error('Environment width must be between 5 and 50')
    }
    if (this.envHeight < 5 || this.envHeight > 50) {
      throw new Error('Environment height must be between 5 and 50')
    }
  }

  private validateWeights(): void {
    if (this.coverageWeight < 0 || this.coverageWeight > 10) {
      throw new Error('Coverage weight must be between 0 and 10')
    }
    if (this.explorationWeight < 0 || this.explorationWeight > 10) {
      throw new Error('Exploration weight must be between 0 and 10')
    }
    if (this.diversityWeight < 0 || this.diversityWeight > 10) {
      throw new Error('Diversity weight must be between 0 and 10')
    }
  }
}
```

#### 4.2 TrainingMetrics ドメインモデル

```typescript
// libs/domains/training/TrainingMetrics.ts

/**
 * 学習メトリクスドメインモデル
 *
 * リアルタイム更新される学習進捗データ
 */
export class TrainingMetrics {
  constructor(
    public readonly id: number,
    public readonly sessionId: number,
    public readonly timestep: number,
    public readonly episode: number,
    public readonly reward: number,
    public readonly loss: number | null,
    public readonly coverageRatio: number | null,
    public readonly explorationScore: number | null,
    public readonly timestamp: Date
  ) {
    this.validateMetrics()
  }

  /**
   * メトリクス文字列表現
   */
  get summary(): string {
    return `Episode ${this.episode} - Step ${this.timestep}: Reward=${this.reward.toFixed(2)}`
  }

  /**
   * 報酬が正の値か
   */
  get isPositiveReward(): boolean {
    return this.reward > 0
  }

  private validateMetrics(): void {
    if (this.timestep < 0) {
      throw new Error('Timestep must be non-negative')
    }
    if (this.episode < 0) {
      throw new Error('Episode must be non-negative')
    }
    if (this.coverageRatio !== null && (this.coverageRatio < 0 || this.coverageRatio > 1)) {
      throw new Error('Coverage ratio must be between 0 and 1')
    }
  }
}
```

#### 4.3 Environment ドメインモデル

**設計書 03_frontend_design_standalone.md（3.2節）の完全な実装を参照**

```typescript
// libs/domains/environment/Environment.ts

export interface SuspiciousObject {
  id: number
  x: number
  y: number
  threatLevel: number
  detectedAt?: Date
}

/**
 * 環境状態ドメインモデル
 */
export class Environment {
  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly robotX: number,
    public readonly robotY: number,
    public readonly robotOrientation: number, // 0=北, 1=東, 2=南, 3=西
    public readonly threatGrid: number[][], // [y][x] = 0.0-1.0
    public readonly coverageMap: boolean[][], // [y][x] = visited
    public readonly suspiciousObjects: SuspiciousObject[]
  ) {
    this.validateRobotPosition()
    this.validateGridDimensions()
  }

  get orientationText(): string {
    const directions = ['北', '東', '南', '西']
    return directions[this.robotOrientation] || '不明'
  }

  get averageThreatLevel(): number {
    const total = this.threatGrid.flat().reduce((sum, val) => sum + val, 0)
    return total / (this.width * this.height)
  }

  get coverageRatio(): number {
    const covered = this.coverageMap.flat().filter(v => v).length
    return covered / (this.width * this.height)
  }

  get suspiciousObjectCount(): number {
    return this.suspiciousObjects.length
  }

  getThreatLevelAt(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 0
    }
    return this.threatGrid[y][x]
  }

  isCovered(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false
    }
    return this.coverageMap[y][x]
  }

  private validateRobotPosition(): void {
    if (this.robotX < 0 || this.robotX >= this.width) {
      throw new Error(`Robot X position ${this.robotX} out of bounds`)
    }
    if (this.robotY < 0 || this.robotY >= this.height) {
      throw new Error(`Robot Y position ${this.robotY} out of bounds`)
    }
    if (this.robotOrientation < 0 || this.robotOrientation > 3) {
      throw new Error(`Invalid robot orientation ${this.robotOrientation}`)
    }
  }

  private validateGridDimensions(): void {
    if (this.threatGrid.length !== this.height) {
      throw new Error('Threat grid height mismatch')
    }
    if (this.threatGrid[0]?.length !== this.width) {
      throw new Error('Threat grid width mismatch')
    }
    if (this.coverageMap.length !== this.height) {
      throw new Error('Coverage map height mismatch')
    }
    if (this.coverageMap[0]?.length !== this.width) {
      throw new Error('Coverage map width mismatch')
    }
  }
}
```

### Phase 5: リポジトリ層実装 (Day 3-4)

**設計書 03_frontend_design_standalone.md（4章）のリポジトリパターンを完全実装**

#### 5.1 TrainingRepository インターフェース

```typescript
// libs/repositories/training/TrainingRepository.ts

import type { TrainingSession } from '~/libs/domains/training/TrainingSession'
import type { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'

export interface TrainingConfig {
  name: string
  algorithm: 'ppo' | 'a3c'
  environmentType: 'standard' | 'enhanced'
  totalTimesteps: number
  envWidth: number
  envHeight: number
  coverageWeight: number
  explorationWeight: number
  diversityWeight: number
}

/**
 * 学習リポジトリインターフェース
 */
export interface TrainingRepository {
  findAll(): Promise<TrainingSession[]>
  findById(id: number): Promise<TrainingSession | null>
  create(config: TrainingConfig): Promise<TrainingSession>
  stop(id: number): Promise<boolean>
  pause(id: number): Promise<boolean>
  resume(id: number): Promise<boolean>
  getMetrics(id: number, limit?: number): Promise<TrainingMetrics[]>
}
```

#### 5.2 TrainingRepository 実装

**設計書 03_frontend_design_standalone.md（4.2節）の完全実装**

```typescript
// libs/repositories/training/TrainingRepositoryImpl.ts

import type { TrainingRepository, TrainingConfig } from './TrainingRepository'
import type { TrainingSession } from '~/libs/domains/training/TrainingSession'
import type { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'
import { API_ENDPOINTS } from '~/configs/api'

// DTO型定義
interface TrainingSessionDTO {
  id: number
  name: string
  algorithm: 'ppo' | 'a3c'
  environment_type: 'standard' | 'enhanced'
  status: 'created' | 'running' | 'paused' | 'completed' | 'failed'
  total_timesteps: number
  current_timestep: number
  episodes_completed: number
  env_width: number
  env_height: number
  coverage_weight: number
  exploration_weight: number
  diversity_weight: number
  model_path?: string
  config?: Record<string, any>
  created_at?: string
  started_at?: string
  completed_at?: string
}

interface TrainingMetricsDTO {
  id: number
  session_id: number
  timestep: number
  episode: number
  reward: number
  loss: number | null
  coverage_ratio: number | null
  exploration_score: number | null
  timestamp: string
}

/**
 * 学習リポジトリ実装
 */
export class TrainingRepositoryImpl implements TrainingRepository {
  async findAll(): Promise<TrainingSession[]> {
    try {
      const response = await $fetch<TrainingSessionDTO[]>(API_ENDPOINTS.training.sessions)
      return response.map(dto => this.toDomain(dto))
    } catch (error) {
      console.error('Failed to fetch training sessions:', error)
      throw error
    }
  }

  async findById(id: number): Promise<TrainingSession | null> {
    try {
      const response = await $fetch<TrainingSessionDTO>(API_ENDPOINTS.training.status(id))
      return this.toDomain(response)
    } catch (error) {
      console.error(`Failed to fetch training session ${id}:`, error)
      return null
    }
  }

  async create(config: TrainingConfig): Promise<TrainingSession> {
    try {
      const response = await $fetch<TrainingSessionDTO>(API_ENDPOINTS.training.start, {
        method: 'POST',
        body: {
          name: config.name,
          algorithm: config.algorithm,
          environment_type: config.environmentType,
          total_timesteps: config.totalTimesteps,
          env_width: config.envWidth,
          env_height: config.envHeight,
          coverage_weight: config.coverageWeight,
          exploration_weight: config.explorationWeight,
          diversity_weight: config.diversityWeight,
        },
      })
      return this.toDomain(response)
    } catch (error) {
      console.error('Failed to create training session:', error)
      throw error
    }
  }

  async stop(id: number): Promise<boolean> {
    try {
      await $fetch(API_ENDPOINTS.training.stop(id), { method: 'POST' })
      return true
    } catch (error) {
      console.error(`Failed to stop training session ${id}:`, error)
      return false
    }
  }

  async pause(id: number): Promise<boolean> {
    try {
      await $fetch(API_ENDPOINTS.training.pause(id), { method: 'POST' })
      return true
    } catch (error) {
      console.error(`Failed to pause training session ${id}:`, error)
      return false
    }
  }

  async resume(id: number): Promise<boolean> {
    try {
      await $fetch(API_ENDPOINTS.training.resume(id), { method: 'POST' })
      return true
    } catch (error) {
      console.error(`Failed to resume training session ${id}:`, error)
      return false
    }
  }

  async getMetrics(id: number, limit: number = 100): Promise<TrainingMetrics[]> {
    try {
      const response = await $fetch<TrainingMetricsDTO[]>(
        API_ENDPOINTS.training.metrics(id),
        { params: { limit } }
      )
      return response.map(dto => this.metricsToDomai(dto))
    } catch (error) {
      console.error(`Failed to fetch metrics for session ${id}:`, error)
      throw error
    }
  }

  // DTO → Domain変換
  private toDomain(dto: TrainingSessionDTO): TrainingSession {
    return new TrainingSession(
      dto.id,
      dto.name,
      dto.algorithm,
      dto.environment_type,
      dto.status,
      dto.total_timesteps,
      dto.current_timestep,
      dto.episodes_completed,
      dto.env_width,
      dto.env_height,
      dto.coverage_weight,
      dto.exploration_weight,
      dto.diversity_weight,
      dto.model_path,
      dto.config,
      dto.created_at ? new Date(dto.created_at) : undefined,
      dto.started_at ? new Date(dto.started_at) : undefined,
      dto.completed_at ? new Date(dto.completed_at) : undefined
    )
  }

  private metricsToDomai(dto: TrainingMetricsDTO): TrainingMetrics {
    return new TrainingMetrics(
      dto.id,
      dto.session_id,
      dto.timestep,
      dto.episode,
      dto.reward,
      dto.loss,
      dto.coverage_ratio,
      dto.exploration_score,
      new Date(dto.timestamp)
    )
  }
}
```

### Phase 6: アプリケーション層実装 (Day 4-5)

**設計書 03_frontend_design_standalone.md（5章）のComposablesを完全実装**

#### 6.1 useTraining Composable

```typescript
// composables/useTraining.ts

import { ref, computed } from 'vue'
import type { TrainingSession } from '~/libs/domains/training/TrainingSession'
import type { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'
import { TrainingRepositoryImpl } from '~/libs/repositories/training/TrainingRepositoryImpl'
import type { TrainingConfig } from '~/libs/repositories/training/TrainingRepository'

/**
 * 学習管理Composable
 * リポジトリを使用してビジネスロジックを実装
 */
export const useTraining = () => {
  const repository = new TrainingRepositoryImpl()

  const sessions = ref<TrainingSession[]>([])
  const currentSession = ref<TrainingSession | null>(null)
  const metrics = ref<TrainingMetrics[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeSessions = computed(() =>
    sessions.value.filter(s => s.isRunning)
  )

  const completedSessions = computed(() =>
    sessions.value.filter(s => s.isCompleted)
  )

  // Methods
  const fetchSessions = async () => {
    isLoading.value = true
    error.value = null

    try {
      sessions.value = await repository.findAll()
    } catch (err) {
      error.value = 'Failed to fetch training sessions'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const createSession = async (config: TrainingConfig): Promise<TrainingSession | null> => {
    isLoading.value = true
    error.value = null

    try {
      const newSession = await repository.create(config)
      sessions.value.push(newSession)
      currentSession.value = newSession
      return newSession
    } catch (err) {
      error.value = 'Failed to create training session'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const stopSession = async (id: number): Promise<boolean> => {
    try {
      const success = await repository.stop(id)
      if (success) {
        await fetchSessions()
      }
      return success
    } catch (err) {
      error.value = 'Failed to stop training session'
      console.error(err)
      return false
    }
  }

  const pauseSession = async (id: number): Promise<boolean> => {
    try {
      const success = await repository.pause(id)
      if (success) {
        await fetchSessions()
      }
      return success
    } catch (err) {
      error.value = 'Failed to pause training session'
      console.error(err)
      return false
    }
  }

  const resumeSession = async (id: number): Promise<boolean> => {
    try {
      const success = await repository.resume(id)
      if (success) {
        await fetchSessions()
      }
      return success
    } catch (err) {
      error.value = 'Failed to resume training session'
      console.error(err)
      return false
    }
  }

  const fetchMetrics = async (sessionId: number) => {
    try {
      metrics.value = await repository.getMetrics(sessionId)
    } catch (err) {
      error.value = 'Failed to fetch metrics'
      console.error(err)
    }
  }

  return {
    // State
    sessions,
    currentSession,
    metrics,
    isLoading,
    error,

    // Computed
    activeSessions,
    completedSessions,

    // Methods
    fetchSessions,
    createSession,
    stopSession,
    pauseSession,
    resumeSession,
    fetchMetrics,
  }
}
```

#### 6.2 useWebSocket Composable

**設計書 03_frontend_design_standalone.md（5.2節）の完全実装**

```typescript
// composables/useWebSocket.ts

import { ref, readonly, onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import { WS_ENDPOINTS } from '~/configs/api'

interface TrainingProgressData {
  timestep: number
  episode: number
  reward: number
  loss: number
  coverage_ratio: number
  exploration_score: number
}

interface TrainingProgressMessage {
  type: 'training_progress'
  session_id: number
  data: TrainingProgressData
  timestamp: string
}

interface EnvironmentUpdateMessage {
  type: 'environment_update'
  session_id: number
  data: {
    step: number
    robot: { x: number; y: number; orientation: number }
    threat_grid: number[][]
    suspicious_objects: any[]
  }
  timestamp: string
}

/**
 * WebSocket管理Composable
 */
export const useWebSocket = () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5

  const config = useRuntimeConfig()

  const connect = () => {
    if (socket.value?.connected) return

    socket.value = io(config.public.wsUrl, {
      transports: ['websocket'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      reconnectAttempts.value = 0
      console.log('WebSocket connected')
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('WebSocket disconnected')
    })

    socket.value.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed')
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  const subscribeToSession = (sessionId: number) => {
    if (socket.value?.connected) {
      socket.value.emit('subscribe_session', { session_id: sessionId })
    }
  }

  const unsubscribeFromSession = (sessionId: number) => {
    if (socket.value?.connected) {
      socket.value.emit('unsubscribe_session', { session_id: sessionId })
    }
  }

  const onTrainingProgress = (callback: (message: TrainingProgressMessage) => void) => {
    if (socket.value) {
      socket.value.on('training_progress', callback)
    }
  }

  const onEnvironmentUpdate = (callback: (message: EnvironmentUpdateMessage) => void) => {
    if (socket.value) {
      socket.value.on('environment_update', callback)
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket: readonly(socket),
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    subscribeToSession,
    unsubscribeFromSession,
    onTrainingProgress,
    onEnvironmentUpdate,
  }
}
```

### Phase 7: プレゼンテーション層実装 (Day 6-9)

**設計書 03_frontend_design_standalone.md（6章）のコンポーネントを完全実装**

#### 7.1 コーディング規約（必須）

**すべてのVueコンポーネントは以下の順序で記述:**
1. **Script**: `<script setup lang="ts">`
2. **Template**: `<template>`
3. **Style**: `<style lang="scss" scoped>`

**CSS命名規則**: BEM記法 `block__element--modifier`

#### 7.2 TrainingControl コンポーネント

**設計書 03_frontend_design_standalone.md（6.2節）の完全実装**

```vue
<!-- components/training/TrainingControl.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { TrainingConfig } from '~/libs/repositories/training/TrainingRepository'
import type { FormInstance } from 'element-plus'

const { createSession, stopSession, currentSession, isLoading } = useTraining()
const { subscribeToSession, unsubscribeFromSession } = useWebSocket()

const formRef = ref<FormInstance>()
const trainingConfig = ref<TrainingConfig>({
  name: '',
  algorithm: 'ppo',
  environmentType: 'standard',
  totalTimesteps: 10000,
  envWidth: 8,
  envHeight: 8,
  coverageWeight: 1.5,
  explorationWeight: 3.0,
  diversityWeight: 2.0
})

const statusText = computed(() => {
  switch (currentSession.value?.status) {
    case 'running': return '実行中'
    case 'paused': return '一時停止'
    case 'completed': return '完了'
    case 'failed': return '失敗'
    default: return '未開始'
  }
})

const statusTagType = computed(() => {
  switch (currentSession.value?.status) {
    case 'running': return 'success'
    case 'paused': return 'warning'
    case 'completed': return 'info'
    case 'failed': return 'danger'
    default: return ''
  }
})

const startTraining = async () => {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  if (!isValid) return

  const session = await createSession(trainingConfig.value)
  if (session) {
    ElMessage.success('学習を開始しました')
    subscribeToSession(session.id)
  }
}

const stopTraining = async () => {
  if (!currentSession.value) return

  const success = await stopSession(currentSession.value.id)
  if (success) {
    ElMessage.success('学習を停止しました')
    unsubscribeFromSession(currentSession.value.id)
  }
}
</script>

<template>
  <el-card class="training-control">
    <template #header>
      <div class="training-control__header">
        <span>学習制御</span>
        <el-tag :type="statusTagType">{{ statusText }}</el-tag>
      </div>
    </template>

    <div v-if="!currentSession" class="training-control__start-section">
      <el-form ref="formRef" :model="trainingConfig" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="セッション名" prop="name" required>
              <el-input v-model="trainingConfig.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="アルゴリズム">
              <el-select v-model="trainingConfig.algorithm">
                <el-option label="PPO" value="ppo" />
                <el-option label="A3C" value="a3c" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="総ステップ数">
              <el-input-number
                v-model="trainingConfig.totalTimesteps"
                :min="1000"
                :max="1000000"
                :step="1000"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="環境タイプ">
              <el-select v-model="trainingConfig.environmentType">
                <el-option label="標準環境" value="standard" />
                <el-option label="拡張環境" value="enhanced" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button
            type="primary"
            :loading="isLoading"
            @click="startTraining"
          >
            学習開始
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-else class="training-control__session-control">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="セッション名">
          {{ currentSession.name }}
        </el-descriptions-item>
        <el-descriptions-item label="進捗">
          {{ currentSession.progress }}%
        </el-descriptions-item>
      </el-descriptions>

      <div class="training-control__control-buttons">
        <el-button type="danger" @click="stopTraining" :loading="isLoading">
          停止
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.training-control {
  margin-bottom: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__start-section {
    padding: 20px 0;
  }

  &__session-control {
    padding: 20px 0;
  }

  &__control-buttons {
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }
}
</style>
```

#### 7.3 RewardChart コンポーネント

```vue
<!-- components/visualization/RewardChart.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  metrics: TrainingMetrics[]
}

const props = defineProps<Props>()

const chartData = computed(() => ({
  labels: props.metrics.map(m => m.timestep.toString()),
  datasets: [
    {
      label: '報酬',
      data: props.metrics.map(m => m.reward),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: '学習進捗 - 報酬'
    },
    legend: {
      display: true,
      position: 'top' as const
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Timestep'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Reward'
      }
    }
  }
}
</script>

<template>
  <div class="reward-chart">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style lang="scss" scoped>
.reward-chart {
  height: 400px;
  width: 100%;
}
</style>
```

### Phase 8: ページ実装 (Day 10-11)

#### 8.1 ダッシュボードページ

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'

const { sessions, fetchSessions, activeSessions, completedSessions } = useTraining()
const { connect, isConnected } = useWebSocket()

onMounted(async () => {
  await fetchSessions()
  connect()
})
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>アクティブセッション</span>
          </template>
          <div class="stat-value">{{ activeSessions.length }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>完了セッション</span>
          </template>
          <div class="stat-value">{{ completedSessions.length }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>WebSocket接続</span>
          </template>
          <div class="stat-value">
            <el-tag :type="isConnected ? 'success' : 'danger'">
              {{ isConnected ? '接続中' : '切断' }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <TrainingControl />
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>学習セッション一覧</span>
          </template>
          <el-table :data="sessions" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="名前" />
            <el-table-column prop="algorithmDisplayName" label="アルゴリズム" />
            <el-table-column prop="status" label="ステータス" />
            <el-table-column prop="progress" label="進捗" width="100">
              <template #default="{ row }">
                {{ row.progress }}%
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="$router.push(`/training/${row.id}`)"
                >
                  詳細
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;

  .stat-value {
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    padding: 20px 0;
  }
}
</style>
```

### Phase 9: テスト実装 (Day 12-14)

**設計書 04_test_design_standalone.md（3章）のフロントエンドテストを完全実装**

#### 9.1 Vitest設定

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '.nuxt/',
        'nuxt.config.ts'
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85
      }
    }
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.')
    }
  }
})
```

#### 9.2 ドメインモデル単体テスト

```typescript
// tests/unit/domains/TrainingSession.spec.ts
import { describe, it, expect } from 'vitest'
import { TrainingSession } from '~/libs/domains/training/TrainingSession'

describe('TrainingSession', () => {
  it('should create valid training session', () => {
    const session = new TrainingSession(
      1,
      'Test Session',
      'ppo',
      'standard',
      'created',
      10000,
      0,
      0,
      8,
      8,
      1.5,
      3.0,
      2.0
    )

    expect(session.id).toBe(1)
    expect(session.name).toBe('Test Session')
    expect(session.algorithm).toBe('ppo')
    expect(session.progress).toBe(0)
  })

  it('should calculate progress correctly', () => {
    const session = new TrainingSession(
      1, 'Test', 'ppo', 'standard', 'running',
      10000, 5000, 50, 8, 8, 1.5, 3.0, 2.0
    )

    expect(session.progress).toBe(50)
  })

  it('should validate timesteps', () => {
    expect(() => {
      new TrainingSession(
        1, 'Test', 'ppo', 'standard', 'created',
        500, 0, 0, 8, 8, 1.5, 3.0, 2.0
      )
    }).toThrow('Total timesteps must be at least 1000')
  })

  it('should detect running status', () => {
    const session = new TrainingSession(
      1, 'Test', 'ppo', 'standard', 'running',
      10000, 1000, 10, 8, 8, 1.5, 3.0, 2.0
    )

    expect(session.isRunning).toBe(true)
    expect(session.isCompleted).toBe(false)
  })
})
```

#### 9.3 Composables単体テスト

```typescript
// tests/unit/composables/useTraining.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTraining } from '~/composables/useTraining'
import { TrainingRepositoryImpl } from '~/libs/repositories/training/TrainingRepositoryImpl'

// Repository をモック化
vi.mock('~/libs/repositories/training/TrainingRepositoryImpl')

describe('useTraining', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch training sessions', async () => {
    const mockSessions = [
      {
        id: 1,
        name: 'Test Session',
        algorithm: 'ppo',
        status: 'completed'
      }
    ]

    vi.mocked(TrainingRepositoryImpl).mockImplementation(() => ({
      findAll: vi.fn().mockResolvedValue(mockSessions)
    } as any))

    const { sessions, fetchSessions } = useTraining()
    await fetchSessions()

    expect(sessions.value).toHaveLength(1)
    expect(sessions.value[0].name).toBe('Test Session')
  })

  it('should create new training session', async () => {
    const mockSession = {
      id: 1,
      name: 'New Session',
      algorithm: 'ppo',
      status: 'created'
    }

    vi.mocked(TrainingRepositoryImpl).mockImplementation(() => ({
      create: vi.fn().mockResolvedValue(mockSession)
    } as any))

    const { createSession, currentSession } = useTraining()
    const config = {
      name: 'New Session',
      algorithm: 'ppo' as const,
      environmentType: 'standard' as const,
      totalTimesteps: 10000,
      envWidth: 8,
      envHeight: 8,
      coverageWeight: 1.5,
      explorationWeight: 3.0,
      diversityWeight: 2.0
    }

    const result = await createSession(config)

    expect(result).not.toBeNull()
    expect(result?.name).toBe('New Session')
    expect(currentSession.value?.name).toBe('New Session')
  })
})
```

#### 9.4 Playwright E2Eテスト設定

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### 9.5 E2Eテスト実装

```typescript
// tests/e2e/training-workflow.spec.ts
import { test, expect } from '@playwright/test'

test('complete training workflow', async ({ page }) => {
  // ダッシュボードに移動
  await page.goto('/')

  // 学習セッション名を入力
  await page.fill('input[aria-label="セッション名"]', 'E2E Test Training')

  // アルゴリズム選択
  await page.selectOption('select[aria-label="アルゴリズム"]', 'ppo')

  // 学習開始ボタンクリック
  await page.click('button:has-text("学習開始")')

  // 成功メッセージ確認
  await expect(page.locator('.el-message--success')).toBeVisible()

  // セッション一覧に表示されることを確認
  await expect(page.locator('text=E2E Test Training')).toBeVisible()
})
```

## ✅ 実装チェックリスト

### Phase 1-2: プロジェクト初期化
- [ ] pnpm 9.12.0インストール確認
- [ ] Nuxt v4プロジェクト初期化成功
- [ ] 全依存関係インストール成功（package.json確認）
- [ ] TypeScript strict mode有効化
- [ ] DDD構造ディレクトリ作成完了

### Phase 3-4: 設定・ドメイン層
- [ ] configs/api.ts エンドポイント定義完了
- [ ] libs/domains/ 全ドメインモデル実装完了
- [ ] TrainingSession, Environment等のバリデーション動作確認
- [ ] 単体テスト（ドメイン層）90%以上カバレッジ

### Phase 5-6: リポジトリ・アプリケーション層
- [ ] TrainingRepository インターフェース・実装完了
- [ ] EnvironmentRepository インターフェース・実装完了
- [ ] useTraining Composable実装完了
- [ ] useWebSocket Composable実装完了
- [ ] Repository層のモックテスト成功

### Phase 7-8: プレゼンテーション・ページ層
- [ ] BEM記法によるCSS命名徹底
- [ ] TrainingControl コンポーネント動作確認
- [ ] RewardChart コンポーネント表示確認
- [ ] ダッシュボードページ表示成功
- [ ] Element Plus UIコンポーネント正常動作

### Phase 9: テスト
- [ ] Vitest単体テスト: 85%以上カバレッジ
- [ ] Playwright E2Eテスト: 主要フロー動作確認
- [ ] 全テスト実行成功（pnpm run test）

### 最終確認
- [ ] 設計書03, 04との整合性100%
- [ ] TypeScriptコンパイルエラーなし（pnpm run build）
- [ ] ESLint, Stylelint違反なし
- [ ] README.md整備完了

## 🎓 実装のベストプラクティス

### 1. 設計書優先アプローチ
**必ず設計書を先に読んでから実装してください**:
- `03_frontend_design_standalone.md` - フロントエンド詳細設計（**最重要**）
- `04_test_design_standalone.md` - テスト戦略（フロントエンド部分）

### 2. DDDアーキテクチャ厳守
- **Domain層**: 外部依存なし、純粋なビジネスロジック
- **Repository層**: 必ずインターフェースと実装を分離
- **Composables**: Repository経由でのみデータアクセス
- **Components**: ロジックなし、表示のみ

### 3. TypeScript型安全性
- **strict mode**: 必ず有効化
- **any禁止**: 明示的な型定義を徹底
- **Interface優先**: type よりも interface を使用

### 4. テスト駆動開発
- **カバレッジ目標**: 85%以上
- **単体テスト**: ドメイン・Repository・Composables
- **E2Eテスト**: クリティカルパス10個以上

### 5. コード品質管理
- **ESLint**: 必ず実行してから commit
- **Stylelint**: SCSS記法チェック
- **vue-tsc**: Vue TypeScript型チェック

## 📋 実装完了基準

以下をすべて満たした時点で実装完了とみなします:

1. ✅ 全Phase(1-9)のチェックリスト完了
2. ✅ TypeScriptコンパイル成功（pnpm run build）
3. ✅ 単体テストカバレッジ85%以上
4. ✅ E2Eテスト10個以上成功
5. ✅ Linter違反ゼロ（ESLint, Stylelint）
6. ✅ 設計書03, 04との整合性100%
7. ✅ pnpm run dev で開発サーバー起動成功

このガイドと設計書を組み合わせることで、**リポジトリ知識なしでもフロントエンドの完全な実装が可能です**。

---

## 📊 進捗管理ファイル

実装作業中は、以下のファイルで進捗を管理してください:

### PROGRESS.md の構造
- **目次とアンカーリンク**: 上部に配置し、各セクションへ移動可能に
- **フェーズごとにセクション作成**: アンカーリンクで移動可能
- **状態管理**: 完了/進行中/未着手の状態を明確に管理
- **自由に編集可能**: 現在の状態を反映するよう随時更新
- **マシン固有の情報**: 環境構築に関する情報は、マシン固有のものを含めないか、明確に区別する

### DIARY02.md の構造 (Session 016以降)
- **最新エントリを上部に配置** (逆時系列順)
- **目次とアンカーリンク**: 上部に配置
- **新しいセッション**: 目次の直後、前回セッションの前に挿入
- **過去のエントリは編集しない**: 新しいエントリのみ追記
- **マシン固有の情報**: 環境構築に関する情報は、マシン固有のものを含めないか、明確に区別する
- **注意**: Session 001-015は`DIARY01.md`に記録済み。総括は`summary/DIARY01.md`を参照。

**DIARY02.md 構造例:**
```markdown
# Development Diary

## 📑 Table of Contents
- [2025-10-07 - Session 3: Latest Work](#session-3-anchor)
- [2025-10-06 - Session 2: Previous Work](#session-2-anchor)
- [2025-10-06 - Session 1: Initial Work](#session-1-anchor)

---

## 2025-10-07 - Session 3: Latest Work
[Latest session content here]

---

## 2025-10-06 - Session 2: Previous Work
[Previous session content here]

---

## 2025-10-06 - Session 1: Initial Work
[First session content here]
```

### 環境構築と進捗管理の注意点
- **環境構築は複数マシン・サーバで実施される可能性がある**
- マシン固有の情報（ローカルパス、IP、ホスト名など）は進捗ファイルに含めない
- または、マシン固有の情報を記載する場合は、セクションを分けて明確に区別する
- 汎用的な手順や完了状態のみを記録する

詳細は `../../CLAUDE.md` を参照してください。
