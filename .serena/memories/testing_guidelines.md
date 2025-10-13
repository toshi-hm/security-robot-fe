# テストガイドライン

## テスト戦略

### テストピラミッド
```
        E2E Test (5%)
       /─────────────\
      /  Integration  \  (15%)
     /─────────────────\
    /   Unit Test      \  (80%)
   /─────────────────────\
```

## 単体テスト（Vitest）

### 実行コマンド
```bash
pnpm test                    # 全テスト実行
pnpm test -- --coverage      # カバレッジ付き
pnpm test <file>             # 特定ファイル
pnpm test -- --watch         # Watch mode
```

### カバレッジ目標
- **総合**: 85%以上
- **現状**: 68.99%（実質100% - config/plugin除く）

### テスト配置
```
tests/
├── unit/
│   ├── libs/
│   │   ├── domains/        # ドメインテスト
│   │   ├── repositories/   # リポジトリテスト
│   │   └── entities/       # エンティティテスト
│   ├── composables/        # Composableテスト
│   ├── components/         # コンポーネントテスト
│   ├── stores/             # Storeテスト
│   ├── pages/              # ページテスト
│   └── utils/              # ユーティリティテスト
└── setup.ts                # グローバルモック設定
```

### テストパターン

#### ドメインモデル
```typescript
// tests/unit/libs/domains/training/TrainingSession.spec.ts
describe('TrainingSession', () => {
  it('should calculate progress correctly', () => {
    const session = new TrainingSession(/* ... */)
    expect(session.progress).toBe(50)
  })
  
  it('should validate timesteps', () => {
    expect(() => new TrainingSession(/* invalid */))
      .toThrow('Total timesteps must be at least 1000')
  })
})
```

#### Composable
```typescript
// tests/unit/composables/useTraining.spec.ts
describe('useTraining', () => {
  it('should fetch sessions', async () => {
    const mockRepo = {
      findAll: vi.fn().mockResolvedValue([/* ... */])
    }
    
    const { sessions, fetchSessions } = useTraining(mockRepo)
    await fetchSessions()
    
    expect(sessions.value).toHaveLength(2)
  })
})
```

#### Vue Component
```typescript
// tests/unit/components/training/TrainingControl.spec.ts
describe('TrainingControl', () => {
  it('should render form', () => {
    const wrapper = mount(TrainingControl)
    expect(wrapper.find('[data-testid="session-name"]').exists()).toBe(true)
  })
  
  it('should emit event on submit', async () => {
    const wrapper = mount(TrainingControl)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
```

## E2Eテスト（Playwright）

### 実行コマンド
```bash
pnpm e2e                     # 全E2Eテスト
pnpm e2e -- --headed         # ブラウザ表示
pnpm e2e -- --debug          # デバッグモード
```

### テスト配置
```
tests/
└── e2e/
    ├── training-workflow.spec.ts
    ├── playback-workflow.spec.ts
    ├── models-workflow.spec.ts
    └── page-objects/        # Page Object Pattern
```

### E2Eテストパターン
```typescript
// tests/e2e/training-workflow.spec.ts
test('should create training session', async ({ page }) => {
  await page.goto('/training')
  await page.fill('[data-testid="session-name"]', 'Test Session')
  await page.click('[data-testid="start-button"]')
  await expect(page.locator('.el-message--success')).toBeVisible()
})
```

## TDD実践

### Red-Green-Refactor

#### 1. Red（テスト失敗）
```bash
# テストを先に書く
# tests/unit/composables/useNewFeature.spec.ts

describe('useNewFeature', () => {
  it('should do something', () => {
    const { result } = useNewFeature()
    expect(result.value).toBe('expected')
  })
})

# 実行 → 失敗確認
pnpm test
```

#### 2. Green（最小実装）
```typescript
// composables/useNewFeature.ts
export const useNewFeature = () => {
  const result = ref('expected')  // 最小限の実装
  return { result }
}

# 実行 → 成功確認
pnpm test
```

#### 3. Refactor（リファクタリング）
```typescript
// composables/useNewFeature.ts
export const useNewFeature = () => {
  // きれいなコードに書き直す
  const result = computed(() => calculateResult())
  return { result }
}

# 実行 → 引き続き成功
pnpm test
```

## モック・スタブ

### グローバルモック（tests/setup.ts）
```typescript
// Nuxt auto-imports
vi.stubGlobal('useTraining', vi.fn())
vi.stubGlobal('useRouter', vi.fn())
vi.stubGlobal('useRoute', vi.fn())

// Nuxt app
vi.stubGlobal('useNuxtApp', vi.fn(() => ({
  $api: mockApi
})))
```

### Element Plusモック
```typescript
import { config } from '@vue/test-utils'

config.global.stubs = {
  'el-button': true,
  'el-form': true,
  'el-input': true,
  // ...
}
```

### WebSocketモック
```typescript
// tests/unit/composables/useWebSocket.spec.ts
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
}

global.WebSocket = vi.fn(() => mockWebSocket)
```

## 依存性注入パターン

### Composable with DI
```typescript
// composables/useTraining.ts
export const useTraining = (
  repository: TrainingRepository = new TrainingRepositoryImpl()
) => {
  // repositoryを使用
}

// Test
const mockRepo = { findAll: vi.fn() }
const { sessions } = useTraining(mockRepo)
```

## カバレッジ確認

### レポート生成
```bash
pnpm test -- --coverage

# HTMLレポート: coverage/index.html
```

### 除外対象
- `node_modules/`
- `tests/`
- `**/*.spec.ts`
- `**/*.test.ts`
- `.nuxt/`
- `nuxt.config.ts`
- `vitest.config.ts`

## トラブルシューティング

### テスト失敗
```bash
# 詳細ログ
pnpm test -- --reporter=verbose

# 特定ファイルのみ
pnpm test tests/unit/specific.spec.ts
```

### モックが効かない
```typescript
// vi.mock()の位置確認（import前に配置）
vi.mock('~/composables/useTraining')
import { useTraining } from '~/composables/useTraining'
```

### Element Plusエラー
```typescript
// shallow renderingを使用
const wrapper = mount(Component, {
  shallow: true,
  global: {
    stubs: {
      'el-button': true,
      'el-form': true,
    }
  }
})
```

## ベストプラクティス

1. **テストは読みやすく**: describe/itで明確な構造
2. **AAA Pattern**: Arrange → Act → Assert
3. **DRY原則**: beforeEachで共通setup
4. **独立性**: 各テストは独立して実行可能
5. **高速化**: 不要な待機・遅延なし
6. **リアル環境**: 可能な限りモックを避ける
7. **Edge Cases**: 境界値・エラーケースもカバー
