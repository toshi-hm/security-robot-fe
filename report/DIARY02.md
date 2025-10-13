# 開発日記 (DIARY02.md)

> **目的**: 各セッションで何を実施したかを時系列で記録
> **ルール**:
> - 最新エントリを**上部**に配置 (逆時系列順)
> - 過去のエントリは**編集しない**
> - 新しいセッションは目次の直後、前回セッションの前に挿入
> - Session 016以降を記録

---

## 📑 目次

- [Session 023 - Models Page Fix](#session-023---models-page-pinia-initialization-fix-2025-10-13)
- [Session 022 - Phase 22 Complete](#session-022---phase-22-environment-visualization-integration-2025-10-13)
- [Session 021 - Phase 21 Complete](#session-021---phase-21-websocket-features-enhancement-2025-10-13)
- [Session 017 - Phase 17 Complete](#session-017---phase-17-websocket-integration-complete-2025-10-12)
- [Session 016 - WebSocket Integration Start](#session-016---websocket-integration-start-2025-10-11)

---

## 📝 セッション記録

### Session 023 - Models Page Pinia Initialization Fix (2025-10-13)

**目的**: `/models` ページの500エラー（Pinia初期化問題）を解決

**問題の発見**:
- `/models` ページアクセス時に500 Internal Server Error発生
- エラー内容: `getActivePinia()` was called but there was no active Pinia
- バックエンドAPIとフロントエンドのデータ構造に不整合

**実施した修正**:

1. **データモデルの修正**
   - `libs/entities/model/ModelEntity.ts`: バックエンドの`FileMetadataResponse`に合わせて完全書き直し
   - フラットな構造に変更（`id`, `filename`, `file_size`, `created_at`等）
   - 不要ファイル削除: `libs/domains/model/Model.ts`, `ModelMetadata.ts`

2. **APIクライアントの修正**
   - `libs/repositories/model/ModelRepositoryImpl.ts`: アップロード時に`file_type: 'model'`パラメータ追加
   - バックエンドAPI仕様 (`app/schemas/files.py`の`FileMetadataResponse`) に準拠

3. **UIコンポーネントの修正**
   - `pages/models/index.vue`: プロパティ名を修正
     - `row.size` → `row.file_size`
     - `row.uploaded_at` → `row.created_at`  
     - `prop="filename"` → `prop="original_filename"`
   - Element Plusアイコン対応:
     - `@element-plus/icons-vue` パッケージインストール
     - `UploadFilled` アイコンを明示的にインポート

4. **Composableパターンへの移行**
   - `composables/useModels.ts`: 新規作成（依存性注入パターン）
     - リポジトリの遅延初期化: `repository || new ModelRepositoryImpl()`
     - 関数内での初期化によりPinia初期化タイミング問題を解決
   - `stores/models.ts`: composableパターンに移行
     - `useModels()` serviceを使用
     - `service.models` を公開
     - `usePlaybackStore` と同じパターンに統一

5. **Pinia初期化の最終修正**
   - `plugins/pinia.client.ts`: 新規作成
   - アプリケーション起動時に確実にPiniaインスタンスを初期化
   - 既存インスタンスの再利用または新規作成のロジック実装
   - `setActivePinia()` 呼び出しでアクティブ化

**技術的な学び**:

1. **Piniaの初期化タイミング問題**
   - デフォルトパラメータでの`new`は関数定義時に評価される
   - `export const useModels = (repository: ModelRepository = new ModelRepositoryImpl())` ← ❌
   - 解決策: `const repo = repository || new ModelRepositoryImpl()` ← ✅ (関数内で初期化)

2. **Composableパターンの重要性**
   - `usePlayback` と同様のパターンを採用することでストア間の一貫性を確保
   - 依存性注入パターンでテスタビリティとタイミング制御を両立

3. **バックエンドAPI仕様の確認重要性**
   - `/home/maya/work/security-robot-be/app/schemas/files.py` の`FileMetadataResponse`
   - フロントエンドのエンティティを完全に一致させる必要がある

**検証結果**:
- ✅ TypeScript型チェック: エラーなし
- ✅ ESLint: 新規エラーなし（既存の55 warnings のみ）
- ✅ `/models`ページ: Piniaエラー解消、正常に動作

**成果物**:

新規作成:
- `composables/useModels.ts`
- `plugins/pinia.client.ts`

修正:
- `libs/entities/model/ModelEntity.ts`
- `libs/repositories/model/ModelRepositoryImpl.ts`
- `pages/models/index.vue`
- `stores/models.ts`

削除:
- `libs/domains/model/Model.ts`
- `libs/domains/model/ModelMetadata.ts`

依存関係追加:
- `@element-plus/icons-vue: 2.3.2`

**時間**: 約90分
**コミット**: Models Page Pinia initialization fix

---

### Session 022 - Phase 22 Environment Visualization Integration (2025-10-13)

**目的**: Phase 22完全達成 - 環境可視化コンポーネント実装とWebSocket統合

**実施内容**:
1. **EnvironmentVisualization.vue完全書き直し**
   - 問題: 空のcanvasプレースホルダーのみ実装
   - 解決: Canvas 2D rendering完全実装
     - Props Interface定義:
       - gridWidth/gridHeight (デフォルト: 8x8)
       - robotPosition: {x, y} | null
       - coverageMap: boolean[][]
       - threatGrid: number[][]
     - 動的キャンバスサイズ計算 (cellSize: 60px)
     - レイヤーベースレンダリング:
       1. 脅威レベルヒートマップ (黄 → 赤グラデーション)
       2. カバレッジオーバーレイ (訪問済みセルは緑透明)
       3. グリッド線 (灰色枠)
       4. ロボット描画 (青円 + 方向インジケーター)
       5. 凡例表示 (Low/High threat, Visited)
     - getThreatColor(level): 0.0-1.0の脅威レベルを黄→赤に変換
     - drawLegend(): 凡例ボックスをcanvas内に描画
     - watch(): 全propsの変更を監視してリアルタイム再描画
     - onMounted(): 初期描画
     - BEM CSS: .environment-visualization__canvas

2. **Training Session Page統合**
   - 問題: WebSocketからの環境データが可視化コンポーネントに渡されていない
   - 解決:
     - 環境状態変数追加:
       - gridWidth: ref<number>(8)
       - gridHeight: ref<number>(8)
       - coverageMap: ref<boolean[][]>([])
       - threatGrid: ref<number[][]>([])
     - handleEnvironmentUpdate()拡張:
       - grid_width, grid_height受信
       - coverage_map受信 (2D boolean配列)
       - threat_grid受信 (2D number配列)
     - EnvironmentVisualizationへprops渡し:
       - :grid-width, :grid-height, :robot-position
       - :coverage-map, :threat-grid
     - RobotPositionDisplay統合 (x,y → row,col変換)

3. **Test更新**
   - EnvironmentVisualization.spec.ts拡張: 5 → 9テスト
     - 'sets correct canvas dimensions with default props' (480x480)
     - 'sets correct canvas dimensions with custom grid size' (600x720)
     - 'accepts robot position prop' ({x: 2, y: 3})
     - 'accepts coverage map prop' (2x2 boolean[][])
     - 'accepts threat grid prop' (2x2 number[][])
   - Training Session Page tests: Element Plus stubbing維持
   - 全296テストパス (292 → 296, +4テスト)

4. **エラー修正**
   - 問題1: `<style lang="scss" scoped">` - 誤った引用符
     - 解決: `<style lang="scss" scoped>` に修正
   - 問題2: Edit tool使用前にRead toolが必要
     - 解決: 全Edit前にRead実行パターン確立

5. **Code Quality**
   - Lint: 0 errors
   - TypeScript: 0 errors (strict mode)
   - Build: 1.97 MB成功
   - Tests: 296 unit tests passing (100%)

**成果物**:
- ✅ EnvironmentVisualization.vue: Canvas 2D完全実装
- ✅ Training Session Page: 環境データ完全統合
- ✅ Tests: 296 passing (292 + 4 new tests)
- ✅ Git commit: "feat: Implement Phase 22 - Environment Visualization Integration"

**技術的発見**:
1. **Canvas 2D レイヤーレンダリング**
   - 描画順序が重要: Background → Overlay → Grid → Robot → Legend
   - clearRect()で毎回クリアしてから再描画が安定

2. **色補間アルゴリズム**
   - 脅威レベル0 = #f0f0f0 (灰色)
   - 脅威レベル0.1-1.0 = rgb(255, 255*(1-level), 0) で黄→赤
   - Math.floor()で整数値に変換

3. **Vue Reactivity with Canvas**
   - watch()でprops変更を監視
   - deep: true で配列の変更も検知
   - canvas.valueの存在チェックが必須

4. **WebSocket Data Flow**
   - Backend → WebSocket → handleEnvironmentUpdate()
   - → ref変数更新 → watch() trigger → drawEnvironment()
   - リアルタイム更新が自動的に動作

**次のステップ**:
- [ ] Phase 23以降の継続
- [ ] Interactive map features (zoom/pan)
- [ ] Chart export functionality
- [ ] Visual regression tests

**時間**: 約60分
**コミット**: Phase 22完全達成

---

### Session 021 - Phase 21 WebSocket Features Enhancement (2025-10-13)

**目的**: Phase 21完全達成 - WebSocket機能拡張（training_status, training_error, environment_update）

**実施内容**:
1. **Training Status Handler拡張**
   - 問題: training_statusがconsole.logのみで、UIに表示されていない
   - 解決:
     - ステータスアラート表示機能追加
     - ステータスタイプ自動判定（success/warning/error/info）
     - running, started, completed, paused, failed, error対応
     - 5秒後の自動非表示（エラーは永続）
     - ユーザーによる手動クローズ対応

2. **Training Error Handler追加**
   - 新しいイベントハンドラー: handleTrainingError
   - training_errorメッセージ受信
   - エラー内容をアラート表示
   - フォーマット: "Error ({error_type}): {error_message}"
   - 永続的なエラー表示（自動非表示なし）

3. **Environment Update Handler追加**
   - 新しいイベントハンドラー: handleEnvironmentUpdate
   - environment_updateメッセージ受信
   - ロボット位置追跡 (x, y座標)
   - 最後のアクション表示
   - 最後の報酬表示
   - オブジェクトと配列両フォーマット対応

4. **UI拡張**
   - Status Alert Card追加
     - タイトル: Training Status
     - 動的タイプ（success/warning/error/info）
     - クローズ可能
   - Environment State Card追加
     - Robot Position X, Y (小数点2桁)
     - Last Action
     - Last Reward (小数点4桁)
     - robotPositionがnullの場合は非表示

5. **WebSocketイベント登録**
   - on('training_error', handleTrainingError)
   - on('environment_update', handleEnvironmentUpdate)
   - off()でのクリーンアップ追加

6. **Test更新**
   - Training Session Page tests拡張
     - 全6イベントハンドラー登録確認
     - 初期状態でステータスアラート非表示確認
     - robotPosition nullで環境カード非表示確認
     - realtimeMetricsプロパティ拡張（coverageRatio, explorationScore）
   - 全292テストパス (100%)

7. **Code Quality**
   - Lint fix実行: 0 errors, 45 warnings (acceptable)
   - Build: 1.97 MB成功
   - Tests: 292 passed (289 unit + 3 new tests)

**成果物**:
- ✅ Training Session Page: 3つの新WebSocketハンドラー追加
- ✅ UI: Status Alert + Environment State Card
- ✅ Test: 292 tests passing (100%)

**技術的発見**:
1. **ステータスベースのアラート表示**
   - 5秒タイマーによる自動非表示が有効
   - エラーのみ永続表示でユーザーの気づきを確保

2. **柔軟なデータフォーマット対応**
   - robot_position: オブジェクト ({x, y}) と配列 ([x, y]) 両対応
   - message.data.* と message.* 両フォーマット対応
   - バックエンドの変更に柔軟に対応可能

3. **条件付きUI表示**
   - v-if="robotPosition" でEnvironment Cardを条件表示
   - データが利用可能になった時点で自動表示

**次のステップ**:
- [ ] Phase 22以降の継続 (次の要件に従う)
- [ ] Chart export functionality (PNG/CSV download)
- [ ] Visual environment map with robot position

**時間**: 約45分
**コミット**: Phase 21完全達成

---

### Session 020 - Phase 20 Coverage & Exploration Charts (2025-10-13)

**目的**: Phase 20完全達成 - Coverage & Exploration チャートの追加実装

**実施内容**:
1. **RealtimeMetrics Interface拡張**
   - 問題: CoverageとExplorationメトリクスが表示されていない
   - 解決: 
     - `coverageRatio: number | null` フィールド追加
     - `explorationScore: number | null` フィールド追加

2. **TrainingMetrics.vue拡張**
   - Coverage Chart追加 (青色テーマ、0-1スケール)
     - borderColor: 'rgb(54, 162, 235)'
     - y軸: min: 0, max: 1 (固定範囲)
   - Exploration Chart追加 (黄色テーマ)
     - borderColor: 'rgb(255, 206, 86)'
   - watch関数更新: 4チャート対応 (Reward, Loss, Coverage, Exploration)
   - 条件付き更新: null値の場合はチャート更新スキップ
   - Summary stats拡張: 4メトリクス → 6メトリクス
     - Coverage: パーセント表示 (0-100%)
     - Exploration: スコア表示 (0-1範囲)
   - レイアウト変更: span="6" → span="4" (6カラムグリッド)
   - カラースタイリング追加:
     - Coverage: #409eff (青)
     - Exploration: #e6a23c (黄)

3. **Training Session Page更新**
   - WebSocketハンドラー拡張
     - `coverage_ratio` 受信処理追加
     - `exploration_score` 受信処理追加
     - message.data.* と message.* の両フォーマット対応
   - currentMetrics型拡張

4. **Test更新**
   - TrainingMetrics.spec.ts:
     - モックデータに coverageRatio と explorationScore 追加
     - canvas要素数の assertion 更新: 2 → 4
   - Training Session Page tests:
     - props検証に新フィールド追加
   - 全289テストパス (100%)

5. **Code Quality**
   - Lint fix実行: 0 errors, 44 warnings (acceptable)
   - Build: 1.97 MB成功
   - Tests: 289 unit tests passing (100%)

**成果物**:
- ✅ TrainingMetrics.vue: 4チャート対応 (Reward, Loss, Coverage, Exploration)
- ✅ Training Session Page: WebSocket統合完全版
- ✅ RealtimeMetrics interface: 6メトリクス完全対応
- ✅ Total: 289 tests passing (100%)

**技術的発見**:
1. **Chart.js スケール設定**
   - Coverage Ratio は 0-1 の固定範囲が望ましい
   - y軸に min: 0, max: 1 を設定することで視覚的に把握しやすい

2. **条件付きチャート更新**
   - null値の場合はupdateData()を呼ばない設計が重要
   - Loss, Coverage, Explorationは初期値がnullの可能性があるため

3. **レスポンシブグリッド設計**
   - 6メトリクスを等幅表示: span="4" (24/6=4)
   - Element Plusの24グリッドシステム活用

**次のステップ**:
- [ ] Phase 21以降の継続 (次の要件に従う)
- [ ] Additional WebSocket event handlers (training_status, training_error等)
- [ ] Chart export functionality (PNG/CSV)

**時間**: 約30分
**コミット**: Phase 20完全達成

---

### Session 017 - Phase 17 WebSocket Integration Complete (2025-10-12)

**目的**: Phase 17完全達成 - useWebSocket refactoring、テスト修正、Training UI統合

**実施内容**:
1. **useWebSocket.ts修正**
   - 問題: `onBeforeUnmount`と`readonly`のインポート漏れ
   - 解決: インポート追加 → テスト16個全パス

2. **Test Infrastructure構築**
   - tests/setup.ts作成: Nuxt auto-imports (useTraining, useRouter, useRoute等) のグローバルモック
   - vitest.config.ts更新: setupFiles設定追加
   - 効果: コンポーネント/ページテストでのReferenceError解消

3. **TrainingControl.vue & テスト更新**
   - 問題: コンポーネント実装が大幅変更されていたが、テストが古いまま
   - 解決策:
     - TrainingControl.spec.ts完全書き直し
     - 新しいフォーム実装に対応 (showForm toggle, 設定フォーム)
     - Element Plusコンポーネント完全スタブ化
     - useTraining/useRouter/ElMessageモック追加
   - 結果: 5テスト全パス

4. **training/index.vue & テスト更新**
   - 問題: useTraining/useRouterが未定義 → ReferenceError
   - 解決策:
     - training/index.spec.ts完全書き直し
     - shallow: true採用でシンプル化
     - El-*コンポーネント全スタブ化
     - v-loadingディレクティブモック追加
   - 未使用変数削除: `currentSession` in pages/training/index.vue
   - 結果: 4テスト全パス

5. **Code Quality**
   - Lint: 0 errors, 41 warnings (test `any` types - acceptable)
   - Build: 1.97 MB成功
   - Tests: 285 unit tests passing (100%)

**成果物**:
- ✅ useWebSocket.ts: Native WebSocket完全実装
- ✅ tests/setup.ts: グローバルテストインフラ
- ✅ TrainingControl.spec.ts: 5テスト (新実装対応)
- ✅ training/index.spec.ts: 4テスト (shallow rendering)
- ✅ Total: 313 tests passing (285 unit + 28 E2E)

**技術的発見**:
1. **Nuxt auto-importsとテスト**
   - 問題: useTraining, useRouter等がグローバル関数だが、テスト環境では未定義
   - 解決: tests/setup.tsでvi.stubGlobal()またはglobal.xxx = vi.fn()
   - 教訓: Nuxt composablesは必ずグローバルモックが必要

2. **Element Plusとshallow rendering**
   - shallow: true使用時は、子コンポーネントが完全スタブ化される
   - el-tableのスロットが正しく動作しない可能性
   - 解決策: stubsで全El-*コンポーネントを明示的に定義

3. **v-loadingディレクティブ**
   - Element Plusのv-loadingもモックが必要
   - `directives: { loading: () => {} }` で解決

**次のステップ**:
- [ ] Phase 18以降の継続 (より高度なWebSocket機能)
- [ ] Real-time chart updates with WebSocket data
- [ ] E2E tests for WebSocket functionality

**時間**: 約90分
**コミット**: Phase 17完全達成

---

### Session 016 - WebSocket Integration Start (2025-10-11)

**目的**: WebSocket統合の開始 - バックエンド分析とテストページ作成

**実施内容**:
1. **プロジェクト状況確認**
   - Phase 1-16完了確認
   - 281ユニットテスト + 28 E2Eテスト全パス
   - Lint/Buildエラー修正

2. **Code Quality Improvements**
   - ESLint errors修正: 107 problems → 0 errors, 36 warnings
   - Import順序自動修正 (pnpm lint:fix)
   - 未使用変数削除:
     - pages/models/index.vue: error → _error → catch without variable
     - pages/playback/[sessionId].vue: ref削除, formatTimestep/formatReward削除

3. **Backend WebSocket Analysis**
   - バックエンド探索: `/home/maya/work/security-robot-be/`
   - WebSocket実装確認:
     - エンドポイント: `/ws/v1/training/{session_id}`
     - コールバック: `rl/callbacks/websocket_callback.py`
     - スキーマ: `app/schemas/websocket.py`
   - メッセージタイプ確認:
     - training_progress (timestep, episode, reward, loss, coverage_ratio, exploration_score)
     - training_status (status, message)
     - training_error (error_message, error_type)
     - environment_update (robot_position, action_taken, reward_received)
     - connection_ack, ping/pong

4. **WebSocket Test Page Implementation**
   - ファイル作成: `pages/websocket-test.vue`
   - 機能:
     - Native WebSocket実装 (Socket.IOではない)
     - Session ID指定可能
     - Connect/Disconnect制御
     - リアルタイムメッセージ表示（タイムスタンプ付き）
     - Ping送信機能
     - JSON message送信（バリデーション付き）
     - メッセージログ（最大100件、スクロール可能）
   - テンプレート修正:
     - エスケープJSON問題修正 → loadPingExample()関数化

5. **Build & Lint**
   - ビルド成功: 1.97 MB (前回1.96 MB)
   - Lint: 0 errors, 36 warnings (acceptable - test code `any` types)

**成果物**:
- ✅ WebSocket test page: pages/websocket-test.vue
- ✅ Code quality: 0 lint errors
- ✅ Build: 1.97 MB production bundle
- ✅ All 281 unit tests passing

**技術的発見**:
1. **バックエンドはSocket.IOではなくネイティブWebSocket使用**
   - useWebSocket.tsの現在の実装はSocket.IO依存
   - 次フェーズでネイティブWebSocketに書き換え必要

2. **WebSocketメッセージフォーマット**
   - すべてJSON形式
   - type フィールドで種別判定
   - session_id フィールドでセッション識別

3. **接続フロー**
   - 接続時: session_idの存在確認
   - 認証: connection_ackで接続確認
   - Keep-alive: ping/pongメカニズム

**次のステップ**:
- [ ] useWebSocket.ts refactoring (Socket.IO → Native WebSocket)
- [ ] Training page integration with WebSocket
- [ ] Real-time progress display on training page
- [ ] Error handling and reconnection logic

**時間**: 約1時間
**コミット**: Phase 17開始時点

---

## 🔗 過去の記録

- [DIARY01 (Session 001-015)](./DIARY01.md) - 2025-10-06 ~ 2025-10-09
- [DIARY01 総括](./summary/DIARY01.md) - Phase 1-16の総括

---

**開始日**: 2025-10-11
**対象セッション**: Session 016以降
