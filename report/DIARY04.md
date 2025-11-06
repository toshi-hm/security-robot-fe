# セキュリティロボット強化学習システム - 開発日記 (DIARY04)

このファイルは最新のセッションログを記録します。作業前に `report/summary/` と `report/PROGRESS.md` を確認してください。

## 📑 目次
- [YYYY-MM-DD セッションXX](#yyyy-mm-dd-セッションxx)

---

## 2025-11-07 セッション043 - コンポーネント分割方針策定

### 🎯 セッション目標
- 各ページに直接定義されているUI要素を調査し、コンポーネント分割の方針を立てる
- ページごとに分割可能な要素を特定し、優先順位をつける
- 再利用可能なコンポーネントの設計方針を決定する

### ✅ 実施内容

#### 1. ページ構成の調査

全13ページファイルを調査し、現在のコンポーネント利用状況を確認:

**メインページ:**
- `pages/index.vue` (Dashboard)
- `pages/training/index.vue` (Training List)
- `pages/training/[sessionId]/index.vue` (Training Detail)
- `pages/playback/index.vue` (Playback List)
- `pages/playback/[sessionId].vue` (Playback Detail)
- `pages/models/index.vue` (Models)
- `pages/settings/index.vue` (Settings Index)
- `pages/settings/environment.vue` (Environment Settings)
- `pages/settings/training.vue` (Training Settings)

**既存コンポーネント (19個):**
- Common: AppHeader, AppSidebar, LoadingSpinner, ErrorAlert
- Training: TrainingControl, TrainingProgress, TrainingMetrics, ConfigurationPanel
- Playback: PlaybackControl, PlaybackSpeed, PlaybackTimeline
- Environment: EnvironmentVisualization, RobotPositionDisplay, CoverageMap, ThreatLevelMap
- Visualization: RewardChart, LossChart, CoverageChart, ExplorationChart

#### 2. ページごとの分割可能要素の特定

##### **A. Dashboard (pages/index.vue) - 優先度: 高**

**現状:** 全UI要素がページ内に直接定義されている

**分割案:**
1. **StatisticsCard** (統計カード) - 再利用性: 高
   - Props: title, value, label, icon, colorTheme, tagText
   - 用途: Training/Models/Playback統計
   - デザイン: グラデーション背景、ホバーエフェクト

2. **QuickActionButtons** (クイックアクション) - 再利用性: 中
   - Props: actions (配列: icon, label, type, link)
   - 用途: Dashboard専用 (将来的に他ページでも使用可能)

##### **B. Training List (pages/training/index.vue) - 優先度: 中**

**現状:** TrainingControlコンポーネントを使用、テーブル部分はページ内定義

**分割案:**
1. **TrainingSessionTable** (セッションテーブル) - 再利用性: 中
   - Props: sessions, isLoading, onRowClick
   - 機能: ステータス表示、進捗バー、アクション列
   - ロジック: getStatusType, getStatusText (メソッド化)

2. **SessionStatusTag** (ステータスタグ) - 再利用性: 高
   - Props: status
   - 用途: Training, Playback両方で使用可能
   - 機能: ステータスに応じた色とテキスト表示

##### **C. Training Detail (pages/training/[sessionId]/index.vue) - 優先度: 低**

**現状:** 既存コンポーネント (TrainingMetrics, EnvironmentVisualization等) を適切に使用

**分割案:**
1. **ConnectionStatusBadge** (接続状態バッジ) - 再利用性: 高
   - Props: isConnected, connectionType ('WebSocket' | 'Polling')
   - 用途: WebSocket接続状態の表示

2. **MetricsDisplay** (メトリクス表示) - 再利用性: 中
   - Props: metrics (timestep, episode, reward, loss)
   - 機能: el-descriptionsのラッパー
   - ※ 優先度低 (現在のel-descriptionsで十分)

##### **D. Playback List (pages/playback/index.vue) - 優先度: 高**

**現状:** 統計カード、検索フィルター、テーブルがページ内定義

**分割案:**
1. **StatisticsCard** (統計カード) - 再利用性: 高
   - ※ Dashboard と共通化可能 (A-1と同じ)

2. **SearchFilter** (検索フィルター) - 再利用性: 高
   - Props: modelValue, placeholder, onSearch
   - 用途: 全リストページ (Training, Playback, Models)

3. **PlaybackSessionTable** (再生セッションテーブル) - 再利用性: 低
   - Props: sessions, isLoading, onRowClick
   - 機能: フレーム数、継続時間、日時表示
   - ヘルパー: formatDuration, formatDate (共通化)

##### **E. Playback Detail (pages/playback/[sessionId].vue) - 優先度: 低**

**現状:** 既存コンポーネント (PlaybackControl, EnvironmentVisualization等) を適切に使用

**分割案:**
1. **FrameInfoDisplay** (フレーム情報) - 再利用性: 低
   - Props: frameIndex, totalFrames, reward, timestamp
   - ※ 優先度低 (現在のel-descriptionsで十分)

##### **F. Models (pages/models/index.vue) - 優先度: 中**

**現状:** テーブル、アップロードダイアログがページ内定義

**分割案:**
1. **ModelUploadDialog** (アップロードダイアログ) - 再利用性: 中
   - Props: visible, onUpload, onCancel
   - 機能: ドラッグ&ドロップ、プログレスバー
   - State: uploadFile, uploadProgress

2. **ModelTable** (モデルテーブル) - 再利用性: 低
   - Props: models, isLoading, onDownload, onDelete
   - ヘルパー: formatFileSize, formatDate (共通化)

##### **G. Settings Index (pages/settings/index.vue) - 優先度: 低**

**現状:** 設定カードがページ内定義

**分割案:**
1. **SettingsCard** (設定カード) - 再利用性: 中
   - Props: title, description, currentSettings (配列), onClick
   - 機能: 現在の設定値表示、アクションボタン
   - ※ 優先度低 (ページ固有のレイアウト)

#### 3. 共通ヘルパー関数の抽出

以下の関数を `utils/` に移動して共通化:

1. **formatters.ts** (既存ファイル拡張)
   - `formatFileSize(bytes: number): string` - Models
   - `formatDate(date: string | Date): string` - Playback, Models
   - `formatDuration(seconds: number): string` - Playback

2. **validators.ts** (既存ファイル)
   - 既存のバリデーション関数を保持

3. **mappers.ts** (新規作成)
   - `getStatusType(status: string): 'success' | 'warning' | 'info' | 'danger'`
   - `getStatusText(status: string): string`
   - `getEnvironmentTypeLabel(type: string): string`
   - `getThreatLevelLabel(level: string): string`
   - `getAlgorithmLabel(algo: string): string`

### 📊 コンポーネント分割の優先順位

#### Phase 1: 高再利用性・高頻度コンポーネント (優先度: 最高)

1. **StatisticsCard** - Dashboard, Playback (2ページ)
2. **SearchFilter** - Training, Playback, Models (3ページ)
3. **SessionStatusTag** - Training, Playback (2ページ)

#### Phase 2: 中再利用性コンポーネント (優先度: 高)

4. **TrainingSessionTable** - Training List
5. **ModelUploadDialog** - Models
6. **ConnectionStatusBadge** - Training Detail

#### Phase 3: ページ固有コンポーネント (優先度: 中)

7. **PlaybackSessionTable** - Playback List
8. **ModelTable** - Models
9. **QuickActionButtons** - Dashboard

#### Phase 4: 共通ヘルパー関数の整理 (優先度: 中)

10. `utils/mappers.ts` 作成 (ステータス・ラベル変換)
11. `utils/formatters.ts` 拡張 (日付・ファイルサイズ・時間)

### 🎨 設計方針

#### 1. コンポーネント設計の原則

- **単一責任の原則**: 1コンポーネント = 1つの明確な役割
- **再利用性の最大化**: 複数ページで使用可能な汎用設計
- **Props駆動**: 状態管理はページ側、表示ロジックはコンポーネント側
- **TypeScript型安全性**: 全Propsに型定義
- **BEM命名規則**: CSS class名の統一
- **Material Design 3**: 既存のMD3カラー変数を使用

#### 2. ディレクトリ構成

```
components/
├── common/          # 既存 (AppHeader, LoadingSpinner等)
│   ├── StatisticsCard.vue          # NEW - Phase 1
│   ├── SearchFilter.vue            # NEW - Phase 1
│   └── SessionStatusTag.vue        # NEW - Phase 1
├── training/        # 既存 (TrainingControl等)
│   ├── TrainingSessionTable.vue    # NEW - Phase 2
│   └── ConnectionStatusBadge.vue   # NEW - Phase 2
├── playback/        # 既存 (PlaybackControl等)
│   └── PlaybackSessionTable.vue    # NEW - Phase 3
├── models/          # NEW ディレクトリ
│   ├── ModelUploadDialog.vue       # NEW - Phase 2
│   └── ModelTable.vue              # NEW - Phase 3
├── dashboard/       # NEW ディレクトリ
│   └── QuickActionButtons.vue      # NEW - Phase 3
├── environment/     # 既存 (変更なし)
└── visualization/   # 既存 (変更なし)

utils/
├── formatters.ts    # 拡張 - Phase 4
├── validators.ts    # 既存 (変更なし)
└── mappers.ts       # NEW - Phase 4
```

#### 3. テスト戦略

- 各新規コンポーネント: 5-10テストケース
- Props validation, Emit events, UI rendering
- 既存ページテスト: コンポーネント分割後も100%維持
- カバレッジ目標: 85%以上維持

### 📋 実装計画

#### Session 044: Phase 1実装 (高再利用性コンポーネント)

**目標:** StatisticsCard, SearchFilter, SessionStatusTag作成

**作業内容:**
1. `components/common/StatisticsCard.vue` 作成
   - Props: title, value, label, icon, colorTheme, tagText
   - TDD: 5テスト (Props, グラデーション, ホバー, アイコン, タグ)
2. `components/common/SearchFilter.vue` 作成
   - Props: modelValue, placeholder
   - Emits: update:modelValue, search
   - TDD: 5テスト (v-model, search, clear, prefix icon, placeholder)
3. `components/common/SessionStatusTag.vue` 作成
   - Props: status
   - TDD: 5テスト (各ステータス: running, paused, completed, failed, created)
4. Dashboard, Playback List ページ更新
   - 既存UI削除 → コンポーネントimport
   - テスト更新 (コンポーネントスタブ追加)

**期待成果:**
- 新規コンポーネント: 3個 (15テスト)
- 更新ページ: 2個 (Dashboard, Playback List)
- 全テスト: 478 → 493 (+15)
- カバレッジ: 98%維持

#### Session 045: Phase 2実装 (中再利用性コンポーネント)

**目標:** TrainingSessionTable, ModelUploadDialog, ConnectionStatusBadge作成

#### Session 046: Phase 3実装 (ページ固有コンポーネント)

**目標:** PlaybackSessionTable, ModelTable, QuickActionButtons作成

#### Session 047: Phase 4実装 (共通ヘルパー関数)

**目標:** utils/mappers.ts作成、formatters.ts拡張、全ページでヘルパー使用

### 🧠 学んだこと・課題

#### 学んだこと
1. **現在のコンポーネント利用状況は良好**
   - Training/Playback詳細ページ: 既存コンポーネントを適切に使用
   - Environment/Visualization: 完全にコンポーネント化済み
   - 問題: Dashboard, List系ページが直接定義

2. **再利用性の観点でグルーピング可能**
   - 高再利用性: StatisticsCard, SearchFilter, SessionStatusTag
   - 中再利用性: Table系、Dialog系
   - 低再利用性: ページ固有レイアウト

3. **共通ヘルパー関数の重複が多い**
   - formatDate, formatFileSize, formatDuration
   - getStatusType, getStatusText
   - ラベル変換系 (Environment, Algorithm, ThreatLevel)

#### 課題
1. **テスト工数の見積もり**
   - 新規コンポーネント9個 × 平均7テスト = 63テスト追加
   - 既存ページテスト更新: 6ページ × 平均3テスト修正 = 18テスト修正
   - 合計工数: 4セッション見込み

2. **Element Plusコンポーネントの依存**
   - el-card, el-table, el-dialogを多用
   - テストでのスタブ設定が必要
   - 既存パターンを踏襲

3. **Material Design 3カラーの適用**
   - 既存CSS変数 (--md-primary, --md-surface等) を使用
   - グラデーション背景、ホバーエフェクトの統一

### ⏭️ 次回セッション (044) の予定

1. **Phase 1実装開始**
   - StatisticsCard.vue作成 (TDD: Red → Green → Refactor)
   - SearchFilter.vue作成 (TDD: Red → Green → Refactor)
   - SessionStatusTag.vue作成 (TDD: Red → Green → Refactor)

2. **ページ更新**
   - Dashboard (pages/index.vue) → StatisticsCard使用
   - Playback List (pages/playback/index.vue) → StatisticsCard + SearchFilter使用

3. **テスト実行**
   - 全テスト実行: 478 → 493 (+15)
   - カバレッジ確認: 98%維持

4. **Git commit & push**
   - コミットメッセージ: "feat(components): Implement Phase 1 - High reusability components (StatisticsCard, SearchFilter, SessionStatusTag)"

### 🔗 関連コミット
- (次セッションで記録)